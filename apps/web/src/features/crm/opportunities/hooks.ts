import { z } from 'zod';
import {
  OpportunitySchema,
  type CreateOpportunityInput,
  type Opportunity,
} from '@factory/shared';
import { makeResourceHooks } from '@/lib/crud-hooks';

export const opportunityHooks = makeResourceHooks<
  Opportunity,
  CreateOpportunityInput,
  Partial<CreateOpportunityInput>
>({
  base: '/opportunities',
  domain: 'opportunities',
  itemSchema: OpportunitySchema,
  listSchema: z.array(OpportunitySchema),
});
