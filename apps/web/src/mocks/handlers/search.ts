import { http, HttpResponse } from 'msw';
import { db } from '../db';

/**
 * Global full-text search across the most useful entity types for a rep.
 * Case-insensitive substring match. Grouped in the response so the client can
 * render sections without further processing.
 *
 * GET /api/search?q=...&limit=20
 */
type Hit = {
  id: string;
  entityType: 'account' | 'contact' | 'opportunity' | 'account_note' | 'contact_note';
  primary: string;
  secondary?: string | undefined;
  snippet?: string | undefined;
  href: string;
};

function truncate(s: string, max = 120): string {
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

function matches(needle: string, ...haystacks: (string | undefined | null)[]): boolean {
  const n = needle.toLowerCase();
  return haystacks.some((h) => (h ?? '').toLowerCase().includes(n));
}

export const searchHandlers = [
  http.get('/api/search', ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').trim();
    const limit = Math.min(50, Math.max(1, Number.parseInt(url.searchParams.get('limit') ?? '20', 10) || 20));

    if (q.length < 2) {
      return HttpResponse.json({
        accounts: [],
        contacts: [],
        opportunities: [],
        notes: [],
      });
    }

    const accounts: Hit[] = db.accounts
      .filter((a) => matches(q, a.name, a.industry, a.country, a.summaryNote))
      .slice(0, limit)
      .map((a) => ({
        id: a.id,
        entityType: 'account',
        primary: a.name,
        secondary: `${a.industry} · ${a.country}`,
        snippet: a.summaryNote ? truncate(a.summaryNote) : undefined,
        href: `/crm/accounts/${a.id}`,
      }));

    const contacts: Hit[] = db.accountContacts
      .filter((c) => c.active)
      .filter((c) =>
        matches(q, `${c.firstName} ${c.lastName}`, c.email, c.title, c.phone, c.summaryNote),
      )
      .slice(0, limit)
      .map((c) => {
        const account = db.accounts.find((a) => a.id === c.accountId);
        return {
          id: c.id,
          entityType: 'contact',
          primary: `${c.firstName} ${c.lastName}`,
          secondary: [c.title, account?.name].filter(Boolean).join(' · '),
          snippet: c.summaryNote ? truncate(c.summaryNote) : c.email,
          href: `/crm/accounts/${c.accountId}`,
        };
      });

    const opportunities: Hit[] = db.opportunities
      .filter((o) => {
        const account = db.accounts.find((a) => a.id === o.accountId);
        return matches(q, o.name, account?.name);
      })
      .slice(0, limit)
      .map((o) => {
        const account = db.accounts.find((a) => a.id === o.accountId);
        return {
          id: o.id,
          entityType: 'opportunity',
          primary: o.name,
          secondary: [account?.name, o.stage].filter(Boolean).join(' · '),
          href: `/crm/opportunities/${o.id}`,
        };
      });

    // Notes searched last (usually the noisiest hits)
    const noteMatches: Hit[] = [];
    for (const n of db.accountNotes) {
      if (noteMatches.length >= limit) break;
      if (matches(q, n.body)) {
        const account = db.accounts.find((a) => a.id === n.accountId);
        noteMatches.push({
          id: n.id,
          entityType: 'account_note',
          primary: account?.name ?? 'Account note',
          secondary: 'Timestamped note',
          snippet: truncate(n.body),
          href: account ? `/crm/accounts/${account.id}` : '/crm/accounts',
        });
      }
    }
    for (const n of db.accountContactNotes) {
      if (noteMatches.length >= limit) break;
      if (matches(q, n.body)) {
        const contact = db.accountContacts.find((c) => c.id === n.accountContactId);
        const account = contact ? db.accounts.find((a) => a.id === contact.accountId) : undefined;
        noteMatches.push({
          id: n.id,
          entityType: 'contact_note',
          primary: contact ? `${contact.firstName} ${contact.lastName}` : 'Contact note',
          secondary: account ? account.name : 'Timestamped note',
          snippet: truncate(n.body),
          href: account ? `/crm/accounts/${account.id}` : '/crm/accounts',
        });
      }
    }

    return HttpResponse.json({
      accounts,
      contacts,
      opportunities,
      notes: noteMatches,
    });
  }),
];
