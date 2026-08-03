import { http, HttpResponse } from 'msw';
import { CreateAccountNoteInputSchema, type AccountNote } from '@factory/shared';
import { db } from '../db';
import { iso, uuid } from '../lib/crud';

export const accountNotesHandlers = [
  http.get('/api/accounts/:id/notes', ({ params }) => {
    const accountId = params['id'] as string;
    const rows = db.accountNotes
      .filter((n) => n.accountId === accountId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return HttpResponse.json(rows);
  }),

  http.post('/api/accounts/:id/notes', async ({ params, request }) => {
    const accountId = params['id'] as string;
    const raw = await request.json();
    const parsed = CreateAccountNoteInputSchema.safeParse({ ...(raw as object), accountId });
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const note: AccountNote = {
      id: uuid(),
      accountId,
      body: parsed.data.body,
      authorId: db.currentUser.id,
      createdAt: iso(),
    };
    db.accountNotes = [note, ...db.accountNotes];
    return HttpResponse.json(note, { status: 201 });
  }),
];
