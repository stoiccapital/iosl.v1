import { z } from 'zod';
import { MoneyCentsSchema } from '../common/money';

export const CostSourceSchema = z.enum(['supplier', 'payroll', 'expense']);
export type CostSource = z.infer<typeof CostSourceSchema>;

export const CostCategorySchema = z.enum([
  'saas',
  'infrastructure',
  'marketing',
  'legal',
  'office',
  'other',
  'salary',
  'contractor',
]);
export type CostCategory = z.infer<typeof CostCategorySchema>;

/**
 * Derived at read time from Suppliers/Contracts + HR/Payroll. Never written directly.
 */
export const CostEntrySchema = z.object({
  id: z.string(),
  source: CostSourceSchema,
  sourceId: z.string().uuid(),
  category: CostCategorySchema,
  periodMonth: z.string().regex(/^\d{4}-\d{2}$/),
  amountCents: MoneyCentsSchema,
  description: z.string(),
});
export type CostEntry = z.infer<typeof CostEntrySchema>;

/* ---------- Revenue ---------- */

/**
 * Also derived: read from Customers × Products, one row per customer per month
 * that a subscription was active in the reporting window.
 */
export const RevenueEntrySchema = z.object({
  id: z.string(),
  customerId: z.string().uuid(),
  accountId: z.string().uuid(),
  productCode: z.string(),
  periodMonth: z.string().regex(/^\d{4}-\d{2}$/),
  amountCents: MoneyCentsSchema,
});
export type RevenueEntry = z.infer<typeof RevenueEntrySchema>;
