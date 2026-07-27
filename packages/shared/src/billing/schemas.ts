import { z } from 'zod';
import { MoneyCentsSchema } from '../common/money';

export const BillingCycleSchema = z.enum(['monthly', 'annual']);
export type BillingCycle = z.infer<typeof BillingCycleSchema>;

export const SubscriptionStatusSchema = z.enum([
  'active',
  'past_due',
  'cancelled',
  'paused',
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  productCode: z.string(),
  mrrCents: MoneyCentsSchema,
  billingCycle: BillingCycleSchema,
  status: SubscriptionStatusSchema,
  startedAt: z.string().datetime(),
  nextInvoiceAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Subscription = z.infer<typeof SubscriptionSchema>;

export const CreateSubscriptionInputSchema = SubscriptionSchema.pick({
  customerId: true,
  productCode: true,
  mrrCents: true,
  billingCycle: true,
  status: true,
  startedAt: true,
  nextInvoiceAt: true,
});
export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionInputSchema>;

/* ---------- Invoices ---------- */

export const InvoiceStatusSchema = z.enum(['draft', 'sent', 'paid', 'overdue', 'void']);
export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;

export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  number: z.string().min(1),
  customerId: z.string().uuid(),
  subscriptionId: z.string().uuid().nullable(),
  amountCents: MoneyCentsSchema,
  status: InvoiceStatusSchema,
  issuedAt: z.string().datetime(),
  dueAt: z.string().datetime(),
  paidAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Invoice = z.infer<typeof InvoiceSchema>;

export const CreateInvoiceInputSchema = InvoiceSchema.pick({
  number: true,
  customerId: true,
  subscriptionId: true,
  amountCents: true,
  status: true,
  issuedAt: true,
  dueAt: true,
  paidAt: true,
});
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceInputSchema>;
