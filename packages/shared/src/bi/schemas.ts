import { z } from 'zod';
import { MoneyCentsSchema } from '../common/money';

/* ---------- Customers ---------- */

const AttachRowSchema = z.object({
  productCount: z.number().int().nonnegative(),
  customerCount: z.number().int().nonnegative(),
  mrrCents: MoneyCentsSchema,
});

export const BiCustomersViewSchema = z.object({
  totalCustomers: z.number().int().nonnegative(),
  activeCustomers: z.number().int().nonnegative(),
  totalMrrCents: MoneyCentsSchema,
  byCountry: z.array(
    z.object({
      country: z.string(),
      customers: z.number().int().nonnegative(),
      mrrCents: MoneyCentsSchema,
    }),
  ),
  topAccounts: z.array(
    z.object({
      accountName: z.string(),
      mrrCents: MoneyCentsSchema,
    }),
  ),
  attach: z.array(AttachRowSchema),
  concentration: z.object({
    top10ShareBps: z.number().int().nonnegative(),
  }),
});
export type BiCustomersView = z.infer<typeof BiCustomersViewSchema>;

/* ---------- Revenue ---------- */

const MrrMovementRowSchema = z.object({
  month: z.string(),
  newCents: z.number().int(),
  expansionCents: z.number().int(),
  contractionCents: z.number().int(),
  churnCents: z.number().int(),
  netCents: z.number().int(),
});

export const BiRevenueViewSchema = z.object({
  monthlySeries: z.array(
    z.object({
      month: z.string(),
      mrrCents: MoneyCentsSchema,
    }),
  ),
  byProduct: z.array(
    z.object({
      productCode: z.string(),
      productName: z.string(),
      mrrCents: MoneyCentsSchema,
    }),
  ),
  movement: z.array(MrrMovementRowSchema),
});
export type BiRevenueView = z.infer<typeof BiRevenueViewSchema>;

/* ---------- Usage ---------- */

export const BiUsageViewSchema = z.object({
  byFeature: z.array(
    z.object({
      feature: z.string(),
      activeUsers: z.number().int().nonnegative(),
      invocations: z.number().int().nonnegative(),
    }),
  ),
  adoptionByPlan: z.array(
    z.object({
      productName: z.string(),
      wau: z.number().int().nonnegative(),
      mau: z.number().int().nonnegative(),
    }),
  ),
});
export type BiUsageView = z.infer<typeof BiUsageViewSchema>;

/* ---------- Costs ---------- */

export const BiCostsViewSchema = z.object({
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
  monthlySeries: z.array(
    z.object({
      month: z.string(),
      monthlyCents: MoneyCentsSchema,
    }),
  ),
});
export type BiCostsView = z.infer<typeof BiCostsViewSchema>;

/* ---------- Overview (headline KPIs) ---------- */

export const BiOverviewViewSchema = z.object({
  mrrCents: MoneyCentsSchema,
  arrCents: MoneyCentsSchema,
  committedArrCents: MoneyCentsSchema,

  nrrBps: z.number().int(),
  grrBps: z.number().int(),
  logoChurnBps: z.number().int().nonnegative(),

  ruleOf40Bps: z.number().int(),
  magicNumber: z.number(),
  paybackMonths: z.number(),

  cacCents: MoneyCentsSchema,
  ltvCents: MoneyCentsSchema,
  ltvCacRatio: z.number(),

  cashBalanceCents: MoneyCentsSchema,
  monthlyBurnCents: z.number().int(),
  runwayMonths: z.number(),

  mrrSpark: z.array(z.number().int()),
  opIncomeSpark: z.array(z.number().int()),
});
export type BiOverviewView = z.infer<typeof BiOverviewViewSchema>;

/* ---------- Retention ---------- */

const CohortRowSchema = z.object({
  cohortMonth: z.string(),
  initialCount: z.number().int().nonnegative(),
  retention: z.array(z.number()),
});

export const BiRetentionViewSchema = z.object({
  cohorts: z.array(CohortRowSchema),
  monthly: z.array(
    z.object({
      month: z.string(),
      nrrBps: z.number().int(),
      grrBps: z.number().int(),
      logoChurnBps: z.number().int(),
      revenueChurnBps: z.number().int(),
    }),
  ),
});
export type BiRetentionView = z.infer<typeof BiRetentionViewSchema>;

/* ---------- Sales ---------- */

export const BiSalesViewSchema = z.object({
  winRateBps: z.number().int(),
  winRateBySize: z.array(
    z.object({
      size: z.string(),
      wonCount: z.number().int().nonnegative(),
      lostCount: z.number().int().nonnegative(),
      winRateBps: z.number().int(),
    }),
  ),
  cycleBySize: z.array(
    z.object({
      size: z.string(),
      medianDays: z.number(),
      wonCount: z.number().int().nonnegative(),
    }),
  ),
  pipeline: z.object({
    openWeightedCents: z.number().int(),
    quarterlyTargetCents: z.number().int(),
    coverageRatio: z.number(),
  }),
});
export type BiSalesView = z.infer<typeof BiSalesViewSchema>;
