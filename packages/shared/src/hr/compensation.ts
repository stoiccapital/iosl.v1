import { z } from 'zod';
import { MoneyCentsSchema } from '../common/money';

export const CompensationKindSchema = z.enum([
  'sales_commission',
  'expansion_commission',
  'retention_bonus',
  'referral_bonus',
  'signing_bonus',
  'spot_bonus',
]);
export type CompensationKind = z.infer<typeof CompensationKindSchema>;

export const CompensationTriggerSchema = z.enum([
  'opportunity_won',
  'customer_created',
  'customer_expansion',
  'referral_hire',
  'manual',
]);
export type CompensationTrigger = z.infer<typeof CompensationTriggerSchema>;

export const CompensationComputationSchema = z.enum([
  'percentage_of_source',
  'fixed_amount',
]);
export type CompensationComputation = z.infer<typeof CompensationComputationSchema>;

export const CompensationSourceTypeSchema = z.enum([
  'opportunity',
  'customer',
  'person',
  'manual',
]);
export type CompensationSourceType = z.infer<typeof CompensationSourceTypeSchema>;

export const CompensationStatusSchema = z.enum(['earned', 'approved', 'paid', 'void']);
export type CompensationStatus = z.infer<typeof CompensationStatusSchema>;

/* ---------- Rule ---------- */

export const CompensationRuleSchema = z.object({
  id: z.string().uuid(),
  personId: z.string().uuid(),
  kind: CompensationKindSchema,
  triggerType: CompensationTriggerSchema,
  computation: CompensationComputationSchema,
  percentageBps: z.number().int().nonnegative().nullable(),
  fixedAmountCents: MoneyCentsSchema.nullable(),
  capCents: MoneyCentsSchema.nullable(),
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().nullable(),
  active: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type CompensationRule = z.infer<typeof CompensationRuleSchema>;

export const CreateCompensationRuleInputSchema = CompensationRuleSchema.pick({
  personId: true,
  kind: true,
  triggerType: true,
  computation: true,
  percentageBps: true,
  fixedAmountCents: true,
  capCents: true,
  effectiveFrom: true,
  effectiveTo: true,
  active: true,
});
export type CreateCompensationRuleInput = z.infer<typeof CreateCompensationRuleInputSchema>;

/* ---------- Event (the ledger) ---------- */

export const CompensationEventSchema = z.object({
  id: z.string().uuid(),
  personId: z.string().uuid(),
  ruleId: z.string().uuid().nullable(),
  kind: CompensationKindSchema,
  triggerType: CompensationTriggerSchema,
  sourceType: CompensationSourceTypeSchema,
  sourceId: z.string().uuid().nullable(),
  amountCents: MoneyCentsSchema,
  earnedAt: z.string().datetime(),
  status: CompensationStatusSchema,
  approvedById: z.string().uuid().nullable(),
  approvedAt: z.string().datetime().nullable(),
  paidAt: z.string().datetime().nullable(),
  note: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type CompensationEvent = z.infer<typeof CompensationEventSchema>;

export const CreateCompensationEventInputSchema = CompensationEventSchema.pick({
  personId: true,
  ruleId: true,
  kind: true,
  triggerType: true,
  sourceType: true,
  sourceId: true,
  amountCents: true,
  earnedAt: true,
  status: true,
  note: true,
});
export type CreateCompensationEventInput = z.infer<typeof CreateCompensationEventInputSchema>;
