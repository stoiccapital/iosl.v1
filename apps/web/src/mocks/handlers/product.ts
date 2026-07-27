import {
  CreateFeatureInputSchema,
  CreateIncidentInputSchema,
  CreateReleaseInputSchema,
} from '@factory/shared';
import { db } from '../db';
import { crudHandlers, iso, uuid } from '../lib/crud';
import { mergeDefined } from '../lib/merge';

export const productHandlers = [
  ...crudHandlers({
    base: '/api/features',
    getAll: () => db.features,
    setAll: (rows) => {
      db.features = rows;
    },
    createSchema: CreateFeatureInputSchema,
    updateSchema: CreateFeatureInputSchema.partial(),
    applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
    applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
  }),
  ...crudHandlers({
    base: '/api/releases',
    getAll: () => db.releases,
    setAll: (rows) => {
      db.releases = rows;
    },
    createSchema: CreateReleaseInputSchema,
    updateSchema: CreateReleaseInputSchema.partial(),
    applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
    applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
  }),
  ...crudHandlers({
    base: '/api/incidents',
    getAll: () => db.incidents,
    setAll: (rows) => {
      db.incidents = rows;
    },
    createSchema: CreateIncidentInputSchema,
    updateSchema: CreateIncidentInputSchema.partial(),
    applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
    applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
  }),
];
