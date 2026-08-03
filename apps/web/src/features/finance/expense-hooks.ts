import { z } from 'zod';
import {
  ExpenseSchema,
  type CreateExpenseInput,
  type Expense,
} from '@factory/shared';
import { makeResourceHooks } from '@/lib/crud-hooks';

export const expenseHooks = makeResourceHooks<
  Expense,
  CreateExpenseInput,
  Partial<CreateExpenseInput>
>({
  base: '/expenses',
  domain: 'expenses',
  itemSchema: ExpenseSchema,
  listSchema: z.array(ExpenseSchema),
});
