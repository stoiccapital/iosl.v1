/**
 * Synthetic 6-month history helpers.
 *
 * The mock database only carries "current state" (which subscriptions are
 * active, which contracts are live, etc.). To make monthly views useful we
 * back-fill a plausible ramp:
 *   - Aggregate MRR ramps from 0.75× → 1.00× of today over the trailing 6 months.
 *   - Costs are held roughly flat (0.90× → 1.00×), reflecting the growth-heavy
 *     bias of an early SaaS.
 *
 * Everything downstream — Finance P&L, BI Overview, MRR movement, cohort
 * retention — reads these two curves so the numbers are internally consistent.
 * Real BE would replace this with actual monthly ledger + subscription events.
 */

export type MonthPoint = { month: string; factor: number };

export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function trailingMonths(n: number): string[] {
  const now = new Date();
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(monthKey(d));
  }
  return out;
}

export function revenueRamp(n: number): MonthPoint[] {
  const months = trailingMonths(n);
  const start = 0.75;
  const end = 1.0;
  return months.map((month, i) => ({
    month,
    factor: n === 1 ? end : start + ((end - start) * i) / (n - 1),
  }));
}

export function costRamp(n: number): MonthPoint[] {
  const months = trailingMonths(n);
  const start = 0.9;
  const end = 1.0;
  return months.map((month, i) => ({
    month,
    factor: n === 1 ? end : start + ((end - start) * i) / (n - 1),
  }));
}

export function projectMonthly(currentCents: number, factor: number): number {
  return Math.round(currentCents * factor);
}

/**
 * MRR movement decomposition assumptions (constant monthly rates applied to
 * the prior month's ending MRR).
 */
export const MOVEMENT_ASSUMPTIONS = {
  logoChurnRate: 0.013,
  revenueChurnRate: 0.01,
  expansionRate: 0.02,
  contractionRate: 0.005,
} as const;
