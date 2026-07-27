import { z } from 'zod';
import {
  InvoiceSchema,
  SubscriptionSchema,
  type CreateInvoiceInput,
  type CreateSubscriptionInput,
  type Invoice,
  type Subscription,
} from '@factory/shared';
import { makeResourceHooks } from '@/lib/crud-hooks';

export const subscriptionHooks = makeResourceHooks<
  Subscription,
  CreateSubscriptionInput,
  Partial<CreateSubscriptionInput>
>({
  base: '/subscriptions',
  domain: 'subscriptions',
  itemSchema: SubscriptionSchema,
  listSchema: z.array(SubscriptionSchema),
});

export const invoiceHooks = makeResourceHooks<Invoice, CreateInvoiceInput, Partial<CreateInvoiceInput>>({
  base: '/invoices',
  domain: 'invoices',
  itemSchema: InvoiceSchema,
  listSchema: z.array(InvoiceSchema),
});
