import type { Opportunity } from '@factory/shared';

export type ForecastTier = 'commit' | 'forecast' | 'upside';

export const FORECAST_TIER_LABEL: Record<ForecastTier, string> = {
  commit: 'Commit',
  forecast: 'Forecast',
  upside: 'Upside',
};

export const FORECAST_TIER_DESCRIPTION: Record<ForecastTier, string> = {
  commit: 'Deals you commit to closing. Probability ≥ 75 %.',
  forecast: 'Deals expected to close. Probability 40 % – 74 %.',
  upside: 'Stretch deals. Probability 15 % – 39 %.',
};

export const FORECAST_TIER_ORDER: ForecastTier[] = ['commit', 'forecast', 'upside'];

export function tierOf(opp: Opportunity): ForecastTier | null {
  if (opp.stage === 'close_lost') return null;
  const p = opp.probability;
  if (p >= 75) return 'commit';
  if (p >= 40) return 'forecast';
  if (p >= 15) return 'upside';
  return null;
}

export function weighted(amountCents: number, probability: number): number {
  return Math.round((amountCents * probability) / 100);
}

export type TierBucket = {
  tier: ForecastTier;
  deals: Opportunity[];
  amountCents: number;
  weightedCents: number;
};

export function bucketByTier(opps: Opportunity[]): Record<ForecastTier, TierBucket> {
  const empty = (t: ForecastTier): TierBucket => ({
    tier: t,
    deals: [],
    amountCents: 0,
    weightedCents: 0,
  });
  const buckets: Record<ForecastTier, TierBucket> = {
    commit: empty('commit'),
    forecast: empty('forecast'),
    upside: empty('upside'),
  };
  for (const o of opps) {
    const t = tierOf(o);
    if (!t) continue;
    buckets[t].deals.push(o);
    buckets[t].amountCents += o.amountCents;
    buckets[t].weightedCents += weighted(o.amountCents, o.probability);
  }
  return buckets;
}
