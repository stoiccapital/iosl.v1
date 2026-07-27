import type { PayrollEntry, Person, SupplierCategory } from '@factory/shared';

export type PnlBucket = 'cogs' | 'rnd' | 'sm' | 'ga';

/**
 * Supplier → P&L bucket. Kept as a pure lookup so the BE can port it 1:1.
 */
export function supplierBucket(category: SupplierCategory): PnlBucket {
  switch (category) {
    case 'infrastructure':
      return 'cogs';
    case 'marketing':
      return 'sm';
    case 'saas':
    case 'legal':
    case 'office':
    case 'other':
      return 'ga';
  }
}

const RND_ROLES = new Set([
  'Head of Engineering',
  'Senior Backend Engineer',
  'Backend Engineer',
  'Frontend Engineer',
  'Senior Frontend Engineer',
  'DevOps Consultant',
  'DevOps Engineer',
  'Product Designer',
  'Product Manager',
]);

const SM_ROLES = new Set(['Head of Sales', 'Account Executive', 'SDR', 'Content Marketer']);

/**
 * Payroll → P&L bucket by role. Freelancers currently follow the same mapping
 * as employees; if that ever changes, the fallback is G&A.
 */
export function payrollBucket(_entry: PayrollEntry, person: Person | undefined): PnlBucket {
  if (!person) return 'ga';
  if (RND_ROLES.has(person.role)) return 'rnd';
  if (SM_ROLES.has(person.role)) return 'sm';
  return 'ga';
}
