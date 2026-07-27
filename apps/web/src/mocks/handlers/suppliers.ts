import { CreateContractInputSchema, CreateSupplierInputSchema } from '@factory/shared';
import { db } from '../db';
import { crudHandlers, iso, uuid } from '../lib/crud';
import { mergeDefined } from '../lib/merge';

export const supplierHandlers = [
  ...crudHandlers({
    base: '/api/suppliers',
    getAll: () => db.suppliers,
    setAll: (rows) => {
      db.suppliers = rows;
    },
    createSchema: CreateSupplierInputSchema,
    updateSchema: CreateSupplierInputSchema.partial(),
    applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
    applyUpdate: (current, input) =>
      mergeDefined({ ...current, updatedAt: iso() }, input),
  }),

  ...crudHandlers({
    base: '/api/contracts',
    getAll: () => db.contracts,
    setAll: (rows) => {
      db.contracts = rows;
    },
    createSchema: CreateContractInputSchema,
    updateSchema: CreateContractInputSchema.partial(),
    applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
    applyUpdate: (current, input) =>
      mergeDefined({ ...current, updatedAt: iso() }, input),
  }),
];
