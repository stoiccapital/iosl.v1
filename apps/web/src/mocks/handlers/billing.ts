import { CreateInvoiceInputSchema, CreateSubscriptionInputSchema } from '@factory/shared';
import { db } from '../db';
import { crudHandlers, iso, uuid } from '../lib/crud';
import { mergeDefined } from '../lib/merge';

export const billingHandlers = [
  ...crudHandlers({
    base: '/api/subscriptions',
    getAll: () => db.subscriptions,
    setAll: (rows) => {
      db.subscriptions = rows;
    },
    createSchema: CreateSubscriptionInputSchema,
    updateSchema: CreateSubscriptionInputSchema.partial(),
    applyCreate: (input) => ({
      id: uuid(),
      ...input,
      paymentLinkUrl: null,
      activatedAt: null,
      activatedById: null,
      createdAt: iso(),
      updatedAt: iso(),
    }),
    applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
  }),
  ...crudHandlers({
    base: '/api/invoices',
    getAll: () => db.invoices,
    setAll: (rows) => {
      db.invoices = rows;
    },
    createSchema: CreateInvoiceInputSchema,
    updateSchema: CreateInvoiceInputSchema.partial(),
    applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
    applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
  }),
];
