import { CreateTicketInputSchema } from '@factory/shared';
import { db } from '../db';
import { crudHandlers, iso, uuid } from '../lib/crud';
import { mergeDefined } from '../lib/merge';

export const supportHandlers = crudHandlers({
  base: '/api/tickets',
  getAll: () => db.tickets,
  setAll: (rows) => {
    db.tickets = rows;
  },
  createSchema: CreateTicketInputSchema,
  updateSchema: CreateTicketInputSchema.partial(),
  applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
  applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
});
