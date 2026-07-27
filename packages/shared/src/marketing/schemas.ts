import { z } from 'zod';
import { MoneyCentsSchema } from '../common/money';

export const CampaignChannelSchema = z.enum(['email', 'social', 'paid_search', 'content', 'event']);
export type CampaignChannel = z.infer<typeof CampaignChannelSchema>;

export const CampaignStatusSchema = z.enum(['planned', 'live', 'complete', 'cancelled']);
export type CampaignStatus = z.infer<typeof CampaignStatusSchema>;

export const CampaignSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  channel: CampaignChannelSchema,
  status: CampaignStatusSchema,
  budgetCents: MoneyCentsSchema,
  spentCents: MoneyCentsSchema,
  leadsGenerated: z.number().int().nonnegative(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Campaign = z.infer<typeof CampaignSchema>;

export const CreateCampaignInputSchema = CampaignSchema.pick({
  name: true,
  channel: true,
  status: true,
  budgetCents: true,
  spentCents: true,
  leadsGenerated: true,
  startDate: true,
  endDate: true,
});
export type CreateCampaignInput = z.infer<typeof CreateCampaignInputSchema>;

/* ---------- Content pieces ---------- */

export const ContentTypeSchema = z.enum(['blog', 'video', 'whitepaper', 'case_study', 'guide']);
export type ContentType = z.infer<typeof ContentTypeSchema>;

export const ContentStatusSchema = z.enum(['idea', 'drafting', 'review', 'published', 'archived']);
export type ContentStatus = z.infer<typeof ContentStatusSchema>;

export const ContentPieceSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  type: ContentTypeSchema,
  status: ContentStatusSchema,
  authorId: z.string().uuid().nullable(),
  publishedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type ContentPiece = z.infer<typeof ContentPieceSchema>;

export const CreateContentPieceInputSchema = ContentPieceSchema.pick({
  title: true,
  type: true,
  status: true,
  authorId: true,
  publishedAt: true,
});
export type CreateContentPieceInput = z.infer<typeof CreateContentPieceInputSchema>;
