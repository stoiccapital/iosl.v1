import { z } from 'zod';
import { MoneyCentsSchema } from '../common/money';

/**
 * High-level summary notes (on Account and Contact) are meant to be concise
 * ongoing context, not a running log. Enforced at the schema level.
 */
export const SUMMARY_NOTE_MAX = 300;

/* ---------- Leads ---------- */

export const LeadSourceSchema = z.enum(['referral', 'inbound', 'outbound', 'event']);
export type LeadSource = z.infer<typeof LeadSourceSchema>;

export const LeadStatusSchema = z.enum(['new', 'qualified', 'disqualified']);
export type LeadStatus = z.infer<typeof LeadStatusSchema>;

export const LeadSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  company: z.string().min(1),
  email: z.string().email(),
  source: LeadSourceSchema,
  status: LeadStatusSchema,
  estimatedValueCents: MoneyCentsSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Lead = z.infer<typeof LeadSchema>;

export const CreateLeadInputSchema = LeadSchema.pick({
  name: true,
  company: true,
  email: true,
  source: true,
  status: true,
  estimatedValueCents: true,
});
export type CreateLeadInput = z.infer<typeof CreateLeadInputSchema>;

/* ---------- Accounts ---------- */

export const AccountSizeSchema = z.enum(['1-10', '11-50', '51-200', '201+']);
export type AccountSize = z.infer<typeof AccountSizeSchema>;

export const AccountSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  industry: z.string().min(1),
  size: AccountSizeSchema,
  country: z.string().min(2),
  website: z.string().url().nullable(),
  summaryNote: z.string().max(SUMMARY_NOTE_MAX),
  summaryNoteUpdatedAt: z.string().datetime().nullable(),
  summaryNoteUpdatedById: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Account = z.infer<typeof AccountSchema>;

export const CreateAccountInputSchema = AccountSchema.pick({
  name: true,
  industry: true,
  size: true,
  country: true,
  website: true,
  summaryNote: true,
});
export type CreateAccountInput = z.infer<typeof CreateAccountInputSchema>;

/* ---------- AccountContacts (people on an Account) ---------- */

export const AccountContactSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  title: z.string(),
  email: z.string().email(),
  phone: z.string(),
  summaryNote: z.string().max(SUMMARY_NOTE_MAX),
  summaryNoteUpdatedAt: z.string().datetime().nullable(),
  summaryNoteUpdatedById: z.string().uuid().nullable(),
  active: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type AccountContact = z.infer<typeof AccountContactSchema>;

export const CreateAccountContactInputSchema = AccountContactSchema.pick({
  accountId: true,
  firstName: true,
  lastName: true,
  title: true,
  email: true,
  phone: true,
  summaryNote: true,
});
export type CreateAccountContactInput = z.infer<typeof CreateAccountContactInputSchema>;

export const AccountContactNoteSchema = z.object({
  id: z.string().uuid(),
  accountContactId: z.string().uuid(),
  body: z.string().min(1),
  authorId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
});
export type AccountContactNote = z.infer<typeof AccountContactNoteSchema>;

export const CreateAccountContactNoteInputSchema = AccountContactNoteSchema.pick({
  accountContactId: true,
  body: true,
});
export type CreateAccountContactNoteInput = z.infer<typeof CreateAccountContactNoteInputSchema>;

/* ---------- Opportunities ---------- */

export const OpportunityStageSchema = z.enum([
  'qualified',
  'trial',
  'decision',
  'proposal',
  'close_won',
  'close_lost',
]);
export type OpportunityStage = z.infer<typeof OpportunityStageSchema>;

export const OPPORTUNITY_STAGE_ORDER: OpportunityStage[] = [
  'qualified',
  'trial',
  'decision',
  'proposal',
  'close_won',
  'close_lost',
];

export const OpportunityLineBillingCycleSchema = z.enum(['monthly', 'annual']);
export type OpportunityLineBillingCycle = z.infer<typeof OpportunityLineBillingCycleSchema>;

export const OpportunityLineSchema = z.object({
  productCode: z.string().min(1),
  quantity: z.number().int().min(1),
  contractMonths: z.number().int().min(1),
  billingCycle: OpportunityLineBillingCycleSchema,
});
export type OpportunityLine = z.infer<typeof OpportunityLineSchema>;

export const OpportunitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  accountId: z.string().uuid(),
  stage: OpportunityStageSchema,
  lines: z.array(OpportunityLineSchema),
  amountCents: MoneyCentsSchema,
  probability: z.number().int().min(0).max(100),
  expectedCloseDate: z.string().datetime(),
  ownerId: z.string().uuid().nullable(),
  paymentLinkUrl: z.string().url().nullable(),
  contractSigned: z.boolean(),
  contractSignedAt: z.string().datetime().nullable(),
  contractSignedById: z.string().uuid().nullable(),
  contractDocumentUrl: z.string().url().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Opportunity = z.infer<typeof OpportunitySchema>;

/* ---------- Account notes ---------- */

export const AccountNoteSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  body: z.string().min(1),
  authorId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
});
export type AccountNote = z.infer<typeof AccountNoteSchema>;

export const CreateAccountNoteInputSchema = AccountNoteSchema.pick({
  accountId: true,
  body: true,
});
export type CreateAccountNoteInput = z.infer<typeof CreateAccountNoteInputSchema>;

export const CreateOpportunityInputSchema = OpportunitySchema.pick({
  name: true,
  accountId: true,
  stage: true,
  lines: true,
  probability: true,
  expectedCloseDate: true,
  ownerId: true,
});
export type CreateOpportunityInput = z.infer<typeof CreateOpportunityInputSchema>;

/* ---------- Customers ---------- */

export const ChurnReasonSchema = z.enum([
  'price',
  'competitor',
  'lack_of_use',
  'missing_features',
  'shutdown',
  'payment_failed',
  'other',
]);
export type ChurnReason = z.infer<typeof ChurnReasonSchema>;

export const INVOLUNTARY_CHURN_REASONS: readonly ChurnReason[] = ['payment_failed'];
export function isInvoluntaryChurn(reason: ChurnReason | null): boolean {
  if (reason === null) return false;
  return INVOLUNTARY_CHURN_REASONS.includes(reason);
}

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  productCode: z.string().min(1),
  mrrCents: MoneyCentsSchema,
  since: z.string().datetime(),
  active: z.boolean(),
  churnedAt: z.string().datetime().nullable(),
  churnReason: ChurnReasonSchema.nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Customer = z.infer<typeof CustomerSchema>;

export const CreateCustomerInputSchema = CustomerSchema.pick({
  accountId: true,
  productCode: true,
  mrrCents: true,
  since: true,
  active: true,
  churnedAt: true,
  churnReason: true,
});
export type CreateCustomerInput = z.infer<typeof CreateCustomerInputSchema>;
