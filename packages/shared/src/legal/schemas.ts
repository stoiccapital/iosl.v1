import { z } from 'zod';
import { MoneyCentsSchema } from '../common/money';

export const LegalDocumentTypeSchema = z.enum(['msa', 'order_form', 'sow', 'nda', 'dpa', 'other']);
export type LegalDocumentType = z.infer<typeof LegalDocumentTypeSchema>;

export const LegalDocumentStatusSchema = z.enum([
  'drafting',
  'in_review',
  'signed',
  'expired',
  'terminated',
]);
export type LegalDocumentStatus = z.infer<typeof LegalDocumentStatusSchema>;

export const LegalDocumentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  accountId: z.string().uuid().nullable(),
  type: LegalDocumentTypeSchema,
  status: LegalDocumentStatusSchema,
  valueCents: MoneyCentsSchema,
  signedAt: z.string().datetime().nullable(),
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().nullable(),
  ownerId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type LegalDocument = z.infer<typeof LegalDocumentSchema>;

export const CreateLegalDocumentInputSchema = LegalDocumentSchema.pick({
  name: true,
  accountId: true,
  type: true,
  status: true,
  valueCents: true,
  signedAt: true,
  effectiveFrom: true,
  effectiveTo: true,
  ownerId: true,
});
export type CreateLegalDocumentInput = z.infer<typeof CreateLegalDocumentInputSchema>;
