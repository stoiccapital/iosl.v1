import { z } from 'zod';
import {
  KeyResultSchema,
  ObjectiveSchema,
  type CreateKeyResultInput,
  type CreateObjectiveInput,
  type KeyResult,
  type Objective,
} from '@factory/shared';
import { makeResourceHooks } from '@/lib/crud-hooks';

export const objectiveHooks = makeResourceHooks<
  Objective,
  CreateObjectiveInput,
  Partial<CreateObjectiveInput>
>({
  base: '/objectives',
  domain: 'objectives',
  itemSchema: ObjectiveSchema,
  listSchema: z.array(ObjectiveSchema),
});

export const keyResultHooks = makeResourceHooks<
  KeyResult,
  CreateKeyResultInput,
  Partial<CreateKeyResultInput>
>({
  base: '/key-results',
  domain: 'key-results',
  itemSchema: KeyResultSchema,
  listSchema: z.array(KeyResultSchema),
});
