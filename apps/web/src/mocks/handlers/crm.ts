import {
  CreateAccountInputSchema,
  CreateCustomerInputSchema,
  CreateLeadInputSchema,
  CreateOpportunityInputSchema,
  lineTcvCents,
  type OpportunityLine,
} from '@factory/shared';
import { db } from '../db';
import { generateCommissionEventsForOpportunity } from '../lib/compensation';
import { crudHandlers, iso, uuid } from '../lib/crud';
import { mergeDefined } from '../lib/merge';

function opportunityAmountCents(lines: OpportunityLine[] | undefined): number {
  return (lines ?? []).reduce(
    (sum, l) => sum + lineTcvCents(l.productCode, l.quantity, l.contractMonths, l.billingCycle),
    0,
  );
}

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
    applyCreate: (input) => {
      const now = iso();
      return {
        id: uuid(),
        ...input,
        summaryNoteUpdatedAt: input.summaryNote ? now : null,
        summaryNoteUpdatedById: input.summaryNote ? db.currentUser.id : null,
        createdAt: now,
        updatedAt: now,
      };
    },
    applyUpdate: (current, input) => {
      const now = iso();
      const merged = mergeDefined({ ...current, updatedAt: now }, input);
      const summaryChanged =
        input.summaryNote !== undefined && input.summaryNote !== current.summaryNote;
      return summaryChanged
        ? { ...merged, summaryNoteUpdatedAt: now, summaryNoteUpdatedById: db.currentUser.id }
        : merged;
    },
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
      const amountCents = opportunityAmountCents(input.lines);
      const opp = {
        id: uuid(),
        ...input,
        amountCents,
        paymentLinkUrl: null,
        contractSigned: false,
        contractSignedAt: null,
        contractSignedById: null,
        contractDocumentUrl: null,
        createdAt: iso(),
        updatedAt: iso(),
      };
      generateCommissionEventsForOpportunity(opp);
      return opp;
    },
    applyUpdate: (current, input) => {
      const merged = mergeDefined({ ...current, updatedAt: iso() }, input);
      const next = { ...merged, amountCents: opportunityAmountCents(merged.lines) };
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
