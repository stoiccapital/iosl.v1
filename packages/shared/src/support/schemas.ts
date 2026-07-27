import { z } from 'zod';

export const TicketStatusSchema = z.enum(['open', 'pending', 'resolved', 'closed']);
export type TicketStatus = z.infer<typeof TicketStatusSchema>;

export const TicketPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent']);
export type TicketPriority = z.infer<typeof TicketPrioritySchema>;

export const TicketSchema = z.object({
  id: z.string().uuid(),
  subject: z.string().min(1),
  description: z.string(),
  accountId: z.string().uuid().nullable(),
  requesterEmail: z.string().email(),
  status: TicketStatusSchema,
  priority: TicketPrioritySchema,
  assigneeId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Ticket = z.infer<typeof TicketSchema>;

export const CreateTicketInputSchema = TicketSchema.pick({
  subject: true,
  description: true,
  accountId: true,
  requesterEmail: true,
  status: true,
  priority: true,
  assigneeId: true,
});
export type CreateTicketInput = z.infer<typeof CreateTicketInputSchema>;
