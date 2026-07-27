import { z } from 'zod';
import { TicketSchema, type CreateTicketInput, type Ticket } from '@factory/shared';
import { makeResourceHooks } from '@/lib/crud-hooks';

export const ticketHooks = makeResourceHooks<Ticket, CreateTicketInput, Partial<CreateTicketInput>>({
  base: '/tickets',
  domain: 'tickets',
  itemSchema: TicketSchema,
  listSchema: z.array(TicketSchema),
});
