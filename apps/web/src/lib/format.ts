const LOCALE = 'de-DE';

const numberFmt = new Intl.NumberFormat(LOCALE);
const decimalFmt = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Compact suffixes — lowercase, glued to the number ("150k", not "150 k").
 * Applied to counts + currency values that are ≥ 1 000. Below 1 000 the
 * number renders in full ("999", "500 €"). Percentages, decimals, durations,
 * and dates are NOT compacted — they read better in full.
 */
const COMPACT_TIERS: { threshold: number; divisor: number; suffix: string }[] = [
  { threshold: 1_000_000_000_000, divisor: 1_000_000_000_000, suffix: 't' },
  { threshold: 1_000_000_000, divisor: 1_000_000_000, suffix: 'b' },
  { threshold: 1_000_000, divisor: 1_000_000, suffix: 'm' },
  { threshold: 1_000, divisor: 1_000, suffix: 'k' },
];

function formatCompactUnitless(n: number): string {
  const abs = Math.abs(n);
  if (abs < 1_000) return numberFmt.format(n);
  const tier = COMPACT_TIERS.find((t) => abs >= t.threshold)!;
  const scaled = n / tier.divisor;
  const isInt = Math.abs(scaled - Math.round(scaled)) < 1e-9;
  const body = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: isInt ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(scaled);
  return `${body}${tier.suffix}`;
}

export function formatNumber(n: number): string {
  return formatCompactUnitless(n);
}

/** Opt-out: use when full precision is required (invoices, receipts, ledgers). */
export function formatNumberFull(n: number): string {
  return numberFmt.format(n);
}

export function formatDecimal(n: number): string {
  return decimalFmt.format(n);
}

export function formatWithUnit(n: number, unit: string, fractionDigits = 0): string {
  const value = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(n);
  return `${value} ${unit}`;
}

export function formatPercent(n: number, fractionDigits = 0): string {
  return `${new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(n)} %`;
}

export function formatCurrencyEUR(n: number): string {
  return `${formatCompactUnitless(n)} €`;
}

/** Opt-out: use when line-item precision is required (invoices, payslips). */
export function formatCurrencyEURFull(n: number): string {
  return `${decimalFmt.format(n)} €`;
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} h`);
  if (m > 0 || h > 0) parts.push(`${m} min`);
  parts.push(`${sec} s`);
  return parts.join(' ');
}

const dateFmt = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const dateTimeFmt = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function formatDate(input: string | Date): string {
  return dateFmt.format(typeof input === 'string' ? new Date(input) : input);
}

export function formatDateTime(input: string | Date): string {
  return dateTimeFmt.format(typeof input === 'string' ? new Date(input) : input);
}
