import { http, HttpResponse } from 'msw';
import type { DashboardView } from '@factory/shared';
import { db } from '../db';
import {
  DASHBOARD_WINDOW_DAYS,
  activeCustomersCount,
  activeMrrCents,
  activeAssignmentsCount,
  activeCandidatesCount,
  activeProjectsCount,
  arpaCents,
  churnInWindow,
  costItemsCount,
  grrBps,
  headcount,
  monthlyCostCents,
  netMonthlyCents,
  nrrBps,
  openOppsCount,
  openPipelineWeightedCents,
  openPositionsCount,
  revenuePerEmployeeCents,
  runway,
  unpaidCommissionCents,
} from '../lib/aggregates';

const CACHE_TTL_SECONDS = 15 * 60;

let cached: { at: number; body: DashboardView } | null = null;

function buildDashboard(): DashboardView {
  const mrr = activeMrrCents(db);
  const cost = monthlyCostCents(db);
  const rw = runway(db);
  const churn = churnInWindow(db, DASHBOARD_WINDOW_DAYS);

  return {
    generatedAt: new Date().toISOString(),
    cacheTtlSeconds: CACHE_TTL_SECONDS,
    windowDays: DASHBOARD_WINDOW_DAYS,

    finance: {
      mrrCents: mrr > 0 ? mrr : null,
      monthlyCostCents: cost > 0 ? cost : null,
      netMonthlyCents: mrr > 0 || cost > 0 ? netMonthlyCents(db) : null,
      runwayMonths: rw.months,
      runwayInfinite: rw.infinite,
    },

    sales: {
      openOppsCount: openOppsCount(db),
      openPipelineWeightedCents: openPipelineWeightedCents(db),
      activeCustomersCount: activeCustomersCount(db),
      nrrBps: nrrBps(db),
      grrBps: grrBps(db),
      arpaCents: arpaCents(db),
    },

    people: {
      headcount: headcount(db),
      openPositionsCount: openPositionsCount(db),
      activeCandidatesCount: activeCandidatesCount(db),
      unpaidCommissionCents: unpaidCommissionCents(db),
      revenuePerEmployeeCents: revenuePerEmployeeCents(db),
    },

    delivery: {
      activeProjectsCount: activeProjectsCount(db),
      activeAssignmentsCount: activeAssignmentsCount(db),
      costItemsCount: costItemsCount(db),
    },

    retention: {
      churnedMrrCents: churn.churnedMrrCents,
      churnedLogos: churn.churned.length,
      voluntaryChurnLogos: churn.voluntaryLogos,
      involuntaryChurnLogos: churn.involuntaryLogos,
    },
  };
}

/**
 * Dev-only cache invalidation — Vite HMR can re-import this module, at which
 * point the module-scoped `cached` resets naturally. During a single session
 * the 15-min window matches the ticket's Phase 3 requirement.
 */
export const dashboardHandlers = [
  http.get('/api/bi/dashboard', ({ request }) => {
    const url = new URL(request.url);
    const bypass = url.searchParams.get('fresh') === '1';
    const now = Date.now();
    if (!bypass && cached && now - cached.at < CACHE_TTL_SECONDS * 1000) {
      return HttpResponse.json(cached.body);
    }
    const body = buildDashboard();
    cached = { at: now, body };
    return HttpResponse.json(body);
  }),
];
