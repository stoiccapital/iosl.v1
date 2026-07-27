import { CreateDocInputSchema } from '@factory/shared';
import { db } from '../db';
import { crudHandlers, iso, uuid } from '../lib/crud';
import { mergeDefined } from '../lib/merge';

export const docsHandlers = crudHandlers({
  base: '/api/docs',
  getAll: () => db.docs,
  setAll: (rows) => {
    db.docs = rows;
  },
  createSchema: CreateDocInputSchema,
  updateSchema: CreateDocInputSchema.partial(),
  applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
  applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
});
