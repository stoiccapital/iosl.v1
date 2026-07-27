import { z } from 'zod';
import {
  CampaignSchema,
  ContentPieceSchema,
  type Campaign,
  type ContentPiece,
  type CreateCampaignInput,
  type CreateContentPieceInput,
} from '@factory/shared';
import { makeResourceHooks } from '@/lib/crud-hooks';

export const campaignHooks = makeResourceHooks<Campaign, CreateCampaignInput, Partial<CreateCampaignInput>>({
  base: '/campaigns',
  domain: 'campaigns',
  itemSchema: CampaignSchema,
  listSchema: z.array(CampaignSchema),
});

export const contentHooks = makeResourceHooks<
  ContentPiece,
  CreateContentPieceInput,
  Partial<CreateContentPieceInput>
>({
  base: '/content',
  domain: 'content',
  itemSchema: ContentPieceSchema,
  listSchema: z.array(ContentPieceSchema),
});
