import { z } from 'zod';
import { AccountSchema, type Account, type CreateAccountInput } from '@factory/shared';
import { makeResourceHooks } from '@/lib/crud-hooks';

export const accountHooks = makeResourceHooks<
  Account,
  CreateAccountInput,
  Partial<CreateAccountInput>
>({
  base: '/accounts',
  domain: 'accounts',
  itemSchema: AccountSchema,
  listSchema: z.array(AccountSchema),
});
