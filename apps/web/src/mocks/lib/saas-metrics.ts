/**
 * SaaS metric formulas — one place so the BE can port them verbatim.
 * All rates use basis points (bps) so 100.00 % is 10 000. Money in cents.
 */

const BPS_100_PERCENT = 10_000;

export function toBps(fraction: number): number {
  if (!Number.isFinite(fraction)) return 0;
  return Math.round(fraction * BPS_100_PERCENT);
}

/**
 * NRR = (starting MRR + expansion − contraction − churn) / starting MRR
 */
export function nrr(startingMrr: number, expansion: number, contraction: number, churn: number): number {
  if (startingMrr === 0) return 0;
  return (startingMrr + expansion - contraction - churn) / startingMrr;
}

/**
 * GRR = (starting MRR − contraction − churn) / starting MRR
 */
export function grr(startingMrr: number, contraction: number, churn: number): number {
  if (startingMrr === 0) return 0;
  return (startingMrr - contraction - churn) / startingMrr;
}

/**
 * Rule of 40 = annualized growth % + operating margin %
 */
export function ruleOf40(annualizedGrowth: number, operatingMargin: number): number {
  return annualizedGrowth + operatingMargin;
}

/**
 * Magic number = net new ARR this period / S&M spend prior period
 */
export function magicNumber(netNewArr: number, priorSmSpend: number): number {
  if (priorSmSpend === 0) return 0;
  return netNewArr / priorSmSpend;
}

/**
 * CAC = S&M spend / new logos in period
 */
export function cac(smSpend: number, newLogos: number): number {
  if (newLogos === 0) return 0;
  return smSpend / newLogos;
}

/**
 * LTV = ARPA × gross margin fraction / logo churn rate (per period)
 */
export function ltv(arpa: number, grossMarginFraction: number, logoChurnRate: number): number {
  if (logoChurnRate === 0) return 0;
  return (arpa * grossMarginFraction) / logoChurnRate;
}

/**
 * CAC payback = CAC / (ARPA × gross margin fraction). Returns months if ARPA is monthly.
 */
export function paybackMonths(cacCost: number, arpa: number, grossMarginFraction: number): number {
  const denom = arpa * grossMarginFraction;
  if (denom === 0) return 0;
  return cacCost / denom;
}

/**
 * Cash runway in months = cash balance / net monthly burn.
 * If net burn ≤ 0 (i.e. cash-positive), returns Infinity → caller displays "∞".
 */
export function runwayMonths(cashBalance: number, monthlyBurn: number): number {
  if (monthlyBurn <= 0) return Number.POSITIVE_INFINITY;
  return cashBalance / monthlyBurn;
}
