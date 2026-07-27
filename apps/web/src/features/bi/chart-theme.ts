import { formatCurrencyEUR, formatNumber } from '@/lib/format';

export const CHART_PRIMARY = '#0f172a';
export const CHART_SLATE = '#475569';
export const CHART_MUTED = '#94a3b8';
export const CHART_LIGHT = '#cbd5e1';

export const CHART_COLORS: string[] = [
  CHART_PRIMARY,
  CHART_SLATE,
  '#64748b',
  CHART_MUTED,
  CHART_LIGHT,
  '#e2e8f0',
];

export function colorAt(i: number): string {
  return CHART_COLORS[i % CHART_COLORS.length] ?? CHART_PRIMARY;
}

/** Chart values are pre-divided euros (not cents). Compact by the global rule. */
export function eurLabel(euros: number): string {
  return formatNumber(euros);
}

export function tooltipEur(v: unknown): string {
  const n = Number(v);
  return formatCurrencyEUR(Number.isFinite(n) ? n : 0);
}

export function tooltipEurTick(v: unknown): string {
  const n = Number(v);
  return formatNumber(Number.isFinite(n) ? n : 0);
}
