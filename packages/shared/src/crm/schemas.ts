import { z } from 'zod';
import { MoneyCentsSchema } from '../common/money';

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
});
export type CreateAccountInput = z.infer<typeof CreateAccountInputSchema>;

/* ---------- Opportunities ---------- */

export const OpportunityStageSchema = z.enum([
  'qualified',
  'trial',
  'decision',
  'close_won',
  'close_lost',
]);
export type OpportunityStage = z.infer<typeof OpportunityStageSchema>;

export const OPPORTUNITY_STAGE_ORDER: OpportunityStage[] = [
  'qualified',
  'trial',
  'decision',
  'close_won',
  'close_lost',
];

export const OpportunitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  accountId: z.string().uuid(),
  stage: OpportunityStageSchema,
  amountCents: MoneyCentsSchema,
  probability: z.number().int().min(0).max(100),
  expectedCloseDate: z.string().datetime(),
  ownerId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Opportunity = z.infer<typeof OpportunitySchema>;

export const CreateOpportunityInputSchema = OpportunitySchema.pick({
  name: true,
  accountId: true,
  stage: true,
  amountCents: true,
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
  'other',
]);
export type ChurnReason = z.infer<typeof ChurnReasonSchema>;

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
