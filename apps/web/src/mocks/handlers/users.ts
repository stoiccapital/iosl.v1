import { CreateUserInputSchema } from '@factory/shared';
import { db } from '../db';
import { crudHandlers, iso, uuid } from '../lib/crud';
import { mergeDefined } from '../lib/merge';

export const usersHandlers = crudHandlers({
  base: '/api/users',
  getAll: () => db.users,
  setAll: (rows) => {
    db.users = rows;
  },
  createSchema: CreateUserInputSchema,
  updateSchema: CreateUserInputSchema.partial(),
  applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
  applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
});
