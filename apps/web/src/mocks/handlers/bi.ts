import { http, HttpResponse } from 'msw';
import type {
  BiCostsView,
  BiCustomersView,
  BiOverviewView,
  BiRetentionView,
  BiRevenueView,
  BiSalesView,
  BiUsageView,
  OpportunityStage,
} from '@factory/shared';
import { db } from '../db';
import {
  MOVEMENT_ASSUMPTIONS,
  costRamp,
  monthKey,
  projectMonthly,
  revenueRamp,
  trailingMonths,
} from '../lib/finance-history';
import { payrollBucket, supplierBucket } from '../lib/pnl-mapping';
import {
  cac,
  grr,
  ltv,
  magicNumber,
  nrr,
  paybackMonths,
  ruleOf40,
  runwayMonths,
  toBps,
} from '../lib/saas-metrics';

function currentActiveMrr(): number {
  return db.customers.filter((c) => c.active).reduce((s, c) => s + c.mrrCents, 0);
}

function currentBuckets(): { cogs: number; rnd: number; sm: number; ga: number } {
  const b = { cogs: 0, rnd: 0, sm: 0, ga: 0 };
  for (const contract of db.contracts) {
    if (contract.status !== 'active') continue;
    const supplier = db.suppliers.find((s) => s.id === contract.supplierId);
    b[supplierBucket(supplier?.category ?? 'other')] += contract.monthlyAmountCents;
  }
  for (const entry of db.payrollEntries) {
    if (entry.cadence !== 'monthly') continue;
    const person = db.people.find((p) => p.id === entry.personId);
    b[payrollBucket(entry, person)] += entry.grossAmountCents;
  }
  return b;
}

function committedArrCents(): number {
  const won = db.opportunities.filter((o) => o.stage === 'close_won');
  return won.reduce((s, o) => s + o.amountCents, 0);
}

export const biHandlers = [
  http.get('/api/bi/customers', () => {
    const active = db.customers.filter((c) => c.active);
    const countryOf = (accountId: string) =>
      db.accounts.find((a) => a.id === accountId)?.country ?? '—';
    const accountNameOf = (accountId: string) =>
      db.accounts.find((a) => a.id === accountId)?.name ?? '—';

    const byCountryMap = new Map<string, { customers: number; mrrCents: number }>();
    for (const c of active) {
      const country = countryOf(c.accountId);
      const cur = byCountryMap.get(country) ?? { customers: 0, mrrCents: 0 };
      cur.customers += 1;
      cur.mrrCents += c.mrrCents;
      byCountryMap.set(country, cur);
    }

    // Roll subscriptions up to the account level for attach + concentration.
    const perAccount = new Map<string, { name: string; mrrCents: number; products: Set<string> }>();
    for (const c of active) {
      const cur =
        perAccount.get(c.accountId) ??
        { name: accountNameOf(c.accountId), mrrCents: 0, products: new Set<string>() };
      cur.mrrCents += c.mrrCents;
      cur.products.add(c.productCode);
      perAccount.set(c.accountId, cur);
    }

    const attachBuckets = new Map<number, { customerCount: number; mrrCents: number }>();
    for (const acct of perAccount.values()) {
      const k = acct.products.size;
      const cur = attachBuckets.get(k) ?? { customerCount: 0, mrrCents: 0 };
      cur.customerCount += 1;
      cur.mrrCents += acct.mrrCents;
      attachBuckets.set(k, cur);
    }

    const sortedAccounts = [...perAccount.values()].sort((a, b) => b.mrrCents - a.mrrCents);
    const totalMrr = sortedAccounts.reduce((s, a) => s + a.mrrCents, 0);
    const top10Mrr = sortedAccounts.slice(0, 10).reduce((s, a) => s + a.mrrCents, 0);

    const view: BiCustomersView = {
      totalCustomers: db.customers.length,
      activeCustomers: active.length,
      totalMrrCents: totalMrr,
      byCountry: [...byCountryMap.entries()]
        .map(([country, v]) => ({ country, customers: v.customers, mrrCents: v.mrrCents }))
        .sort((a, b) => b.mrrCents - a.mrrCents),
      topAccounts: sortedAccounts
        .slice(0, 10)
        .map((v) => ({ accountName: v.name, mrrCents: v.mrrCents })),
      attach: [...attachBuckets.entries()]
        .map(([productCount, v]) => ({
          productCount,
          customerCount: v.customerCount,
          mrrCents: v.mrrCents,
        }))
        .sort((a, b) => a.productCount - b.productCount),
      concentration: {
        top10ShareBps: totalMrr === 0 ? 0 : toBps(top10Mrr / totalMrr),
      },
    };
    return HttpResponse.json(view);
  }),

  http.get('/api/bi/revenue', () => {
    const mrr = currentActiveMrr();
    const months = revenueRamp(6);

    const monthlySeries = months.map(({ month, factor }) => ({
      month,
      mrrCents: projectMonthly(mrr, factor),
    }));

    const byProductMap = new Map<string, { productCode: string; productName: string; mrrCents: number }>();
    for (const c of db.customers.filter((x) => x.active)) {
      const name = db.products.find((p) => p.code === c.productCode)?.name ?? c.productCode;
      const cur =
        byProductMap.get(c.productCode) ??
        { productCode: c.productCode, productName: name, mrrCents: 0 };
      cur.mrrCents += c.mrrCents;
      byProductMap.set(c.productCode, cur);
    }

    // MRR movement decomposition (synthetic, using MOVEMENT_ASSUMPTIONS)
    const movement: BiRevenueView['movement'] = [];
    let prevMrr = monthlySeries[0]?.mrrCents ?? 0;
    for (let i = 0; i < monthlySeries.length; i++) {
      const current = monthlySeries[i]?.mrrCents ?? 0;
      const expansion = Math.round(prevMrr * MOVEMENT_ASSUMPTIONS.expansionRate);
      const contraction = Math.round(prevMrr * MOVEMENT_ASSUMPTIONS.contractionRate);
      const churn = Math.round(prevMrr * MOVEMENT_ASSUMPTIONS.revenueChurnRate);
      const netFromExisting = expansion - contraction - churn;
      const newMrr = Math.max(0, current - prevMrr - netFromExisting);
      const net = newMrr + expansion - contraction - churn;
      movement.push({
        month: monthlySeries[i]?.month ?? '',
        newCents: newMrr,
        expansionCents: expansion,
        contractionCents: -contraction,
        churnCents: -churn,
        netCents: net,
      });
      prevMrr = current;
    }

    const view: BiRevenueView = {
      monthlySeries,
      byProduct: [...byProductMap.values()].sort((a, b) => b.mrrCents - a.mrrCents),
      movement,
    };
    return HttpResponse.json(view);
  }),

  http.get('/api/bi/usage', () => {
    const activeCustomers = db.customers.filter((c) => c.active).length;
    const view: BiUsageView = {
      byFeature: [
        { feature: 'Dashboard',      activeUsers: activeCustomers * 12, invocations: activeCustomers * 480 },
        { feature: 'Reports',        activeUsers: activeCustomers * 9,  invocations: activeCustomers * 210 },
        { feature: 'Automations',    activeUsers: activeCustomers * 6,  invocations: activeCustomers * 340 },
        { feature: 'Team management',activeUsers: activeCustomers * 4,  invocations: activeCustomers * 88 },
        { feature: 'API',            activeUsers: activeCustomers * 3,  invocations: activeCustomers * 2100 },
        { feature: 'Data export',    activeUsers: activeCustomers * 2,  invocations: activeCustomers * 41 },
      ],
      adoptionByPlan: db.products
        .filter((p) => p.active)
        .map((p, i) => ({
          productName: p.name,
          wau: activeCustomers * (5 - i) * 3,
          mau: activeCustomers * (5 - i) * 8,
        }))
        .filter((r) => r.mau > 0),
    };
    return HttpResponse.json(view);
  }),

  http.get('/api/bi/costs', () => {
    const buckets = currentBuckets();
    const monthlyCents = buckets.cogs + buckets.rnd + buckets.sm + buckets.ga;

    const byCategoryMap = new Map<string, number>();
    const bySourceMap = new Map<string, number>();
    for (const contract of db.contracts) {
      if (contract.status !== 'active') continue;
      const category = db.suppliers.find((s) => s.id === contract.supplierId)?.category ?? 'other';
      byCategoryMap.set(category, (byCategoryMap.get(category) ?? 0) + contract.monthlyAmountCents);
      bySourceMap.set('supplier', (bySourceMap.get('supplier') ?? 0) + contract.monthlyAmountCents);
    }
    for (const entry of db.payrollEntries) {
      if (entry.cadence !== 'monthly') continue;
      const category = db.people.find((p) => p.id === entry.personId)?.type === 'freelancer' ? 'contractor' : 'salary';
      byCategoryMap.set(category, (byCategoryMap.get(category) ?? 0) + entry.grossAmountCents);
      bySourceMap.set('payroll', (bySourceMap.get('payroll') ?? 0) + entry.grossAmountCents);
    }

    const ramp = costRamp(6);
    const view: BiCostsView = {
      monthlyCents,
      byCategory: [...byCategoryMap.entries()]
        .map(([category, monthlyCents]) => ({ category, monthlyCents }))
        .sort((a, b) => b.monthlyCents - a.monthlyCents),
      bySource: [...bySourceMap.entries()]
        .map(([source, monthlyCents]) => ({ source, monthlyCents }))
        .sort((a, b) => b.monthlyCents - a.monthlyCents),
      monthlySeries: ramp.map(({ month, factor }) => ({
        month,
        monthlyCents: projectMonthly(monthlyCents, factor),
      })),
    };
    return HttpResponse.json(view);
  }),

  http.get('/api/bi/overview', () => {
    const mrr = currentActiveMrr();
    const arr = mrr * 12;
    const committed = committedArrCents();

    const expansion = Math.round(mrr * MOVEMENT_ASSUMPTIONS.expansionRate);
    const contraction = Math.round(mrr * MOVEMENT_ASSUMPTIONS.contractionRate);
    const churn = Math.round(mrr * MOVEMENT_ASSUMPTIONS.revenueChurnRate);
    const nrrFraction = nrr(mrr, expansion, contraction, churn);
    const grrFraction = grr(mrr, contraction, churn);
    const logoChurnFraction = MOVEMENT_ASSUMPTIONS.logoChurnRate;

    const buckets = currentBuckets();
    const monthlyCost = buckets.cogs + buckets.rnd + buckets.sm + buckets.ga;
    const grossProfit = mrr - buckets.cogs;
    const grossMarginFraction = mrr === 0 ? 0 : grossProfit / mrr;
    const operatingIncome = grossProfit - (buckets.rnd + buckets.sm + buckets.ga);
    const opMarginPct = mrr === 0 ? 0 : (operatingIncome / mrr) * 100;
    const monthlyBurn = Math.max(0, monthlyCost - mrr);

    const annualizedGrowthPct = (1 / 0.75 - 1) * 100 * (12 / 6);

    const smMonthly = buckets.sm;
    const smQuarter = smMonthly * 3;
    const activeLogos = db.customers.filter((c) => c.active).length;
    const newLogosThisQuarter = Math.max(1, Math.round(activeLogos / 4));
    const cacCents = Math.round(cac(smQuarter, newLogosThisQuarter));

    const arpaMonthly = activeLogos === 0 ? 0 : mrr / activeLogos;
    const ltvCents = Math.round(ltv(arpaMonthly, grossMarginFraction, logoChurnFraction));
    const paybackMo = paybackMonths(cacCents, arpaMonthly, grossMarginFraction);

    const netMonthly = expansion - contraction - churn;
    const netNewArr = Math.round(netMonthly * 3 * 12);
    const magic = magicNumber(netNewArr, smQuarter);

    const runway = runwayMonths(db.cashBalanceCents, monthlyBurn);

    const revRamp = revenueRamp(6).map((p) => projectMonthly(mrr, p.factor));
    const costRampArr = costRamp(6).map((p) => projectMonthly(monthlyCost, p.factor));
    const opIncomeSpark = revRamp.map((r, i) => r - (costRampArr[i] ?? 0));

    const view: BiOverviewView = {
      mrrCents: mrr,
      arrCents: arr,
      committedArrCents: committed,
      nrrBps: toBps(nrrFraction),
      grrBps: toBps(grrFraction),
      logoChurnBps: toBps(logoChurnFraction),
      ruleOf40Bps: Math.round(ruleOf40(annualizedGrowthPct, opMarginPct) * 100),
      magicNumber: Math.round(magic * 100) / 100,
      paybackMonths: Math.round(paybackMo * 10) / 10,
      cacCents,
      ltvCents,
      ltvCacRatio: cacCents === 0 ? 0 : Math.round((ltvCents / cacCents) * 10) / 10,
      cashBalanceCents: db.cashBalanceCents,
      monthlyBurnCents: monthlyBurn,
      runwayMonths: Number.isFinite(runway) ? Math.round(runway * 10) / 10 : 999,
      mrrSpark: revRamp,
      opIncomeSpark,
    };
    return HttpResponse.json(view);
  }),

  http.get('/api/bi/retention', () => {
    const months = trailingMonths(6);

    // Cohort matrix — bucket customers by their signup month and apply a
    // constant-rate retention decay so the heat-map has something to show.
    const cohortMap = new Map<string, number>();
    for (const c of db.customers) {
      const key = monthKey(new Date(c.since));
      cohortMap.set(key, (cohortMap.get(key) ?? 0) + 1);
    }
    const cohortKeys = [...cohortMap.keys()].sort();
    const retentionRate = 1 - MOVEMENT_ASSUMPTIONS.logoChurnRate;
    const cohorts = cohortKeys.slice(-6).map((cohortMonth) => {
      const initial = cohortMap.get(cohortMonth)!;
      const retention: number[] = [];
      for (let m = 0; m < 6; m++) {
        retention.push(Math.pow(retentionRate, m));
      }
      return { cohortMonth, initialCount: initial, retention };
    });

    const monthly = months.map((month) => ({
      month,
      nrrBps: toBps(
        1 + MOVEMENT_ASSUMPTIONS.expansionRate - MOVEMENT_ASSUMPTIONS.contractionRate - MOVEMENT_ASSUMPTIONS.revenueChurnRate,
      ),
      grrBps: toBps(1 - MOVEMENT_ASSUMPTIONS.contractionRate - MOVEMENT_ASSUMPTIONS.revenueChurnRate),
      logoChurnBps: toBps(MOVEMENT_ASSUMPTIONS.logoChurnRate),
      revenueChurnBps: toBps(MOVEMENT_ASSUMPTIONS.revenueChurnRate),
    }));

    const view: BiRetentionView = { cohorts, monthly };
    return HttpResponse.json(view);
  }),

  http.get('/api/bi/sales', () => {
    const won = db.opportunities.filter((o) => o.stage === 'close_won');
    const lost = db.opportunities.filter((o) => o.stage === 'close_lost');
    const winRateBps =
      won.length + lost.length === 0 ? 0 : toBps(won.length / (won.length + lost.length));

    const sizeOf = (accountId: string) =>
      db.accounts.find((a) => a.id === accountId)?.size ?? '—';

    const bySizeMap = new Map<string, { won: number; lost: number; cycles: number[] }>();
    for (const o of db.opportunities) {
      if (o.stage !== 'close_won' && o.stage !== 'close_lost') continue;
      const size = sizeOf(o.accountId);
      const cur = bySizeMap.get(size) ?? { won: 0, lost: 0, cycles: [] };
      if (o.stage === 'close_won') {
        cur.won += 1;
        const days = Math.max(
          0,
          Math.round(
            (new Date(o.expectedCloseDate).getTime() - new Date(o.createdAt).getTime()) / 86400_000,
          ),
        );
        cur.cycles.push(days);
      } else {
        cur.lost += 1;
      }
      bySizeMap.set(size, cur);
    }

    const winRateBySize = [...bySizeMap.entries()]
      .map(([size, v]) => ({
        size,
        wonCount: v.won,
        lostCount: v.lost,
        winRateBps: v.won + v.lost === 0 ? 0 : toBps(v.won / (v.won + v.lost)),
      }))
      .sort((a, b) => (a.size < b.size ? -1 : 1));

    const median = (nums: number[]): number => {
      if (nums.length === 0) return 0;
      const sorted = [...nums].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0
        ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
        : sorted[mid] ?? 0;
    };

    const cycleBySize = [...bySizeMap.entries()]
      .map(([size, v]) => ({
        size,
        medianDays: median(v.cycles),
        wonCount: v.won,
      }))
      .sort((a, b) => (a.size < b.size ? -1 : 1));

    const openStages: OpportunityStage[] = ['qualified', 'trial', 'decision'];
    const openWeighted = db.opportunities
      .filter((o) => openStages.includes(o.stage))
      .reduce((s, o) => s + Math.round((o.amountCents * o.probability) / 100), 0);
    const quarterlyTargetCents = Math.round(currentActiveMrr() * 12 * 0.3);
    const coverageRatio =
      quarterlyTargetCents === 0
        ? 0
        : Math.round((openWeighted / quarterlyTargetCents) * 100) / 100;

    const view: BiSalesView = {
      winRateBps,
      winRateBySize,
      cycleBySize,
      pipeline: {
        openWeightedCents: openWeighted,
        quarterlyTargetCents,
        coverageRatio,
      },
    };
    return HttpResponse.json(view);
  }),
];
