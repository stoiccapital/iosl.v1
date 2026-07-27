import { http, HttpResponse } from 'msw';
import { CreatePersonInputSchema, PersonTypeSchema, type Person } from '@factory/shared';
import { db } from '../db';
import { iso, uuid } from '../lib/crud';
import { mergeDefined } from '../lib/merge';

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const peopleHandlers = [
  http.get('/api/people', async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const typeParam = url.searchParams.get('type');
    if (typeParam) {
      const parsed = PersonTypeSchema.safeParse(typeParam);
      if (!parsed.success) return HttpResponse.json([]);
      return HttpResponse.json(db.people.filter((p) => p.type === parsed.data));
    }
    return HttpResponse.json(db.people);
  }),

  http.get('/api/people/:id', ({ params }) => {
    const person = db.people.find((p) => p.id === params['id']);
    if (!person) return new HttpResponse('Not Found', { status: 404 });
    return HttpResponse.json(person);
  }),

  http.post('/api/people', async ({ request }) => {
    await delay(150);
    const raw = await request.json();
    const parsed = CreatePersonInputSchema.safeParse(raw);
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const person: Person = {
      id: uuid(),
      ...parsed.data,
      createdAt: iso(),
      updatedAt: iso(),
    };
    db.people.unshift(person);
    return HttpResponse.json(person, { status: 201 });
  }),

  http.patch('/api/people/:id', async ({ params, request }) => {
    await delay(150);
    const idx = db.people.findIndex((p) => p.id === params['id']);
    if (idx === -1) return new HttpResponse('Not Found', { status: 404 });
    const raw = await request.json();
    const parsed = CreatePersonInputSchema.partial().safeParse(raw);
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const next = mergeDefined({ ...db.people[idx]!, updatedAt: iso() }, parsed.data);
    db.people[idx] = next;
    return HttpResponse.json(next);
  }),

  http.delete('/api/people/:id', async ({ params }) => {
    await delay(100);
    const idx = db.people.findIndex((p) => p.id === params['id']);
    if (idx === -1) return new HttpResponse('Not Found', { status: 404 });
    db.people.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
