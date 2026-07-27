/**
 * Pure functions — no side effects, no I/O. Kept here so the calculator page
 * stays presentational and formulas are testable in isolation.
 *
 * All money is in cents. All percentages are 0–200 (%), not 0–2 (fraction).
 * Accelerator is a multiplier (1.0 = no accel, 1.5 = 150 %, 1.75 = 175 %).
 */

export type CommissionPlan = {
  oteCents: number;
  variableSplitPct: number; // e.g. 40 for a 60/40 split → 40 % is variable
  quotaCents: number;
  hurdlePct: number;        // % attainment at which acceleration kicks in
  acceleratorMultiplier: number;
};

export type CommissionResult = {
  baseSalaryCents: number;
  variableAtTargetCents: number;
  baseRatePctBps: number;              // 1 000 = 10.00 %
  acceleratedRatePctBps: number;
  hurdleBookingsCents: number;
  bookingsCents: number;
  attainmentPct: number;               // 0 → whatever
  commissionEarnedCents: number;
  totalOnTargetEarningsCents: number;  // base + variable at 100 %
  totalIfAtCurrentAttainmentCents: number; // base + earned commission
};

export function compute(
  plan: CommissionPlan,
  bookingsCents: number,
): CommissionResult {
  const variableAtTargetCents = Math.round((plan.oteCents * plan.variableSplitPct) / 100);
  const baseSalaryCents = plan.oteCents - variableAtTargetCents;

  const baseRate = plan.quotaCents === 0 ? 0 : variableAtTargetCents / plan.quotaCents;
  const acceleratedRate = baseRate * plan.acceleratorMultiplier;
  const hurdleBookingsCents = Math.round((plan.quotaCents * plan.hurdlePct) / 100);

  let commissionEarnedCents: number;
  if (bookingsCents <= hurdleBookingsCents) {
    commissionEarnedCents = Math.round(bookingsCents * baseRate);
  } else {
    const belowHurdle = Math.round(hurdleBookingsCents * baseRate);
    const aboveHurdle = Math.round((bookingsCents - hurdleBookingsCents) * acceleratedRate);
    commissionEarnedCents = belowHurdle + aboveHurdle;
  }

  const attainmentPct = plan.quotaCents === 0 ? 0 : (bookingsCents / plan.quotaCents) * 100;

  return {
    baseSalaryCents,
    variableAtTargetCents,
    baseRatePctBps: Math.round(baseRate * 10_000),
    acceleratedRatePctBps: Math.round(acceleratedRate * 10_000),
    hurdleBookingsCents,
    bookingsCents,
    attainmentPct,
    commissionEarnedCents,
    totalOnTargetEarningsCents: plan.oteCents,
    totalIfAtCurrentAttainmentCents: baseSalaryCents + commissionEarnedCents,
  };
}

/**
 * Points for the commission-vs-attainment curve. Attainment is bucketed at 5 %
 * steps up to 2× hurdle (or 2× quota, whichever is larger).
 */
export function curve(plan: CommissionPlan): { attainmentPct: number; commissionCents: number }[] {
  const maxPct = Math.max(200, plan.hurdlePct + 100);
  const step = 5;
  const points: { attainmentPct: number; commissionCents: number }[] = [];
  for (let pct = 0; pct <= maxPct; pct += step) {
    const bookings = Math.round((plan.quotaCents * pct) / 100);
    const r = compute(plan, bookings);
    points.push({ attainmentPct: pct, commissionCents: r.commissionEarnedCents });
  }
  return points;
}
