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

/**
 * Human-scannable relative time ("5 min ago", "yesterday", "3 mo ago").
 * Prefer this over `formatDateTime` in note lists / audit lines. Put the
 * absolute date/time in the element's `title` attribute for hover-precision.
 */
export function formatRelative(input: string | Date, now: Date = new Date()): string {
  const then = typeof input === 'string' ? new Date(input) : input;
  const diffMs = now.getTime() - then.getTime();
  const future = diffMs < 0;
  const abs = Math.abs(diffMs);
  const sec = Math.round(abs / 1000);
  if (sec < 30) return 'just now';
  const min = Math.round(sec / 60);
  if (min < 60) return future ? `in ${min} min` : `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return future ? `in ${hr} h` : `${hr} h ago`;
  const day = Math.round(hr / 24);
  if (day === 1) return future ? 'tomorrow' : 'yesterday';
  if (day < 7) return future ? `in ${day} days` : `${day} days ago`;
  const week = Math.round(day / 7);
  if (week < 5) return future ? `in ${week} wk` : `${week} wk ago`;
  const mo = Math.round(day / 30);
  if (mo < 12) return future ? `in ${mo} mo` : `${mo} mo ago`;
  const yr = Math.round(day / 365);
  return future ? `in ${yr} yr` : `${yr} yr ago`;
}
