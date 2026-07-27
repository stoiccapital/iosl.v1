import { CreateLegalDocumentInputSchema } from '@factory/shared';
import { db } from '../db';
import { crudHandlers, iso, uuid } from '../lib/crud';
import { mergeDefined } from '../lib/merge';

export const legalHandlers = crudHandlers({
  base: '/api/legal-documents',
  getAll: () => db.legalDocuments,
  setAll: (rows) => {
    db.legalDocuments = rows;
  },
  createSchema: CreateLegalDocumentInputSchema,
  updateSchema: CreateLegalDocumentInputSchema.partial(),
  applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
  applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
});
