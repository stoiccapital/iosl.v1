import { CreatePayrollEntryInputSchema } from '@factory/shared';
import { db } from '../db';
import { crudHandlers, iso, uuid } from '../lib/crud';
import { mergeDefined } from '../lib/merge';

export const payrollHandlers = crudHandlers({
  base: '/api/payroll',
  getAll: () => db.payrollEntries,
  setAll: (rows) => {
    db.payrollEntries = rows;
  },
  createSchema: CreatePayrollEntryInputSchema,
  updateSchema: CreatePayrollEntryInputSchema.partial(),
  applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
  applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
});
