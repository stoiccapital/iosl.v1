import { z } from 'zod';
import { CurrentUserSchema, RoleSchema } from '../common/auth';

export const UserSchema = CurrentUserSchema.extend({
  active: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type User = z.infer<typeof UserSchema>;

export const CreateUserInputSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  role: RoleSchema,
  active: z.boolean(),
});
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
