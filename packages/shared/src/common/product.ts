import { z } from 'zod';
import { MoneyCentsSchema } from './money';

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  code: z.string().min(1),
  monthlyPriceCents: MoneyCentsSchema,
  active: z.boolean(),
});
export type Product = z.infer<typeof ProductSchema>;
