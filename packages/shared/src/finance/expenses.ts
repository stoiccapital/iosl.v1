import { z } from 'zod';
import { MoneyCentsSchema } from '../common/money';

/**
 * Ad-hoc one-off costs. Distinct from Supplier contracts (recurring vendor
 * spend) and HR/Payroll (people). This is the *only* cost surface where a
 * user types directly into Finance — everything else is derived from
 * Suppliers or HR.
 */
export const ExpenseCategorySchema = z.enum([
  'travel',
  'software',
  'office',
  'meals',
  'training',
  'marketing',
  'legal',
  'other',
]);
export type ExpenseCategory = z.infer<typeof ExpenseCategorySchema>;

export const ExpensePnlBucketSchema = z.enum(['cogs', 'rnd', 'sm', 'ga']);
export type ExpensePnlBucket = z.infer<typeof ExpensePnlBucketSchema>;

/**
 * Category → P&L bucket mapping. Users pick a category; Finance derives the
 * bucket. Kept as a pure lookup so BE can port it 1:1.
 */
export function expenseCategoryToBucket(category: ExpenseCategory): ExpensePnlBucket {
  switch (category) {
    case 'travel':
    case 'marketing':
      return 'sm';
    case 'software':
    case 'training':
      return 'rnd';
    case 'office':
    case 'meals':
    case 'legal':
    case 'other':
      return 'ga';
  }
}

export const ExpenseSchema = z.object({
  id: z.string().uuid(),
  description: z.string().min(1).max(200),
  /**
   * Reference to a Supplier when the vendor exists in the catalog. When the
   * expense is a one-off (the "Other" option in the picker), this is null
   * and `vendorName` carries the free-text name.
   */
  supplierId: z.string().uuid().nullable(),
  vendorName: z.string().max(120),
  category: ExpenseCategorySchema,
  amountCents: MoneyCentsSchema,
  occurredAt: z.string().datetime(),
  paidById: z.string().uuid().nullable(),
  note: z.string().max(2000).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Expense = z.infer<typeof ExpenseSchema>;

export const CreateExpenseInputSchema = ExpenseSchema.pick({
  description: true,
  supplierId: true,
  vendorName: true,
  category: true,
  amountCents: true,
  occurredAt: true,
  paidById: true,
  note: true,
});
export type CreateExpenseInput = z.infer<typeof CreateExpenseInputSchema>;
