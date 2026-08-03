import { http, HttpResponse } from 'msw';
import {
  OpportunityCloseInputSchema,
  canPerform,
  findCatalogProduct,
  lineMrrCents,
  type Customer,
  type Opportunity,
  type Subscription,
  type SubscriptionStatus,
  type SubscriptionTransition,
} from '@factory/shared';
import { db } from '../db';
import { customerMrrFromSubscriptions } from '../lib/aggregates';
import { generateCommissionEventsForOpportunity } from '../lib/compensation';
import { iso, uuid } from '../lib/crud';

/**
 * `Customer.mrrCents` is denormalized (a sum of the customer's revenue-bearing
 * subscriptions) so revenue aggregates don't have to join the subs table on
 * every read. Call this whenever a sub is created, activated, paused, or
 * cancelled to keep the denorm in sync.
 *
 * Prior to this helper, a customer with two subscriptions carried the MRR of
 * whichever one existed first — silently understating revenue.
 */
function reconcileCustomerMrr(customerId: string): void {
  const nextMrr = customerMrrFromSubscriptions(db, customerId);
  db.customers = db.customers.map((c) =>
    c.id === customerId ? { ...c, mrrCents: nextMrr, updatedAt: iso() } : c,
  );
}

function actor() {
  return {
    id: db.currentUser.id,
    role: db.currentUser.role,
  };
}

function recordTransition(
  subscriptionId: string,
  fromStatus: SubscriptionStatus | null,
  toStatus: SubscriptionStatus,
  note: string | null = null,
): SubscriptionTransition {
  const { id: actorUserId, role: actorRole } = actor();
  const entry: SubscriptionTransition = {
    id: uuid(),
    subscriptionId,
    fromStatus,
    toStatus,
    actorUserId,
    actorRole,
    note,
    at: iso(),
  };
  db.subscriptionTransitions = [entry, ...db.subscriptionTransitions];
  return entry;
}

function findSubscription(id: string): Subscription | undefined {
  return db.subscriptions.find((s) => s.id === id);
}

function saveSubscription(next: Subscription) {
  db.subscriptions = db.subscriptions.map((s) => (s.id === next.id ? next : s));
}

function fakeStripeUrl(): string {
  const rand = crypto.randomUUID().replace(/-/g, '').slice(0, 20);
  return `https://buy.stripe.com/test_${rand}`;
}

function fakeContractDocumentUrl(opportunityId: string): string {
  return `https://storage.example.com/contracts/${opportunityId}.pdf`;
}

/**
 * Very small in-memory idempotency store. Callers that pass an
 * `Idempotency-Key` header get the same response on retry within the window.
 * Only used by the close endpoint for now (the one AI agents are most likely
 * to retry on flaky networks). Expires after 10 minutes.
 */
const idempotencyCache = new Map<string, { at: number; body: unknown; status: number }>();
const IDEM_TTL_MS = 10 * 60 * 1000;

function idemGet(key: string) {
  const hit = idempotencyCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > IDEM_TTL_MS) {
    idempotencyCache.delete(key);
    return null;
  }
  return hit;
}

function idemSet(key: string, body: unknown, status: number) {
  idempotencyCache.set(key, { at: Date.now(), body, status });
}

function saveOpportunity(next: Opportunity) {
  db.opportunities = db.opportunities.map((o) => (o.id === next.id ? next : o));
}

/**
 * Auto-promote a proposal-stage opportunity to close_won when *both*
 * conditions are true:
 *   - contract signed on the opportunity
 *   - every subscription tied to the opportunity is `paid` (or later)
 *
 * Called after any event that could flip one of those conditions:
 *   - a Stripe payment landing (simulate-payment webhook)
 *   - the contract being marked signed (manual finance action, or
 *     automated DocuSign webhook stand-in)
 *
 * Idempotent: no-op if opp is already close_won or the criteria aren't met.
 */
function tryAutoPromoteToCloseWon(opportunityId: string): Opportunity | null {
  const opp = db.opportunities.find((o) => o.id === opportunityId);
  if (!opp) return null;
  if (opp.stage !== 'proposal') return null;
  if (!opp.contractSigned) return null;

  const subs = db.subscriptions.filter((s) => s.opportunityId === opportunityId);
  if (subs.length === 0) return null;
  const allPaidOrBeyond = subs.every(
    (s) => s.status === 'paid' || s.status === 'active' || s.status === 'past_due',
  );
  if (!allPaidOrBeyond) return null;

  const now = iso();
  const promoted: Opportunity = { ...opp, stage: 'close_won', updatedAt: now };
  saveOpportunity(promoted);
  generateCommissionEventsForOpportunity(promoted);
  return promoted;
}

function findOrCreateCustomer(accountId: string, productCode: string, mrrCents: number): Customer {
  const existing = db.customers.find(
    (c) => c.accountId === accountId && c.productCode === productCode,
  );
  if (existing) return existing;
  const now = iso();
  const created: Customer = {
    id: uuid(),
    accountId,
    productCode,
    mrrCents,
    since: now,
    active: false,
    churnedAt: null,
    churnReason: null,
    createdAt: now,
    updatedAt: now,
  };
  db.customers = [created, ...db.customers];
  return created;
}

export const subscriptionFlowHandlers = [
  /* -------- Close an opportunity: create subscriptions + payment link -------- */
  http.post('/api/opportunities/:id/close', async ({ params, request }) => {
    const oppId = params['id'] as string;
    const idempotencyKey = request.headers.get('Idempotency-Key');
    if (idempotencyKey) {
      const cached = idemGet(`close:${oppId}:${idempotencyKey}`);
      if (cached)
        return HttpResponse.json(cached.body as Record<string, unknown>, {
          status: cached.status,
        });
    }

    const opp = db.opportunities.find((o) => o.id === oppId);
    if (!opp) return new HttpResponse('Opportunity not found', { status: 404 });

    if (!canPerform(db.currentUser.role, 'opportunity.close')) {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (opp.stage === 'close_won' || opp.stage === 'close_lost') {
      return HttpResponse.json({ error: 'Opportunity already closed' }, { status: 409 });
    }
    if (!opp.lines || opp.lines.length === 0) {
      return HttpResponse.json(
        { error: 'Opportunity has no product lines. Edit it first.' },
        { status: 400 },
      );
    }

    // Body is optional (may include a note), but we still validate.
    const raw = await request.clone().text();
    const parsed = OpportunityCloseInputSchema.safeParse(raw ? JSON.parse(raw) : {});
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const paymentLinkUrl = fakeStripeUrl();
    const now = iso();
    const createdSubs: Subscription[] = [];

    for (const line of opp.lines) {
      const product = findCatalogProduct(line.productCode);
      if (!product) {
        return HttpResponse.json(
          { error: `Unknown product: ${line.productCode}` },
          { status: 400 },
        );
      }
      const mrrCents = lineMrrCents(
        line.productCode,
        line.quantity,
        line.contractMonths,
        line.billingCycle,
      );

      const customer = findOrCreateCustomer(opp.accountId, line.productCode, mrrCents);

      const sub: Subscription = {
        id: uuid(),
        customerId: customer.id,
        productCode: line.productCode,
        opportunityId: oppId,
        quantity: line.quantity,
        mrrCents,
        billingCycle: line.billingCycle,
        status: 'payment_link_sent',
        paymentLinkUrl,
        startedAt: now,
        nextInvoiceAt: null,
        activatedAt: null,
        activatedById: null,
        createdAt: now,
        updatedAt: now,
      };
      db.subscriptions = [sub, ...db.subscriptions];
      recordTransition(sub.id, null, 'payment_link_sent', parsed.data.note ?? 'Created from opportunity close');
      reconcileCustomerMrr(customer.id);
      createdSubs.push(sub);
    }

    // Move opportunity to `proposal`. Close-won happens automatically later,
    // once the customer both pays *and* the contract is marked signed.
    const updatedOpp: Opportunity = {
      ...opp,
      stage: 'proposal',
      paymentLinkUrl,
      updatedAt: now,
    };
    saveOpportunity(updatedOpp);

    const responseBody = {
      opportunityId: oppId,
      subscriptions: createdSubs,
      paymentLinkUrl,
    };
    if (idempotencyKey) idemSet(`close:${oppId}:${idempotencyKey}`, responseBody, 201);
    return HttpResponse.json(responseBody, { status: 201 });
  }),

  /* -------- Finance: activate a paid subscription -------- */
  http.post('/api/subscriptions/:id/activate', ({ params }) => {
    const sub = findSubscription(params['id'] as string);
    if (!sub) return new HttpResponse('Not found', { status: 404 });
    if (!canPerform(db.currentUser.role, 'subscription.activate')) {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (sub.status !== 'paid') {
      return HttpResponse.json(
        { error: `Cannot activate from status "${sub.status}" (must be "paid")` },
        { status: 409 },
      );
    }
    const now = iso();
    const nextInvoice = new Date(now);
    nextInvoice.setMonth(nextInvoice.getMonth() + (sub.billingCycle === 'annual' ? 12 : 1));
    const next: Subscription = {
      ...sub,
      status: 'active',
      activatedAt: now,
      activatedById: db.currentUser.id,
      nextInvoiceAt: nextInvoice.toISOString(),
      updatedAt: now,
    };
    saveSubscription(next);
    recordTransition(sub.id, sub.status, 'active');
    reconcileCustomerMrr(next.customerId);
    return HttpResponse.json(next);
  }),

  /* -------- Finance: pause an active subscription -------- */
  http.post('/api/subscriptions/:id/pause', ({ params }) => {
    const sub = findSubscription(params['id'] as string);
    if (!sub) return new HttpResponse('Not found', { status: 404 });
    if (!canPerform(db.currentUser.role, 'subscription.pause')) {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (sub.status !== 'active') {
      return HttpResponse.json(
        { error: `Cannot pause from status "${sub.status}"` },
        { status: 409 },
      );
    }
    const next: Subscription = { ...sub, status: 'paused', updatedAt: iso() };
    saveSubscription(next);
    recordTransition(sub.id, sub.status, 'paused');
    reconcileCustomerMrr(next.customerId);
    return HttpResponse.json(next);
  }),

  /* -------- Finance: cancel a subscription -------- */
  http.post('/api/subscriptions/:id/cancel', ({ params }) => {
    const sub = findSubscription(params['id'] as string);
    if (!sub) return new HttpResponse('Not found', { status: 404 });
    if (!canPerform(db.currentUser.role, 'subscription.cancel')) {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (sub.status === 'cancelled') {
      return HttpResponse.json({ error: 'Already cancelled' }, { status: 409 });
    }
    const next: Subscription = { ...sub, status: 'cancelled', updatedAt: iso() };
    saveSubscription(next);
    recordTransition(sub.id, sub.status, 'cancelled');
    // Flip the linked Customer to inactive only when NO revenue-bearing subs
    // remain — a customer with a second live sub is not churned.
    const remainingMrr = customerMrrFromSubscriptions(db, sub.customerId);
    db.customers = db.customers.map((c) =>
      c.id === sub.customerId
        ? {
            ...c,
            mrrCents: remainingMrr,
            active: remainingMrr > 0,
            churnedAt: remainingMrr > 0 ? c.churnedAt : iso(),
            updatedAt: iso(),
          }
        : c,
    );
    return HttpResponse.json(next);
  }),

  /* -------- Audit log -------- */
  http.get('/api/subscriptions/:id/transitions', ({ params }) => {
    const id = params['id'] as string;
    const rows = db.subscriptionTransitions.filter((t) => t.subscriptionId === id);
    return HttpResponse.json(rows);
  }),

  /* -------- Contract signing: mark the opportunity's contract as signed -------- */
  http.post('/api/opportunities/:id/mark-contract-signed', ({ params }) => {
    const opp = db.opportunities.find((o) => o.id === (params['id'] as string));
    if (!opp) return new HttpResponse('Opportunity not found', { status: 404 });
    if (!canPerform(db.currentUser.role, 'opportunity.markContractSigned')) {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (opp.contractSigned) {
      return HttpResponse.json({ error: 'Contract already signed' }, { status: 409 });
    }
    const now = iso();
    const signed: Opportunity = {
      ...opp,
      contractSigned: true,
      contractSignedAt: now,
      contractSignedById: db.currentUser.id,
      contractDocumentUrl: fakeContractDocumentUrl(opp.id),
      updatedAt: now,
    };
    saveOpportunity(signed);
    tryAutoPromoteToCloseWon(opp.id);
    return HttpResponse.json(db.opportunities.find((o) => o.id === opp.id));
  }),

  /* -------- DEV: simulate a DocuSign auto-sign (stands in for the webhook) --- */
  http.post('/api/dev/docusign/simulate-signed/:id', ({ params }) => {
    const opp = db.opportunities.find((o) => o.id === (params['id'] as string));
    if (!opp) return new HttpResponse('Not found', { status: 404 });
    if (opp.contractSigned) {
      return HttpResponse.json({ error: 'Already signed' }, { status: 409 });
    }
    const now = iso();
    const signed: Opportunity = {
      ...opp,
      contractSigned: true,
      contractSignedAt: now,
      contractSignedById: db.currentUser.id,
      contractDocumentUrl: fakeContractDocumentUrl(opp.id),
      updatedAt: now,
    };
    saveOpportunity(signed);
    tryAutoPromoteToCloseWon(opp.id);
    return HttpResponse.json(db.opportunities.find((o) => o.id === opp.id));
  }),

  /* -------- DEV: simulate a Stripe payment (stands in for the webhook) -------- */
  http.post('/api/dev/stripe/simulate-payment/:id', ({ params }) => {
    const sub = findSubscription(params['id'] as string);
    if (!sub) return new HttpResponse('Not found', { status: 404 });
    if (sub.status !== 'payment_link_sent') {
      return HttpResponse.json(
        { error: `Cannot simulate payment for status "${sub.status}"` },
        { status: 409 },
      );
    }
    const next: Subscription = { ...sub, status: 'paid', updatedAt: iso() };
    saveSubscription(next);
    recordTransition(sub.id, sub.status, 'paid', 'Simulated Stripe payment (dev)');
    reconcileCustomerMrr(next.customerId);
    if (sub.opportunityId) {
      tryAutoPromoteToCloseWon(sub.opportunityId);
    }
    return HttpResponse.json(db.subscriptions.find((s) => s.id === sub.id));
  }),
];
