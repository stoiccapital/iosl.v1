import { http, HttpResponse } from 'msw';
import {
  AccountContactSchema,
  CreateAccountContactInputSchema,
  CreateAccountContactNoteInputSchema,
  type AccountContact,
  type AccountContactNote,
} from '@factory/shared';
import { db } from '../db';
import { iso, uuid } from '../lib/crud';
import { mergeDefined } from '../lib/merge';

const UpdateAccountContactSchema = AccountContactSchema.pick({
  firstName: true,
  lastName: true,
  title: true,
  email: true,
  phone: true,
  summaryNote: true,
  active: true,
}).partial();

export const accountContactsHandlers = [
  /* List contacts for an account (active by default; pass ?includeInactive=1 for all) */
  http.get('/api/accounts/:id/contacts', ({ params, request }) => {
    const accountId = params['id'] as string;
    const url = new URL(request.url);
    const includeInactive = url.searchParams.get('includeInactive') === '1';
    const rows = db.accountContacts
      .filter((c) => c.accountId === accountId && (includeInactive || c.active))
      .sort((a, b) => (a.lastName < b.lastName ? -1 : 1));
    return HttpResponse.json(rows);
  }),

  http.post('/api/accounts/:id/contacts', async ({ params, request }) => {
    const accountId = params['id'] as string;
    const raw = await request.json();
    const parsed = CreateAccountContactInputSchema.safeParse({
      ...(raw as object),
      accountId,
    });
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const now = iso();
    const contact: AccountContact = {
      id: uuid(),
      accountId,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      title: parsed.data.title,
      email: parsed.data.email,
      phone: parsed.data.phone,
      summaryNote: parsed.data.summaryNote,
      summaryNoteUpdatedAt: parsed.data.summaryNote ? now : null,
      summaryNoteUpdatedById: parsed.data.summaryNote ? db.currentUser.id : null,
      active: true,
      createdAt: now,
      updatedAt: now,
    };
    db.accountContacts = [contact, ...db.accountContacts];
    return HttpResponse.json(contact, { status: 201 });
  }),

  http.patch('/api/account-contacts/:id', async ({ params, request }) => {
    const contactId = params['id'] as string;
    const raw = await request.json();
    const parsed = UpdateAccountContactSchema.safeParse(raw);
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const current = db.accountContacts.find((c) => c.id === contactId);
    if (!current) return new HttpResponse('Not found', { status: 404 });
    const now = iso();
    const merged = mergeDefined({ ...current, updatedAt: now }, parsed.data);
    // Audit summaryNote changes.
    const summaryChanged =
      parsed.data.summaryNote !== undefined && parsed.data.summaryNote !== current.summaryNote;
    const next: AccountContact = summaryChanged
      ? { ...merged, summaryNoteUpdatedAt: now, summaryNoteUpdatedById: db.currentUser.id }
      : merged;
    db.accountContacts = db.accountContacts.map((c) => (c.id === contactId ? next : c));
    return HttpResponse.json(next);
  }),

  /* Soft-delete via explicit action verb (not DELETE). */
  http.post('/api/account-contacts/:id/deactivate', ({ params }) => {
    const contactId = params['id'] as string;
    const current = db.accountContacts.find((c) => c.id === contactId);
    if (!current) return new HttpResponse('Not found', { status: 404 });
    if (!current.active) {
      return HttpResponse.json({ error: 'Already inactive' }, { status: 409 });
    }
    const next: AccountContact = { ...current, active: false, updatedAt: iso() };
    db.accountContacts = db.accountContacts.map((c) => (c.id === contactId ? next : c));
    return HttpResponse.json(next);
  }),

  /* Contact notes — timestamped, append-only */
  http.get('/api/account-contacts/:id/notes', ({ params }) => {
    const accountContactId = params['id'] as string;
    const rows = db.accountContactNotes
      .filter((n) => n.accountContactId === accountContactId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return HttpResponse.json(rows);
  }),

  http.post('/api/account-contacts/:id/notes', async ({ params, request }) => {
    const accountContactId = params['id'] as string;
    const raw = await request.json();
    const parsed = CreateAccountContactNoteInputSchema.safeParse({
      ...(raw as object),
      accountContactId,
    });
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const note: AccountContactNote = {
      id: uuid(),
      accountContactId,
      body: parsed.data.body,
      authorId: db.currentUser.id,
      createdAt: iso(),
    };
    db.accountContactNotes = [note, ...db.accountContactNotes];
    return HttpResponse.json(note, { status: 201 });
  }),
];
