import { z } from 'zod';
import { LeadSchema, type CreateLeadInput, type Lead } from '@factory/shared';
import { makeResourceHooks } from '@/lib/crud-hooks';

export const leadHooks = makeResourceHooks<Lead, CreateLeadInput, Partial<CreateLeadInput>>({
  base: '/leads',
  domain: 'leads',
  itemSchema: LeadSchema,
  listSchema: z.array(LeadSchema),
});
