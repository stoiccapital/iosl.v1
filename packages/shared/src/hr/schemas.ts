import { z } from 'zod';
import { PersonTypeSchema } from '../common/person';
import { MoneyCentsSchema } from '../common/money';

export const CreatePersonInputSchema = z.object({
  type: PersonTypeSchema,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  role: z.string().min(1),
  location: z.string().min(1),
  startDate: z.string().datetime().nullable(),
});
export type CreatePersonInput = z.infer<typeof CreatePersonInputSchema>;

export const PayrollCadenceSchema = z.enum(['monthly', 'one_time']);
export type PayrollCadence = z.infer<typeof PayrollCadenceSchema>;

export const PayrollEntrySchema = z.object({
  id: z.string().uuid(),
  personId: z.string().uuid(),
  grossAmountCents: MoneyCentsSchema,
  effectiveDate: z.string().datetime(),
  cadence: PayrollCadenceSchema,
  note: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type PayrollEntry = z.infer<typeof PayrollEntrySchema>;

export const CreatePayrollEntryInputSchema = PayrollEntrySchema.pick({
  personId: true,
  grossAmountCents: true,
  effectiveDate: true,
  cadence: true,
  note: true,
});
export type CreatePayrollEntryInput = z.infer<typeof CreatePayrollEntryInputSchema>;
