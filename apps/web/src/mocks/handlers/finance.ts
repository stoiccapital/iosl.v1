import { http, HttpResponse } from 'msw';
import type {
  CostSummary,
  PnlMonth,
  PnlView,
  RevenueSummary,
  SupplierCategory,
} from '@factory/shared';
import { db } from '../db';
import { costRamp, projectMonthly, revenueRamp } from '../lib/finance-history';
import { payrollBucket, supplierBucket } from '../lib/pnl-mapping';

export const financeHandlers = [
  http.get('/api/finance/revenue', () => {
    const active = db.customers.filter((c) => c.active);
    const mrrCents = active.reduce((n, c) => n + c.mrrCents, 0);

    const byProduct = new Map<
      string,
      { productCode: string; productName: string; mrrCents: number; customers: number }
    >();
    for (const c of active) {
      const key = c.productCode;
      const productName = db.products.find((p) => p.code === key)?.name ?? key;
      const cur = byProduct.get(key) ?? { productCode: key, productName, mrrCents: 0, customers: 0 };
      cur.mrrCents += c.mrrCents;
      cur.customers += 1;
      byProduct.set(key, cur);
    }

    const byAccount = new Map<
      string,
      { accountId: string; accountName: string; mrrCents: number; products: Set<string> }
    >();
    for (const c of active) {
      const accountName = db.accounts.find((a) => a.id === c.accountId)?.name ?? '—';
      const cur =
        byAccount.get(c.accountId) ??
        { accountId: c.accountId, accountName, mrrCents: 0, products: new Set<string>() };
      cur.mrrCents += c.mrrCents;
      cur.products.add(c.productCode);
      byAccount.set(c.accountId, cur);
    }

    const summary: RevenueSummary = {
      mrrCents,
      arrCents: mrrCents * 12,
      activeCustomers: active.length,
      byProduct: [...byProduct.values()].sort((a, b) => b.mrrCents - a.mrrCents),
      byAccount: [...byAccount.values()]
        .map((v) => ({
          accountId: v.accountId,
          accountName: v.accountName,
          mrrCents: v.mrrCents,
          products: [...v.products],
        }))
        .sort((a, b) => b.mrrCents - a.mrrCents),
    };
    return HttpResponse.json(summary);
  }),

  http.get('/api/finance/costs', () => {
    const items: CostSummary['items'] = [];

    for (const contract of db.contracts) {
      if (contract.status !== 'active') continue;
      const supplier = db.suppliers.find((s) => s.id === contract.supplierId);
      const category: SupplierCategory = supplier?.category ?? 'other';
      items.push({
        id: `contract:${contract.id}`,
        source: 'supplier',
        sourceRef: supplier?.name ?? '—',
        category,
        monthlyCents: contract.monthlyAmountCents,
        description: contract.name,
      });
    }

    for (const entry of db.payrollEntries) {
      if (entry.cadence !== 'monthly') continue;
      const person = db.people.find((p) => p.id === entry.personId);
      const category = person?.type === 'freelancer' ? 'contractor' : 'salary';
      items.push({
        id: `payroll:${entry.id}`,
        source: 'payroll',
        sourceRef: person ? `${person.firstName} ${person.lastName}` : '—',
        category,
        monthlyCents: entry.grossAmountCents,
        description: entry.note,
      });
    }

    const monthlyCents = items.reduce((n, i) => n + i.monthlyCents, 0);

    const byCategoryMap = new Map<string, number>();
    for (const i of items) {
      byCategoryMap.set(i.category, (byCategoryMap.get(i.category) ?? 0) + i.monthlyCents);
    }
    const bySourceMap = new Map<string, number>();
    for (const i of items) {
      bySourceMap.set(i.source, (bySourceMap.get(i.source) ?? 0) + i.monthlyCents);
    }

    const summary: CostSummary = {
      monthlyCents,
      byCategory: [...byCategoryMap.entries()]
        .map(([category, monthlyCents]) => ({ category, monthlyCents }))
        .sort((a, b) => b.monthlyCents - a.monthlyCents),
      bySource: [...bySourceMap.entries()]
        .map(([source, monthlyCents]) => ({ source, monthlyCents }))
        .sort((a, b) => b.monthlyCents - a.monthlyCents),
      items: items.sort((a, b) => b.monthlyCents - a.monthlyCents),
    };
    return HttpResponse.json(summary);
  }),

  http.get('/api/finance/pnl', ({ request }) => {
    const url = new URL(request.url);
    const monthsParam = Number.parseInt(url.searchParams.get('months') ?? '6', 10);
    const n = Math.max(1, Math.min(12, Number.isFinite(monthsParam) ? monthsParam : 6));

    // Current-month building blocks
    const activeCustomers = db.customers.filter((c) => c.active);
    const currentRevenue = activeCustomers.reduce((s, c) => s + c.mrrCents, 0);

    const currentBuckets = { cogs: 0, rnd: 0, sm: 0, ga: 0 };
    for (const contract of db.contracts) {
      if (contract.status !== 'active') continue;
      const supplier = db.suppliers.find((s) => s.id === contract.supplierId);
      const bucket = supplierBucket(supplier?.category ?? 'other');
      currentBuckets[bucket] += contract.monthlyAmountCents;
    }
    for (const entry of db.payrollEntries) {
      if (entry.cadence !== 'monthly') continue;
      const person = db.people.find((p) => p.id === entry.personId);
      const bucket = payrollBucket(entry, person);
      currentBuckets[bucket] += entry.grossAmountCents;
    }
    // Paid compensation events add to the same P&L bucket as the person's
    // regular payroll — a sales-rep commission hits S&M, etc.
    for (const event of db.compensationEvents) {
      if (event.status !== 'paid') continue;
      const person = db.people.find((p) => p.id === event.personId);
      const bucket = payrollBucket(
        { cadence: 'one_time' } as never,
        person,
      );
      currentBuckets[bucket] += event.amountCents;
    }

    const revenue = revenueRamp(n);
    const cost = costRamp(n);

    const months: PnlMonth[] = revenue.map((r, i) => {
      const costFactor = cost[i]?.factor ?? 1;
      const revenueCents = projectMonthly(currentRevenue, r.factor);
      const cogsCents = projectMonthly(currentBuckets.cogs, costFactor);
      const rndCents = projectMonthly(currentBuckets.rnd, costFactor);
      const smCents = projectMonthly(currentBuckets.sm, costFactor);
      const gaCents = projectMonthly(currentBuckets.ga, costFactor);
      const grossProfitCents = revenueCents - cogsCents;
      const opexCents = rndCents + smCents + gaCents;
      const operatingIncomeCents = grossProfitCents - opexCents;
      return {
        month: r.month,
        revenueCents,
        cogsCents,
        grossProfitCents,
        rndCents,
        smCents,
        gaCents,
        opexCents,
        operatingIncomeCents,
      };
    });

    const view: PnlView = { months };
    return HttpResponse.json(view);
  }),
];
