import { z } from 'zod';
import {
  LegalDocumentSchema,
  type CreateLegalDocumentInput,
  type LegalDocument,
} from '@factory/shared';
import { makeResourceHooks } from '@/lib/crud-hooks';

export const legalHooks = makeResourceHooks<
  LegalDocument,
  CreateLegalDocumentInput,
  Partial<CreateLegalDocumentInput>
>({
  base: '/legal-documents',
  domain: 'legal-documents',
  itemSchema: LegalDocumentSchema,
  listSchema: z.array(LegalDocumentSchema),
});
