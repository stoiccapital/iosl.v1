export function centsToEurString(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}

/**
 * Parses a EUR decimal string (supports both '2,50' and '2.50') to cents.
 * Returns null on invalid input.
 */
export function eurStringToCents(input: string): number | null {
  const normalised = input.trim().replace(/\s+/g, '').replace(',', '.');
  if (normalised === '') return 0;
  if (!/^\d+(\.\d{1,2})?$/.test(normalised)) return null;
  const n = Number.parseFloat(normalised);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}
