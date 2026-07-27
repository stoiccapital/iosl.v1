import {
  CreateAssignmentInputSchema,
  CreateProjectInputSchema,
  CreateTimeEntryInputSchema,
} from '@factory/shared';
import { db } from '../db';
import { crudHandlers, iso, uuid } from '../lib/crud';
import { mergeDefined } from '../lib/merge';

export const projectHandlers = [
  ...crudHandlers({
    base: '/api/projects',
    getAll: () => db.projects,
    setAll: (rows) => {
      db.projects = rows;
    },
    createSchema: CreateProjectInputSchema,
    updateSchema: CreateProjectInputSchema.partial(),
    applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
    applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
  }),
  ...crudHandlers({
    base: '/api/assignments',
    getAll: () => db.assignments,
    setAll: (rows) => {
      db.assignments = rows;
    },
    createSchema: CreateAssignmentInputSchema,
    updateSchema: CreateAssignmentInputSchema.partial(),
    applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
    applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
  }),
  ...crudHandlers({
    base: '/api/time-entries',
    getAll: () => db.timeEntries,
    setAll: (rows) => {
      db.timeEntries = rows;
    },
    createSchema: CreateTimeEntryInputSchema,
    updateSchema: CreateTimeEntryInputSchema.partial(),
    applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
    applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
  }),
];
