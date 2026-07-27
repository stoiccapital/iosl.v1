import { http, HttpResponse } from 'msw';
import type { CompensationEvent } from '@factory/shared';
import {
  CompensationStatusSchema,
  CreateCompensationEventInputSchema,
  CreateCompensationRuleInputSchema,
} from '@factory/shared';
import { db } from '../db';
import { crudHandlers, iso, uuid } from '../lib/crud';
import { mergeDefined } from '../lib/merge';

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const eventCrud = crudHandlers({
  base: '/api/compensation/events',
  getAll: () => db.compensationEvents,
  setAll: (rows) => {
    db.compensationEvents = rows;
  },
  createSchema: CreateCompensationEventInputSchema,
  updateSchema: CreateCompensationEventInputSchema.partial(),
  applyCreate: (input) => ({
    id: uuid(),
    ...input,
    ruleId: input.ruleId ?? null,
    sourceId: input.sourceId ?? null,
    approvedById: null,
    approvedAt: null,
    paidAt: null,
    createdAt: iso(),
    updatedAt: iso(),
  }),
  applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
});

function transitionEvent(
  id: string,
  next: CompensationEvent['status'],
  patch: Partial<CompensationEvent>,
): CompensationEvent | null {
  const idx = db.compensationEvents.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  const current = db.compensationEvents[idx]!;
  const updated: CompensationEvent = {
    ...current,
    ...patch,
    status: next,
    updatedAt: iso(),
  };
  db.compensationEvents[idx] = updated;
  return updated;
}

export const compensationHandlers = [
  ...crudHandlers({
    base: '/api/compensation/rules',
    getAll: () => db.compensationRules,
    setAll: (rows) => {
      db.compensationRules = rows;
    },
    createSchema: CreateCompensationRuleInputSchema,
    updateSchema: CreateCompensationRuleInputSchema.partial(),
    applyCreate: (input) => ({ id: uuid(), ...input, createdAt: iso(), updatedAt: iso() }),
    applyUpdate: (current, input) => mergeDefined({ ...current, updatedAt: iso() }, input),
  }),

  ...eventCrud,

  http.patch('/api/compensation/events/:id/approve', async ({ params }) => {
    await delay(100);
    const next = transitionEvent(params['id'] as string, 'approved', {
      approvedById: db.currentUser.id,
      approvedAt: iso(),
    });
    if (!next) return new HttpResponse('Not Found', { status: 404 });
    return HttpResponse.json(next);
  }),

  http.patch('/api/compensation/events/:id/pay', async ({ params }) => {
    await delay(100);
    const next = transitionEvent(params['id'] as string, 'paid', {
      paidAt: iso(),
    });
    if (!next) return new HttpResponse('Not Found', { status: 404 });
    return HttpResponse.json(next);
  }),

  http.patch('/api/compensation/events/:id/void', async ({ params }) => {
    await delay(100);
    const next = transitionEvent(params['id'] as string, 'void', {});
    if (!next) return new HttpResponse('Not Found', { status: 404 });
    return HttpResponse.json(next);
  }),

  http.patch('/api/compensation/events/:id/status', async ({ params, request }) => {
    await delay(80);
    const raw = (await request.json().catch(() => null)) as { status?: unknown } | null;
    const parsed = CompensationStatusSchema.safeParse(raw?.status);
    if (!parsed.success) {
      return HttpResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const next = transitionEvent(params['id'] as string, parsed.data, {});
    if (!next) return new HttpResponse('Not Found', { status: 404 });
    return HttpResponse.json(next);
  }),
];
