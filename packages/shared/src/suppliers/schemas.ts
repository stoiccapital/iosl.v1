import { z } from 'zod';
import { MoneyCentsSchema } from '../common/money';

export const SupplierCategorySchema = z.enum([
  'saas',
  'infrastructure',
  'marketing',
  'legal',
  'office',
  'other',
]);
export type SupplierCategory = z.infer<typeof SupplierCategorySchema>;

export const SupplierSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  category: SupplierCategorySchema,
  country: z.string().min(2),
  contactName: z.string(),
  contactEmail: z.string().email(),
  active: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Supplier = z.infer<typeof SupplierSchema>;

export const CreateSupplierInputSchema = SupplierSchema.pick({
  name: true,
  category: true,
  country: true,
  contactName: true,
  contactEmail: true,
  active: true,
});
export type CreateSupplierInput = z.infer<typeof CreateSupplierInputSchema>;

/* ---------- Contracts ---------- */

export const ContractStatusSchema = z.enum(['active', 'paused', 'ended']);
export type ContractStatus = z.infer<typeof ContractStatusSchema>;

export const ContractSchema = z.object({
  id: z.string().uuid(),
  supplierId: z.string().uuid(),
  name: z.string().min(1),
  monthlyAmountCents: MoneyCentsSchema,
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable(),
  status: ContractStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Contract = z.infer<typeof ContractSchema>;

export const CreateContractInputSchema = ContractSchema.pick({
  supplierId: true,
  name: true,
  monthlyAmountCents: true,
  startDate: true,
  endDate: true,
  status: true,
});
export type CreateContractInput = z.infer<typeof CreateContractInputSchema>;
