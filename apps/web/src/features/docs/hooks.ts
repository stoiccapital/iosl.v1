import { z } from 'zod';
import { DocSchema, type CreateDocInput, type Doc } from '@factory/shared';
import { makeResourceHooks } from '@/lib/crud-hooks';

export const docHooks = makeResourceHooks<Doc, CreateDocInput, Partial<CreateDocInput>>({
  base: '/docs',
  domain: 'docs',
  itemSchema: DocSchema,
  listSchema: z.array(DocSchema),
});
