import {
  CreateCampaignInputSchema,
  CreateContentPieceInputSchema,
} from '@factory/shared';
import { db } from '../db';
import { crudHandlers, iso, uuid } from '../lib/crud';
import { mergeDefined } from '../lib/merge';

export const marketingHandlers = [
  ...crudHandlers({
    base: '/api/campaigns',
    getAll: () => db.campaigns,
    setAll: (rows) => {
      db.campaigns = rows;
    },
    createSchema: CreateCampaignInputSchema,
    updateSchema: CreateCampaignInputSchema.partial(),
    applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
    applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
  }),
  ...crudHandlers({
    base: '/api/content',
    getAll: () => db.content,
    setAll: (rows) => {
      db.content = rows;
    },
    createSchema: CreateContentPieceInputSchema,
    updateSchema: CreateContentPieceInputSchema.partial(),
    applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
    applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
  }),
];
