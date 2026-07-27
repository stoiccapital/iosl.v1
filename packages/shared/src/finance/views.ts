import { z } from 'zod';
import { MoneyCentsSchema } from '../common/money';

export const RevenueSummarySchema = z.object({
  mrrCents: MoneyCentsSchema,
  arrCents: MoneyCentsSchema,
  activeCustomers: z.number().int().nonnegative(),
  byProduct: z.array(
    z.object({
      productCode: z.string(),
      productName: z.string(),
      mrrCents: MoneyCentsSchema,
      customers: z.number().int().nonnegative(),
    }),
  ),
  byAccount: z.array(
    z.object({
      accountId: z.string().uuid(),
      accountName: z.string(),
      mrrCents: MoneyCentsSchema,
      products: z.array(z.string()),
    }),
  ),
});
export type RevenueSummary = z.infer<typeof RevenueSummarySchema>;

export const PnlMonthSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  revenueCents: z.number().int(),
  cogsCents: z.number().int(),
  grossProfitCents: z.number().int(),
  rndCents: z.number().int(),
  smCents: z.number().int(),
  gaCents: z.number().int(),
  opexCents: z.number().int(),
  operatingIncomeCents: z.number().int(),
});
export type PnlMonth = z.infer<typeof PnlMonthSchema>;

export const PnlViewSchema = z.object({
  months: z.array(PnlMonthSchema),
});
export type PnlView = z.infer<typeof PnlViewSchema>;

export const CostSummarySchema = z.object({
  monthlyCents: MoneyCentsSchema,
  byCategory: z.array(
    z.object({
      category: z.string(),
      monthlyCents: MoneyCentsSchema,
    }),
  ),
  bySource: z.array(
    z.object({
      source: z.string(),
      monthlyCents: MoneyCentsSchema,
    }),
  ),
  items: z.array(
    z.object({
      id: z.string(),
      source: z.string(),
      sourceRef: z.string(),
      category: z.string(),
      monthlyCents: MoneyCentsSchema,
      description: z.string(),
    }),
  ),
});
export type CostSummary = z.infer<typeof CostSummarySchema>;
