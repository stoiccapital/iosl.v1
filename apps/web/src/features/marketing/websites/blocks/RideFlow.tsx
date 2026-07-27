import { useState } from 'react';
import type { Website, WebsiteLocale } from '@factory/shared';
import { LeadForm, type RideCalcContext } from './LeadForm';
import { RideCalculator } from './RideCalculator';
import { computeRide } from '@/features/marketing/websites/lib/computeRide';

type Theme = 'dark' | 'light';

type Props = {
  site: Website;
  locale: WebsiteLocale;
  theme: Theme;
  ctaLabel: string;
};

export function RideFlow({ site, locale, theme, ctaLabel }: Props) {
  const [pair, setPair] = useState<{
    startCityId: string | null;
    endCityId: string | null;
  }>({ startCityId: null, endCityId: null });

  const result = computeRide(
    site.content.serviceArea,
    site.content.pricing,
    pair.startCityId,
    pair.endCityId,
  );

  const calcContext: RideCalcContext | null =
    result.kind === 'ok'
      ? {
          startCityId: result.startCityId,
          endCityId: result.endCityId,
          distanceKm: result.distanceKm,
          estimateCents: result.estimateCents,
        }
      : null;

  return (
    <div className="flex flex-col gap-5">
      <RideCalculator
        area={site.content.serviceArea}
        pricing={site.content.pricing}
        locale={locale}
        theme={theme}
        startCityId={pair.startCityId}
        endCityId={pair.endCityId}
        onChange={setPair}
      />
      <LeadForm
        slug={site.slug}
        locale={locale}
        theme={theme}
        ctaLabel={ctaLabel}
        calcContext={calcContext}
      />
    </div>
  );
}
