import { z } from 'zod';
import {
  CandidateSchema,
  PositionSchema,
  type Candidate,
  type CreateCandidateInput,
  type CreatePositionInput,
  type Position,
} from '@factory/shared';
import { makeResourceHooks } from '@/lib/crud-hooks';

export const positionHooks = makeResourceHooks<
  Position,
  CreatePositionInput,
  Partial<CreatePositionInput>
>({
  base: '/positions',
  domain: 'positions',
  itemSchema: PositionSchema,
  listSchema: z.array(PositionSchema),
});

export const candidateHooks = makeResourceHooks<
  Candidate,
  CreateCandidateInput,
  Partial<CreateCandidateInput>
>({
  base: '/candidates',
  domain: 'candidates',
  itemSchema: CandidateSchema,
  listSchema: z.array(CandidateSchema),
});
