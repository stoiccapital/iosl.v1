import { z } from 'zod';

export const ProjectStatusSchema = z.enum(['planning', 'active', 'on_hold', 'done']);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  code: z.string().min(1),
  clientAccountId: z.string().uuid().nullable(),
  status: ProjectStatusSchema,
  startDate: z.string().datetime(),
  targetEndDate: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const CreateProjectInputSchema = ProjectSchema.pick({
  name: true,
  code: true,
  clientAccountId: true,
  status: true,
  startDate: true,
  targetEndDate: true,
});
export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;

/* ---------- Assignments ---------- */

export const AssignmentStatusSchema = z.enum(['active', 'ended']);
export type AssignmentStatus = z.infer<typeof AssignmentStatusSchema>;

export const AssignmentSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  personId: z.string().uuid(),
  role: z.string().min(1),
  allocationPercent: z.number().int().min(0).max(100),
  status: AssignmentStatusSchema,
  location: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Assignment = z.infer<typeof AssignmentSchema>;

export const CreateAssignmentInputSchema = AssignmentSchema.pick({
  projectId: true,
  personId: true,
  role: true,
  allocationPercent: true,
  status: true,
  location: true,
});
export type CreateAssignmentInput = z.infer<typeof CreateAssignmentInputSchema>;

/* ---------- Time entries ---------- */

export const TimeEntrySchema = z.object({
  id: z.string().uuid(),
  assignmentId: z.string().uuid(),
  date: z.string().datetime(),
  hours: z.number().nonnegative(),
  note: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type TimeEntry = z.infer<typeof TimeEntrySchema>;

export const CreateTimeEntryInputSchema = TimeEntrySchema.pick({
  assignmentId: true,
  date: true,
  hours: true,
  note: true,
});
export type CreateTimeEntryInput = z.infer<typeof CreateTimeEntryInputSchema>;
