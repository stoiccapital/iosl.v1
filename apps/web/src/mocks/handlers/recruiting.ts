import { CreateCandidateInputSchema, CreatePositionInputSchema } from '@factory/shared';
import { db } from '../db';
import { crudHandlers, iso, uuid } from '../lib/crud';
import { mergeDefined } from '../lib/merge';

export const recruitingHandlers = [
  ...crudHandlers({
    base: '/api/positions',
    getAll: () => db.positions,
    setAll: (rows) => {
      db.positions = rows;
    },
    createSchema: CreatePositionInputSchema,
    updateSchema: CreatePositionInputSchema.partial(),
    applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
    applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
  }),
  ...crudHandlers({
    base: '/api/candidates',
    getAll: () => db.candidates,
    setAll: (rows) => {
      db.candidates = rows;
    },
    createSchema: CreateCandidateInputSchema,
    updateSchema: CreateCandidateInputSchema.partial(),
    applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
    applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
  }),
];
