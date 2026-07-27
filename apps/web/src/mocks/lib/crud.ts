import { http, HttpResponse, type HttpHandler } from 'msw';
import type { z } from 'zod';

export const iso = () => new Date().toISOString();
export const uuid = () => crypto.randomUUID();

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

type CrudOptions<T extends { id: string; createdAt: string; updatedAt: string }, C, U> = {
  base: string;
  getAll: () => T[];
  setAll: (rows: T[]) => void;
  createSchema: z.ZodType<C>;
  updateSchema: z.ZodType<U>;
  applyCreate: (input: C) => T;
  applyUpdate: (current: T, input: U) => T;
};

/**
 * Standard REST handlers for a resource:
 *   GET    /base
 *   GET    /base/:id
 *   POST   /base
 *   PATCH  /base/:id
 *   DELETE /base/:id
 */
export function crudHandlers<
  T extends { id: string; createdAt: string; updatedAt: string },
  C,
  U,
>(opts: CrudOptions<T, C, U>): HttpHandler[] {
  const { base, getAll, setAll, createSchema, updateSchema, applyCreate, applyUpdate } = opts;

  return [
    http.get(base, async () => {
      await delay(80);
      return HttpResponse.json(getAll());
    }),

    http.get(`${base}/:id`, async ({ params }) => {
      const row = getAll().find((r) => r.id === params['id']);
      if (!row) return new HttpResponse('Not Found', { status: 404 });
      return HttpResponse.json(row);
    }),

    http.post(base, async ({ request }) => {
      await delay(150);
      const raw = await request.json();
      const parsed = createSchema.safeParse(raw);
      if (!parsed.success) {
        return HttpResponse.json({ error: parsed.error.flatten() }, { status: 400 });
      }
      const row = applyCreate(parsed.data);
      setAll([row, ...getAll()]);
      return HttpResponse.json(row, { status: 201 });
    }),

    http.patch(`${base}/:id`, async ({ params, request }) => {
      await delay(150);
      const rows = getAll();
      const idx = rows.findIndex((r) => r.id === params['id']);
      if (idx === -1) return new HttpResponse('Not Found', { status: 404 });
      const raw = await request.json();
      const parsed = updateSchema.safeParse(raw);
      if (!parsed.success) {
        return HttpResponse.json({ error: parsed.error.flatten() }, { status: 400 });
      }
      const next = applyUpdate(rows[idx]!, parsed.data);
      rows[idx] = next;
      setAll(rows);
      return HttpResponse.json(next);
    }),

    http.delete(`${base}/:id`, async ({ params }) => {
      await delay(100);
      const rows = getAll();
      const idx = rows.findIndex((r) => r.id === params['id']);
      if (idx === -1) return new HttpResponse('Not Found', { status: 404 });
      rows.splice(idx, 1);
      setAll(rows);
      return new HttpResponse(null, { status: 204 });
    }),
  ];
}
