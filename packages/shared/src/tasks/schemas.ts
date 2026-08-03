import { z } from 'zod';

export const TaskStatusSchema = z.enum(['open', 'in_progress', 'done']);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

/**
 * A task can optionally be tied to another entity so it surfaces in that
 * entity's context (Opportunity detail, Account detail, etc.). Kept
 * lightweight — no polymorphic FK table yet.
 */
export const TaskRelatedTypeSchema = z.enum(['account', 'opportunity', 'account_contact']);
export type TaskRelatedType = z.infer<typeof TaskRelatedTypeSchema>;

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable(),
  status: TaskStatusSchema,
  assigneeId: z.string().uuid().nullable(),
  dueAt: z.string().datetime().nullable(),
  relatedType: TaskRelatedTypeSchema.nullable(),
  relatedId: z.string().uuid().nullable(),
  doneAt: z.string().datetime().nullable(),
  doneById: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Task = z.infer<typeof TaskSchema>;

export const TaskListSchema = z.array(TaskSchema);

export const CreateTaskInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).nullable().default(null),
  status: TaskStatusSchema.default('open'),
  assigneeId: z.string().uuid().nullable().default(null),
  dueAt: z.string().datetime().nullable().default(null),
  relatedType: TaskRelatedTypeSchema.nullable().default(null),
  relatedId: z.string().uuid().nullable().default(null),
});
export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;

export const UpdateTaskInputSchema = CreateTaskInputSchema.partial();
export type UpdateTaskInput = z.infer<typeof UpdateTaskInputSchema>;
