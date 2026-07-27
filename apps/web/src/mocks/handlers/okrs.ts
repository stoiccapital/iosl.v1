import {
  CreateKeyResultInputSchema,
  CreateObjectiveInputSchema,
} from '@factory/shared';
import { db } from '../db';
import { crudHandlers, iso, uuid } from '../lib/crud';
import { mergeDefined } from '../lib/merge';

export const okrHandlers = [
  ...crudHandlers({
    base: '/api/objectives',
    getAll: () => db.objectives,
    setAll: (rows) => {
      db.objectives = rows;
    },
    createSchema: CreateObjectiveInputSchema,
    updateSchema: CreateObjectiveInputSchema.partial(),
    applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
    applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
  }),
  ...crudHandlers({
    base: '/api/key-results',
    getAll: () => db.keyResults,
    setAll: (rows) => {
      db.keyResults = rows;
    },
    createSchema: CreateKeyResultInputSchema,
    updateSchema: CreateKeyResultInputSchema.partial(),
    applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
    applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
  }),
];
