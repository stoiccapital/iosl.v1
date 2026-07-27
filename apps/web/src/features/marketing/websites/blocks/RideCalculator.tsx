import { useMemo } from 'react';
import type { Pricing, ServiceArea, WebsiteLocale } from '@factory/shared';
import { formatCurrencyEURFull, formatWithUnit } from '@/lib/format';
import { UI_COPY, t } from '@/features/marketing/websites/lib/copy';
import { pickLocalized } from '@/features/marketing/websites/lib/localized';
import { computeRide, type CalcResult } from '@/features/marketing/websites/lib/computeRide';
import { cn } from '@/lib/utils';

type Theme = 'dark' | 'light';

type Props = {
  area: ServiceArea;
  pricing: Pricing;
  locale: WebsiteLocale;
  theme: Theme;
  startCityId: string | null;
  endCityId: string | null;
  onChange: (next: { startCityId: string | null; endCityId: string | null }) => void;
  className?: string;
};

const inputBase =
  'w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:ring-2';

const inputTheme: Record<Theme, string> = {
  dark: 'border-neutral-800 bg-neutral-800 text-white focus:ring-white/40',
  light: 'border-neutral-300 bg-white text-neutral-900 focus:ring-neutral-900/30',
};

const labelTheme: Record<Theme, string> = {
  dark: 'text-neutral-400',
  light: 'text-neutral-600',
};

export function RideCalculator({
  area,
  pricing,
  locale,
  theme,
  startCityId,
  endCityId,
  onChange,
  className,
}: Props) {
  const options = useMemo(
    () =>
      area.cities.map((c) => ({
        id: c.id,
        label: pickLocalized(c.name, locale),
      })),
    [area.cities, locale],
  );

  const result = computeRide(area, pricing, startCityId, endCityId);
  const disabled = options.length < 2;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className={cn('text-xs font-medium', labelTheme[theme])}>
            {t(UI_COPY.calc.from, locale)}
          </span>
          <select
            className={cn(inputBase, inputTheme[theme])}
            disabled={disabled}
            value={startCityId ?? ''}
            onChange={(e) => onChange({ startCityId: e.target.value || null, endCityId })}
          >
            <option value="">{t(UI_COPY.calc.selectCity, locale)}</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className={cn('text-xs font-medium', labelTheme[theme])}>
            {t(UI_COPY.calc.to, locale)}
          </span>
          <select
            className={cn(inputBase, inputTheme[theme])}
            disabled={disabled}
            value={endCityId ?? ''}
            onChange={(e) => onChange({ startCityId, endCityId: e.target.value || null })}
          >
            <option value="">{t(UI_COPY.calc.selectCity, locale)}</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <CalcResultView result={result} locale={locale} theme={theme} />
    </div>
  );
}

function CalcResultView({
  result,
  locale,
  theme,
}: {
  result: CalcResult;
  locale: WebsiteLocale;
  theme: Theme;
}) {
  const muted = theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500';
  const value = theme === 'dark' ? 'text-white' : 'text-neutral-900';

  if (result.kind === 'idle') return null;
  if (result.kind === 'same_pair') {
    return <p className={cn('text-xs', muted)}>{t(UI_COPY.calc.samePair, locale)}</p>;
  }
  if (result.kind === 'unknown_route') {
    return <p className={cn('text-xs', muted)}>{t(UI_COPY.calc.noRoute, locale)}</p>;
  }
  return (
    <div className="flex flex-col gap-1 text-sm">
      <p className={cn(muted)}>
        <span>{t(UI_COPY.calc.distance, locale)}: </span>
        <span className={cn('font-mono tabular-nums', value)}>
          {formatWithUnit(result.distanceKm, 'km', result.distanceKm % 1 === 0 ? 0 : 1)}
        </span>
      </p>
      <p className={cn(muted)}>
        <span>{t(UI_COPY.calc.estimate, locale)}: </span>
        <span className={cn('font-mono tabular-nums text-lg font-semibold', value)}>
          {formatCurrencyEURFull(result.estimateCents / 100)}
        </span>
        {result.minFareApplied && (
          <span className="ml-2 text-xs">· {t(UI_COPY.calc.minFareApplies, locale)}</span>
        )}
      </p>
    </div>
  );
}
