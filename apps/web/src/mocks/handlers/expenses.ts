import {
  CreateExpenseInputSchema,
} from '@factory/shared';
import { db } from '../db';
import { crudHandlers, iso, uuid } from '../lib/crud';
import { mergeDefined } from '../lib/merge';

export const expensesHandlers = crudHandlers({
  base: '/api/expenses',
  getAll: () => db.expenses,
  setAll: (rows) => {
    db.expenses = rows;
  },
  createSchema: CreateExpenseInputSchema,
  updateSchema: CreateExpenseInputSchema.partial(),
  applyCreate: (input) => ({
    id: uuid(),
    ...input,
    createdAt: iso(),
    updatedAt: iso(),
  }),
  applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
});
