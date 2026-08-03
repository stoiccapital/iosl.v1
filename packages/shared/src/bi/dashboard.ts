import { z } from 'zod';
import { MoneyCentsSchema } from '../common/money';

/**
 * DashboardView — the single response for the executive dashboard.
 *
 * Every metric encodes its own "favorable direction" so the FE knows how to
 * color future delta indicators without redefining what "good" means per card.
 *
 * Missing / not-computable values use `null` — the FE renders an em-dash,
 * never `0`. `0` means "we measured and the answer is zero".
 */

export const FavorableDirectionSchema = z.enum(['up', 'down']);
export type FavorableDirection = z.infer<typeof FavorableDirectionSchema>;

const NullableCents = MoneyCentsSchema.nullable();
const NullableInt = z.number().int().nullable();

export const DashboardViewSchema = z.object({
  generatedAt: z.string().datetime(),
  cacheTtlSeconds: z.number().int().positive(),
  windowDays: z.number().int().positive(),

  finance: z.object({
    mrrCents: NullableCents,
    monthlyCostCents: NullableCents,
    netMonthlyCents: NullableInt,
    runwayMonths: z.number().nullable(),
    runwayInfinite: z.boolean(),
  }),

  sales: z.object({
    openOppsCount: z.number().int().nonnegative(),
    openPipelineWeightedCents: NullableCents,
    activeCustomersCount: z.number().int().nonnegative(),
    nrrBps: NullableInt,
    grrBps: NullableInt,
    arpaCents: NullableCents,
  }),

  people: z.object({
    headcount: z.number().int().nonnegative(),
    openPositionsCount: z.number().int().nonnegative(),
    activeCandidatesCount: z.number().int().nonnegative(),
    unpaidCommissionCents: MoneyCentsSchema,
    revenuePerEmployeeCents: NullableCents,
  }),

  delivery: z.object({
    activeProjectsCount: z.number().int().nonnegative(),
    activeAssignmentsCount: z.number().int().nonnegative(),
    costItemsCount: z.number().int().nonnegative(),
  }),

  retention: z.object({
    churnedMrrCents: MoneyCentsSchema,
    churnedLogos: z.number().int().nonnegative(),
    voluntaryChurnLogos: z.number().int().nonnegative(),
    involuntaryChurnLogos: z.number().int().nonnegative(),
  }),
});
export type DashboardView = z.infer<typeof DashboardViewSchema>;
