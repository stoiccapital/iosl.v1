import { http, HttpResponse } from 'msw';
import { isInvoluntaryChurn } from '@factory/shared';
import type { AtRiskAccountRow, ChurnView, ChurnedCustomerRow } from '@factory/shared';
import { db } from '../db';
import { toBps } from '../lib/saas-metrics';
import { activeCustomersCount, activeMrrCents } from '../lib/aggregates';

const WINDOW_DAYS = 90;

export const churnHandlers = [
  http.get('/api/crm/churn', () => {
    const now = Date.now();
    const cutoff = now - WINDOW_DAYS * 86400_000;

    const accountName = (id: string) =>
      db.accounts.find((a) => a.id === id)?.name ?? '—';
    const productName = (code: string) =>
      db.products.find((p) => p.code === code)?.name ?? code;

    // ---------- Churned in window ----------
    const churnedInWindow = db.customers.filter(
      (c) => !c.active && c.churnedAt && new Date(c.churnedAt).getTime() >= cutoff,
    );
    const churnedMrrCents = churnedInWindow.reduce((s, c) => s + c.mrrCents, 0);
    const activeMrrNow = activeMrrCents(db);
    const activeCountNow = activeCustomersCount(db);

    const monthlyLogoChurn =
      activeCountNow + churnedInWindow.length === 0
        ? 0
        : churnedInWindow.length / (activeCountNow + churnedInWindow.length) / (WINDOW_DAYS / 30);
    const monthlyRevenueChurn =
      activeMrrNow + churnedMrrCents === 0
        ? 0
        : churnedMrrCents / (activeMrrNow + churnedMrrCents) / (WINDOW_DAYS / 30);

    const churned: ChurnedCustomerRow[] = churnedInWindow
      .map((c) => {
        const churnedAt = c.churnedAt!;
        const tenureDays = Math.max(
          0,
          Math.floor((new Date(churnedAt).getTime() - new Date(c.since).getTime()) / 86400_000),
        );
        return {
          customerId: c.id,
          accountName: accountName(c.accountId),
          productName: productName(c.productCode),
          mrrCents: c.mrrCents,
          churnedAt,
          churnReason: c.churnReason,
          tenureDays,
        };
      })
      .sort((a, b) => (a.churnedAt < b.churnedAt ? 1 : -1));

    // ---------- By reason (voluntary + involuntary) ----------
    const reasonMap = new Map<string, { count: number; mrrCents: number }>();
    for (const c of churnedInWindow) {
      const key = c.churnReason ?? 'other';
      const cur = reasonMap.get(key) ?? { count: 0, mrrCents: 0 };
      cur.count += 1;
      cur.mrrCents += c.mrrCents;
      reasonMap.set(key, cur);
    }
    const byReason = [...reasonMap.entries()]
      .map(([reason, v]) => ({ reason, count: v.count, mrrCents: v.mrrCents }))
      .sort((a, b) => b.mrrCents - a.mrrCents);

    // Voluntary vs involuntary — surfaced separately so dunning-driven churn
    // doesn't hide inside the "price/lack_of_use/…" volume.
    let involuntaryCount = 0;
    let involuntaryMrrCents = 0;
    let voluntaryCount = 0;
    let voluntaryMrrCents = 0;
    for (const c of churnedInWindow) {
      if (isInvoluntaryChurn(c.churnReason)) {
        involuntaryCount += 1;
        involuntaryMrrCents += c.mrrCents;
      } else {
        voluntaryCount += 1;
        voluntaryMrrCents += c.mrrCents;
      }
    }

    // ---------- At-risk accounts (reuses the Customer Success scoring) ----------
    const atRisk: AtRiskAccountRow[] = [];
    for (const a of db.accounts) {
      const cust = db.customers.filter((c) => c.accountId === a.id && c.active);
      if (cust.length === 0) continue;
      const mrrCents = cust.reduce((s, c) => s + c.mrrCents, 0);
      const openTickets = db.tickets.filter(
        (t) => t.accountId === a.id && (t.status === 'open' || t.status === 'pending'),
      ).length;
      const overdueInvoices = db.invoices.filter(
        (i) => cust.some((c) => c.id === i.customerId) && i.status === 'overdue',
      ).length;
      const oldestSince = cust.reduce(
        (min, c) => (c.since < min ? c.since : min),
        cust[0]!.since,
      );
      const ageDays = Math.floor((now - new Date(oldestSince).getTime()) / 86400_000);

      let score = 80;
      score -= openTickets * 8;
      score -= overdueInvoices * 20;
      if (ageDays > 365) score += 10;
      score = Math.max(0, Math.min(100, score));

      if (score < 60) {
        atRisk.push({
          accountId: a.id,
          accountName: a.name,
          mrrCents,
          openTickets,
          overdueInvoices,
          score,
        });
      }
    }
    atRisk.sort((a, b) => a.score - b.score);
    const atRiskMrrCents = atRisk.reduce((s, r) => s + r.mrrCents, 0);

    const view: ChurnView = {
      windowDays: WINDOW_DAYS,
      churnedCount: churnedInWindow.length,
      churnedMrrCents,
      logoChurnBps: toBps(monthlyLogoChurn),
      revenueChurnBps: toBps(monthlyRevenueChurn),
      voluntaryCount,
      voluntaryMrrCents,
      involuntaryCount,
      involuntaryMrrCents,
      atRiskCount: atRisk.length,
      atRiskMrrCents,
      churned,
      atRisk,
      byReason,
    };
    return HttpResponse.json(view);
  }),
];
