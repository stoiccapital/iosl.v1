import { z } from 'zod';

/**
 * All monetary values are stored as integer cents (EUR).
 * Display formatting happens in the FE via formatCurrencyEUR.
 */
export const MoneyCentsSchema = z.number().int().nonnegative();
export type MoneyCents = z.infer<typeof MoneyCentsSchema>;
