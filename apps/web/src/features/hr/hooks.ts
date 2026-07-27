import { z } from 'zod';
import {
  PayrollEntrySchema,
  PersonSchema,
  type CreatePayrollEntryInput,
  type CreatePersonInput,
  type PayrollEntry,
  type Person,
} from '@factory/shared';
import { makeResourceHooks } from '@/lib/crud-hooks';

export const personHooks = makeResourceHooks<Person, CreatePersonInput, Partial<CreatePersonInput>>({
  base: '/people',
  domain: 'people',
  itemSchema: PersonSchema,
  listSchema: z.array(PersonSchema),
});

export const payrollHooks = makeResourceHooks<
  PayrollEntry,
  CreatePayrollEntryInput,
  Partial<CreatePayrollEntryInput>
>({
  base: '/payroll',
  domain: 'payroll',
  itemSchema: PayrollEntrySchema,
  listSchema: z.array(PayrollEntrySchema),
});
