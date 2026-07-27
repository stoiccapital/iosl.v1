import {
  CreateAccountInputSchema,
  CreateCustomerInputSchema,
  CreateLeadInputSchema,
  CreateOpportunityInputSchema,
} from '@factory/shared';
import { db } from '../db';
import { generateCommissionEventsForOpportunity } from '../lib/compensation';
import { crudHandlers, iso, uuid } from '../lib/crud';
import { mergeDefined } from '../lib/merge';

export const crmHandlers = [
  ...crudHandlers({
    base: '/api/leads',
    getAll: () => db.leads,
    setAll: (rows) => {
      db.leads = rows;
    },
    createSchema: CreateLeadInputSchema,
    updateSchema: CreateLeadInputSchema.partial(),
    applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
    applyUpdate: (current, input) =>
      mergeDefined({ ...current, updatedAt: iso() }, input),
  }),

  ...crudHandlers({
    base: '/api/accounts',
    getAll: () => db.accounts,
    setAll: (rows) => {
      db.accounts = rows;
    },
    createSchema: CreateAccountInputSchema,
    updateSchema: CreateAccountInputSchema.partial(),
    applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
    applyUpdate: (current, input) =>
      mergeDefined({ ...current, updatedAt: iso() }, input),
  }),

  ...crudHandlers({
    base: '/api/opportunities',
    getAll: () => db.opportunities,
    setAll: (rows) => {
      db.opportunities = rows;
    },
    createSchema: CreateOpportunityInputSchema,
    updateSchema: CreateOpportunityInputSchema.partial(),
    applyCreate: (input) => {
      const opp = { id: uuid(), ...input, createdAt: iso(), updatedAt: iso() };
      generateCommissionEventsForOpportunity(opp);
      return opp;
    },
    applyUpdate: (current, input) => {
      const next = mergeDefined({ ...current, updatedAt: iso() }, input);
      if (current.stage !== 'close_won' && next.stage === 'close_won') {
        generateCommissionEventsForOpportunity(next);
      }
      return next;
    },
  }),

  ...crudHandlers({
    base: '/api/customers',
    getAll: () => db.customers,
    setAll: (rows) => {
      db.customers = rows;
    },
    createSchema: CreateCustomerInputSchema,
    updateSchema: CreateCustomerInputSchema.partial(),
    applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
    applyUpdate: (current, input) =>
      mergeDefined({ ...current, updatedAt: iso() }, input),
  }),
];
