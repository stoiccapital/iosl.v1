import { z } from 'zod';

export const DocCategorySchema = z.enum([
  'engineering',
  'product',
  'sales',
  'ops',
  'people',
  'finance',
  'general',
]);
export type DocCategory = z.infer<typeof DocCategorySchema>;

export const DocSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  category: DocCategorySchema,
  body: z.string(),
  authorId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Doc = z.infer<typeof DocSchema>;

export const CreateDocInputSchema = DocSchema.pick({
  title: true,
  category: true,
  body: true,
  authorId: true,
});
export type CreateDocInput = z.infer<typeof CreateDocInputSchema>;
