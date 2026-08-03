import { BillingCycleSchema, type BillingCycle } from './schemas';

/**
 * The (hardcoded, for now) SKU catalog customers can subscribe to.
 * When the BE ships, replace this with a Stripe Prices sync.
 */
export const PRODUCT_CATALOG_CODES = [
  'fahrly_go',
  'fahrly_platform',
  'samsara_integration',
  'samsara_platform',
] as const;

export type ProductCode = (typeof PRODUCT_CATALOG_CODES)[number];

export type CatalogProduct = {
  code: ProductCode;
  name: string;
  monthlyPriceCents: number;
  annualPriceCents: number;
};

// Annual list price = monthly × 12 with a 20 % discount.
const ANNUAL_DISCOUNT = 0.2;
const annual = (monthlyCents: number) =>
  Math.round(monthlyCents * 12 * (1 - ANNUAL_DISCOUNT));

export const PRODUCT_CATALOG: readonly CatalogProduct[] = [
  {
    code: 'fahrly_go',
    name: 'Fahrly Go',
    monthlyPriceCents: 50_00,
    annualPriceCents: annual(50_00),
  },
  {
    code: 'fahrly_platform',
    name: 'Fahrly Platform',
    monthlyPriceCents: 50_00,
    annualPriceCents: annual(50_00),
  },
  {
    code: 'samsara_integration',
    name: 'Samsara Integration',
    monthlyPriceCents: 5_00,
    annualPriceCents: annual(5_00),
  },
  {
    code: 'samsara_platform',
    name: 'Samsara Platform',
    monthlyPriceCents: 299_00,
    annualPriceCents: annual(299_00),
  },
];

export function findCatalogProduct(code: string): CatalogProduct | undefined {
  return PRODUCT_CATALOG.find((p) => p.code === code);
}

export function priceForCycle(product: CatalogProduct, cycle: BillingCycle): number {
  return cycle === 'annual' ? product.annualPriceCents : product.monthlyPriceCents;
}

/**
 * TCV (Total Contract Value) for one line: unitPriceForCycle × qty × periods.
 * Periods = contractMonths / (annual ? 12 : 1).
 */
export function lineTcvCents(
  productCode: string,
  quantity: number,
  contractMonths: number,
  cycle: BillingCycle,
): number {
  const product = findCatalogProduct(productCode);
  if (!product) return 0;
  const unit = priceForCycle(product, cycle);
  const periodMonths = cycle === 'annual' ? 12 : 1;
  const periods = Math.max(1, Math.ceil(contractMonths / periodMonths));
  return unit * quantity * periods;
}

/** MRR (Monthly Recurring Revenue) for one line: TCV / contractMonths. */
export function lineMrrCents(
  productCode: string,
  quantity: number,
  contractMonths: number,
  cycle: BillingCycle,
): number {
  const tcv = lineTcvCents(productCode, quantity, contractMonths, cycle);
  return Math.round(tcv / Math.max(1, contractMonths));
}

// Reference the imported schema so the file stays part of the compiled surface
// even before Phase 3 features consume it directly.
export const CATALOG_BILLING_CYCLE = BillingCycleSchema;
