import { z } from 'zod';
import { UserSchema, type CreateUserInput, type User } from '@factory/shared';
import { makeResourceHooks } from '@/lib/crud-hooks';

export const userHooks = makeResourceHooks<User, CreateUserInput, Partial<CreateUserInput>>({
  base: '/users',
  domain: 'users',
  itemSchema: UserSchema,
  listSchema: z.array(UserSchema),
});
