/**
 * Canonical aggregates for the executive dashboard and every derived view.
 *
 * Rule: if a metric name lives here, it lives here ONLY. Handlers must not
 * re-compute the formula inline — they import the helper. If two consumers
 * disagree, they disagree here, in one file, on one line.
 *
 * Every function returns `null` when the metric is not computable (e.g. NRR
 * with a zero starting cohort). Callers must not coerce null to zero.
 */

import {
  expenseCategoryToBucket,
  isInvoluntaryChurn,
  type Customer,
} from '@factory/shared';
import type { Db } from '../db';
import { MOVEMENT_ASSUMPTIONS, revenueRamp } from './finance-history';
import { payrollBucket, supplierBucket } from './pnl-mapping';

/* -------------------------------------------------------------------------- */
/* Time windows                                                               */
/* -------------------------------------------------------------------------- */

export const DASHBOARD_WINDOW_DAYS = 30;
export const NRR_WINDOW_MONTHS = 6;

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function isSameMonth(iso: string): boolean {
  return iso.slice(0, 7) === currentMonthKey();
}

function withinDays(iso: string | null, days: number): boolean {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() <= days * 86_400_000;
}

/* -------------------------------------------------------------------------- */
/* Revenue                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Active MRR — the sum of `mrrCents` for every customer with `active: true`.
 * Derived from the Customer table, not Subscriptions, to stay consistent with
 * churn accounting (a customer is the churn unit). The subscription-flow
 * layer keeps `customer.mrrCents` in sync when subs are added or removed.
 */
export function activeMrrCents(db: Db): number {
  return db.customers.filter((c) => c.active).reduce((s, c) => s + c.mrrCents, 0);
}

export function activeCustomersCount(db: Db): number {
  return db.customers.filter((c) => c.active).length;
}

/** ARPA — MRR ÷ active customers. Null when no active customers. */
export function arpaCents(db: Db): number | null {
  const count = activeCustomersCount(db);
  if (count === 0) return null;
  return Math.round(activeMrrCents(db) / count);
}

/* -------------------------------------------------------------------------- */
/* Cost / burn                                                                */
/* -------------------------------------------------------------------------- */

export type PnlBuckets = { cogs: number; rnd: number; sm: number; ga: number };

/**
 * Current-month cost buckets by P&L category. Includes:
 *   - active supplier contracts (recurring monthly amount)
 *   - monthly payroll entries
 *   - PAID compensation events dated this month (commissions, bonuses)
 *   - one-off expenses dated this month
 *
 * The `costItems` count matches the ordered list `/api/finance/costs` returns.
 * This is the same shape the P&L handler uses — kept aligned so that the
 * dashboard's "Monthly cost" and the P&L's current-month cost never diverge.
 */
export function monthlyCostBuckets(db: Db): { buckets: PnlBuckets; itemsCount: number } {
  const buckets: PnlBuckets = { cogs: 0, rnd: 0, sm: 0, ga: 0 };
  let items = 0;

  for (const contract of db.contracts) {
    if (contract.status !== 'active') continue;
    const supplier = db.suppliers.find((s) => s.id === contract.supplierId);
    buckets[supplierBucket(supplier?.category ?? 'other')] += contract.monthlyAmountCents;
    items++;
  }

  for (const entry of db.payrollEntries) {
    if (entry.cadence !== 'monthly') continue;
    const person = db.people.find((p) => p.id === entry.personId);
    buckets[payrollBucket(entry, person)] += entry.grossAmountCents;
    items++;
  }

  for (const event of db.compensationEvents) {
    if (event.status !== 'paid') continue;
    // Compensation events don't carry a paidAt; treat them as current-month
    // to match the P&L handler's behaviour prior to this refactor.
    const person = db.people.find((p) => p.id === event.personId);
    buckets[payrollBucket({ cadence: 'one_time' } as never, person)] += event.amountCents;
    items++;
  }

  for (const exp of db.expenses) {
    if (!isSameMonth(exp.occurredAt)) continue;
    buckets[expenseCategoryToBucket(exp.category)] += exp.amountCents;
    items++;
  }

  return { buckets, itemsCount: items };
}

export function monthlyCostCents(db: Db): number {
  const { buckets } = monthlyCostBuckets(db);
  return buckets.cogs + buckets.rnd + buckets.sm + buckets.ga;
}

export function costItemsCount(db: Db): number {
  return monthlyCostBuckets(db).itemsCount;
}

export function netMonthlyCents(db: Db): number {
  return activeMrrCents(db) - monthlyCostCents(db);
}

export function monthlyBurnCents(db: Db): number {
  return Math.max(0, monthlyCostCents(db) - activeMrrCents(db));
}

/**
 * Runway in months. Returns:
 *   - `{ months: number, infinite: false }` when there is a positive burn
 *   - `{ months: null,   infinite: true  }` when cash-positive (no burn)
 *   - `{ months: null,   infinite: false }` when we can't compute (no cash)
 */
export function runway(db: Db): { months: number | null; infinite: boolean } {
  if (db.cashBalanceCents <= 0) return { months: null, infinite: false };
  const burn = monthlyBurnCents(db);
  if (burn <= 0) return { months: null, infinite: true };
  return { months: Math.round((db.cashBalanceCents / burn) * 10) / 10, infinite: false };
}

/* -------------------------------------------------------------------------- */
/* Sales pipeline                                                             */
/* -------------------------------------------------------------------------- */

const OPEN_OPPORTUNITY_STAGES = new Set(['qualified', 'trial', 'decision', 'proposal']);

export function openOppsCount(db: Db): number {
  return db.opportunities.filter((o) => OPEN_OPPORTUNITY_STAGES.has(o.stage)).length;
}

/**
 * Probability-weighted open pipeline value. Matches `/api/bi/sales`.
 * The prior unweighted sum silently overstated pipeline by ~30–70 %.
 */
export function openPipelineWeightedCents(db: Db): number | null {
  const open = db.opportunities.filter((o) => OPEN_OPPORTUNITY_STAGES.has(o.stage));
  if (open.length === 0) return null;
  return open.reduce((s, o) => s + Math.round((o.amountCents * o.probability) / 100), 0);
}

/* -------------------------------------------------------------------------- */
/* Retention (NRR / GRR / churn splits)                                       */
/* -------------------------------------------------------------------------- */

/**
 * Starting-cohort MRR for the retention window. Standard NRR/GRR is measured
 * against the MRR of the cohort that existed at t0, not against today's MRR.
 *
 * Our mock db carries only "today's state", so we approximate the starting
 * cohort by scaling current MRR by the ramp factor at t0. This is the same
 * ramp the P&L and BI series use, so numbers stay internally consistent —
 * a real BE will replace this with the actual month-t0 MRR ledger row.
 */
export function startingCohortMrrCents(db: Db): number {
  const today = activeMrrCents(db);
  const ramp = revenueRamp(NRR_WINDOW_MONTHS);
  const startFactor = ramp[0]?.factor ?? 1;
  return Math.round(today * startFactor);
}

/**
 * NRR = (starting + expansion − contraction − churn) / starting
 *
 * Expansion / contraction / churn are approximated by compounding the
 * per-month movement assumptions over the retention window. Real BE will
 * replace with subscription-event-derived numbers.
 *
 * Returns bps; null when starting MRR is zero (undefined denominator).
 */
export function nrrBps(db: Db): number | null {
  const start = startingCohortMrrCents(db);
  if (start === 0) return null;
  const months = NRR_WINDOW_MONTHS;
  const expansion = start * MOVEMENT_ASSUMPTIONS.expansionRate * months;
  const contraction = start * MOVEMENT_ASSUMPTIONS.contractionRate * months;
  const churn = start * MOVEMENT_ASSUMPTIONS.revenueChurnRate * months;
  const nrr = (start + expansion - contraction - churn) / start;
  return Math.round(nrr * 10_000);
}

export function grrBps(db: Db): number | null {
  const start = startingCohortMrrCents(db);
  if (start === 0) return null;
  const months = NRR_WINDOW_MONTHS;
  const contraction = start * MOVEMENT_ASSUMPTIONS.contractionRate * months;
  const churn = start * MOVEMENT_ASSUMPTIONS.revenueChurnRate * months;
  const grr = (start - contraction - churn) / start;
  return Math.round(grr * 10_000);
}

/**
 * Churn split — voluntary vs involuntary within the trailing window.
 * Involuntary = `churnReason` in `INVOLUNTARY_CHURN_REASONS`. Anything else
 * (including `null` when reason wasn't recorded) is treated as voluntary,
 * matching how finance teams categorize dunning-driven churn.
 */
export function churnInWindow(
  db: Db,
  windowDays = DASHBOARD_WINDOW_DAYS,
): {
  churned: Customer[];
  churnedMrrCents: number;
  voluntaryLogos: number;
  involuntaryLogos: number;
} {
  const churned = db.customers.filter(
    (c) => !c.active && c.churnedAt !== null && withinDays(c.churnedAt, windowDays),
  );
  let voluntary = 0;
  let involuntary = 0;
  let mrr = 0;
  for (const c of churned) {
    mrr += c.mrrCents;
    if (isInvoluntaryChurn(c.churnReason)) involuntary++;
    else voluntary++;
  }
  return {
    churned,
    churnedMrrCents: mrr,
    voluntaryLogos: voluntary,
    involuntaryLogos: involuntary,
  };
}

/* -------------------------------------------------------------------------- */
/* People                                                                     */
/* -------------------------------------------------------------------------- */

export function headcount(db: Db): number {
  return db.people.filter((p) => p.type !== 'candidate').length;
}

/** Revenue per employee = ARR / headcount. Null when no headcount. */
export function revenuePerEmployeeCents(db: Db): number | null {
  const hc = headcount(db);
  if (hc === 0) return null;
  return Math.round((activeMrrCents(db) * 12) / hc);
}

const OPEN_POSITION_STATUS = 'open';
export function openPositionsCount(db: Db): number {
  return db.positions
    .filter((p) => p.status === OPEN_POSITION_STATUS)
    .reduce((n, p) => n + p.openings, 0);
}

const ACTIVE_CANDIDATE_STAGES = new Set(['applied', 'screen', 'interview', 'offer']);
export function activeCandidatesCount(db: Db): number {
  return db.candidates.filter((c) => ACTIVE_CANDIDATE_STAGES.has(c.stage)).length;
}

const UNPAID_COMPENSATION_STATUSES = new Set(['earned', 'approved']);
export function unpaidCommissionCents(db: Db): number {
  return db.compensationEvents
    .filter((e) => UNPAID_COMPENSATION_STATUSES.has(e.status))
    .reduce((s, e) => s + e.amountCents, 0);
}

/* -------------------------------------------------------------------------- */
/* Delivery                                                                   */
/* -------------------------------------------------------------------------- */

export function activeProjectsCount(db: Db): number {
  return db.projects.filter((p) => p.status === 'active').length;
}

export function activeAssignmentsCount(db: Db): number {
  return db.assignments.filter((a) => a.status === 'active').length;
}

/* -------------------------------------------------------------------------- */
/* Customer MRR reconciliation                                                */
/* -------------------------------------------------------------------------- */

/**
 * Recompute a customer's denormalized `mrrCents` from their live subscriptions.
 * Used by the subscription-flow handler whenever a subscription is added,
 * activated, paused, or cancelled — without this, `Customer.mrrCents` drifts
 * as soon as an account has two subscriptions.
 *
 * MRR-contributing statuses: `active`, `past_due`. `paid` counts too — the
 * customer has committed and paid, they're just waiting on the "activate"
 * step from Finance. `payment_link_sent` and `draft` do not count yet.
 */
const REVENUE_BEARING_SUBSCRIPTION_STATUSES = new Set([
  'active',
  'past_due',
  'paid',
]);

export function customerMrrFromSubscriptions(db: Db, customerId: string): number {
  return db.subscriptions
    .filter(
      (s) => s.customerId === customerId && REVENUE_BEARING_SUBSCRIPTION_STATUSES.has(s.status),
    )
    .reduce((n, s) => n + s.mrrCents, 0);
}
