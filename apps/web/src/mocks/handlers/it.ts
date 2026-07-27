import {
  CreateDeviceInputSchema,
  CreateSoftwareLicenseInputSchema,
} from '@factory/shared';
import { db } from '../db';
import { crudHandlers, iso, uuid } from '../lib/crud';
import { mergeDefined } from '../lib/merge';

export const itHandlers = [
  ...crudHandlers({
    base: '/api/devices',
    getAll: () => db.devices,
    setAll: (rows) => {
      db.devices = rows;
    },
    createSchema: CreateDeviceInputSchema,
    updateSchema: CreateDeviceInputSchema.partial(),
    applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
    applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
  }),
  ...crudHandlers({
    base: '/api/software-licenses',
    getAll: () => db.softwareLicenses,
    setAll: (rows) => {
      db.softwareLicenses = rows;
    },
    createSchema: CreateSoftwareLicenseInputSchema,
    updateSchema: CreateSoftwareLicenseInputSchema.partial(),
    applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
    applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
  }),
];
