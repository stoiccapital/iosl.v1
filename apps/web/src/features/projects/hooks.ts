import { z } from 'zod';
import {
  AssignmentSchema,
  ProjectSchema,
  TimeEntrySchema,
  type Assignment,
  type CreateAssignmentInput,
  type CreateProjectInput,
  type CreateTimeEntryInput,
  type Project,
  type TimeEntry,
} from '@factory/shared';
import { makeResourceHooks } from '@/lib/crud-hooks';

export const projectHooks = makeResourceHooks<Project, CreateProjectInput, Partial<CreateProjectInput>>({
  base: '/projects',
  domain: 'projects',
  itemSchema: ProjectSchema,
  listSchema: z.array(ProjectSchema),
});

export const assignmentHooks = makeResourceHooks<
  Assignment,
  CreateAssignmentInput,
  Partial<CreateAssignmentInput>
>({
  base: '/assignments',
  domain: 'assignments',
  itemSchema: AssignmentSchema,
  listSchema: z.array(AssignmentSchema),
});

export const timeEntryHooks = makeResourceHooks<
  TimeEntry,
  CreateTimeEntryInput,
  Partial<CreateTimeEntryInput>
>({
  base: '/time-entries',
  domain: 'time-entries',
  itemSchema: TimeEntrySchema,
  listSchema: z.array(TimeEntrySchema),
});
