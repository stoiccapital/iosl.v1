import { z } from 'zod';
import { CustomerSchema, type CreateCustomerInput, type Customer } from '@factory/shared';
import { makeResourceHooks } from '@/lib/crud-hooks';

export const customerHooks = makeResourceHooks<
  Customer,
  CreateCustomerInput,
  Partial<CreateCustomerInput>
>({
  base: '/customers',
  domain: 'customers',
  itemSchema: CustomerSchema,
  listSchema: z.array(CustomerSchema),
});
