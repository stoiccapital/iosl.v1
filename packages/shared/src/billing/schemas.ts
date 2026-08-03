import { z } from 'zod';
import { MoneyCentsSchema } from '../common/money';
import { RoleSchema } from '../common/auth';

export const BillingCycleSchema = z.enum(['monthly', 'annual']);
export type BillingCycle = z.infer<typeof BillingCycleSchema>;

export const SubscriptionStatusSchema = z.enum([
  'draft',
  'payment_link_sent',
  'paid',
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
  opportunityId: z.string().uuid().nullable(),
  quantity: z.number().int().min(1),
  mrrCents: MoneyCentsSchema,
  billingCycle: BillingCycleSchema,
  status: SubscriptionStatusSchema,
  paymentLinkUrl: z.string().url().nullable(),
  startedAt: z.string().datetime(),
  nextInvoiceAt: z.string().datetime().nullable(),
  activatedAt: z.string().datetime().nullable(),
  activatedById: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Subscription = z.infer<typeof SubscriptionSchema>;

export const CreateSubscriptionInputSchema = SubscriptionSchema.pick({
  customerId: true,
  productCode: true,
  opportunityId: true,
  quantity: true,
  mrrCents: true,
  billingCycle: true,
  status: true,
  startedAt: true,
  nextInvoiceAt: true,
});
export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionInputSchema>;

/* ---------- Subscription state transitions (audit log) ---------- */

export const SubscriptionTransitionSchema = z.object({
  id: z.string().uuid(),
  subscriptionId: z.string().uuid(),
  fromStatus: SubscriptionStatusSchema.nullable(),
  toStatus: SubscriptionStatusSchema,
  actorUserId: z.string().uuid().nullable(),
  actorRole: RoleSchema.nullable(),
  note: z.string().nullable(),
  at: z.string().datetime(),
});
export type SubscriptionTransition = z.infer<typeof SubscriptionTransitionSchema>;

/* ---------- Opportunity close flow ---------- */

export const OpportunityCloseInputSchema = z
  .object({
    note: z.string().nullable().optional(),
  })
  .default({});
export type OpportunityCloseInput = z.infer<typeof OpportunityCloseInputSchema>;

export const OpportunityCloseResultSchema = z.object({
  opportunityId: z.string().uuid(),
  subscriptions: z.array(SubscriptionSchema),
  paymentLinkUrl: z.string().url(),
});
export type OpportunityCloseResult = z.infer<typeof OpportunityCloseResultSchema>;

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
