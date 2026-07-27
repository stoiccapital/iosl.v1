import type { Pricing, ServiceArea } from '@factory/shared';
import { getDistanceKm } from '@factory/shared';

export type CalcResult =
  | { kind: 'idle' }
  | { kind: 'same_pair' }
  | { kind: 'unknown_route'; startCityId: string; endCityId: string }
  | {
      kind: 'ok';
      startCityId: string;
      endCityId: string;
      distanceKm: number;
      estimateCents: number;
      minFareApplied: boolean;
    };

export function computeRide(
  area: ServiceArea,
  pricing: Pricing,
  startCityId: string | null,
  endCityId: string | null,
): CalcResult {
  if (!startCityId || !endCityId) return { kind: 'idle' };
  if (startCityId === endCityId) return { kind: 'same_pair' };
  const distance = getDistanceKm(area, startCityId, endCityId);
  if (distance === undefined) return { kind: 'unknown_route', startCityId, endCityId };
  const raw = Math.round(distance * pricing.ratePerKmCents);
  const estimateCents = Math.max(raw, pricing.minFareCents);
  return {
    kind: 'ok',
    startCityId,
    endCityId,
    distanceKm: distance,
    estimateCents,
    minFareApplied: estimateCents > raw,
  };
}
