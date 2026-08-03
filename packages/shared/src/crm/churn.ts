import { z } from 'zod';
import { MoneyCentsSchema } from '../common/money';
import { ChurnReasonSchema } from './schemas';

export const ChurnedCustomerRowSchema = z.object({
  customerId: z.string().uuid(),
  accountName: z.string(),
  productName: z.string(),
  mrrCents: MoneyCentsSchema,
  churnedAt: z.string().datetime(),
  churnReason: ChurnReasonSchema.nullable(),
  tenureDays: z.number().int().nonnegative(),
});
export type ChurnedCustomerRow = z.infer<typeof ChurnedCustomerRowSchema>;

export const AtRiskAccountRowSchema = z.object({
  accountId: z.string().uuid(),
  accountName: z.string(),
  mrrCents: MoneyCentsSchema,
  openTickets: z.number().int().nonnegative(),
  overdueInvoices: z.number().int().nonnegative(),
  score: z.number().int(),
});
export type AtRiskAccountRow = z.infer<typeof AtRiskAccountRowSchema>;

export const ChurnByReasonSchema = z.object({
  reason: z.string(),
  count: z.number().int().nonnegative(),
  mrrCents: MoneyCentsSchema,
});

export const ChurnViewSchema = z.object({
  windowDays: z.number().int().nonnegative(),
  churnedCount: z.number().int().nonnegative(),
  churnedMrrCents: MoneyCentsSchema,
  logoChurnBps: z.number().int().nonnegative(),
  revenueChurnBps: z.number().int().nonnegative(),
  voluntaryCount: z.number().int().nonnegative(),
  voluntaryMrrCents: MoneyCentsSchema,
  involuntaryCount: z.number().int().nonnegative(),
  involuntaryMrrCents: MoneyCentsSchema,
  atRiskCount: z.number().int().nonnegative(),
  atRiskMrrCents: MoneyCentsSchema,
  churned: z.array(ChurnedCustomerRowSchema),
  atRisk: z.array(AtRiskAccountRowSchema),
  byReason: z.array(ChurnByReasonSchema),
});
export type ChurnView = z.infer<typeof ChurnViewSchema>;
