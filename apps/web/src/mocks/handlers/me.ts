import { http, HttpResponse } from 'msw';
import { RoleSchema } from '@factory/shared';
import { db } from '../db';

export const meHandlers = [
  http.get('/api/me', () => HttpResponse.json(db.currentUser)),

  http.patch('/api/me/role', async ({ request }) => {
    const raw = (await request.json()) as { role?: unknown };
    const parsed = RoleSchema.safeParse(raw?.role);
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    db.currentUser = { ...db.currentUser, role: parsed.data };
    return HttpResponse.json(db.currentUser);
  }),
];
