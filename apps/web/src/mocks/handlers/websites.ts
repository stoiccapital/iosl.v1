import { http, HttpResponse } from 'msw';
import {
  CreateWebsiteInputSchema,
  SubmitWebsiteInputSchema,
  UpdateWebsiteInputSchema,
  slugifyWebsiteName,
  type Candidate,
  type Lead,
  type Website,
  type WebsiteSubmission,
} from '@factory/shared';
import { db } from '../db';
import { iso, uuid } from '../lib/crud';
import { mergeDefined } from '../lib/merge';
import { persistWebsites } from '../persistence';
import { buildDefaults } from '@/features/marketing/websites/templates/defaults';

const DRIVER_POSITION_TITLE = 'Driver';

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function uniqueSlug(base: string): string {
  const seed = slugifyWebsiteName(base) || 'site';
  if (!db.websites.some((w) => w.slug === seed)) return seed;
  let n = 2;
  while (db.websites.some((w) => w.slug === `${seed}-${n}`)) n++;
  return `${seed}-${n}`;
}

function driverPositionId(): string | null {
  return db.positions.find((p) => p.title === DRIVER_POSITION_TITLE)?.id ?? null;
}

export const websitesHandlers = [
  http.get('/api/websites', async () => {
    await delay(80);
    return HttpResponse.json(db.websites);
  }),

  http.get('/api/websites/:id', async ({ params }) => {
    const w = db.websites.find((x) => x.id === params['id']);
    if (!w) return new HttpResponse('Not Found', { status: 404 });
    return HttpResponse.json(w);
  }),

  http.post('/api/websites', async ({ request }) => {
    await delay(150);
    const raw = await request.json();
    const parsed = CreateWebsiteInputSchema.safeParse(raw);
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { name, templateId, locales, defaultLocale, status } = parsed.data;
    if (!locales.includes(defaultLocale)) {
      return HttpResponse.json(
        { error: { formErrors: ['defaultLocale must be part of locales'], fieldErrors: {} } },
        { status: 400 },
      );
    }
    const row: Website = {
      id: uuid(),
      name,
      slug: uniqueSlug(name),
      status,
      templateId,
      locales,
      defaultLocale,
      content: buildDefaults(templateId, name),
      createdAt: iso(),
      updatedAt: iso(),
    };
    db.websites = [row, ...db.websites];
    persistWebsites();
    return HttpResponse.json(row, { status: 201 });
  }),

  http.patch('/api/websites/:id', async ({ params, request }) => {
    await delay(150);
    const idx = db.websites.findIndex((w) => w.id === params['id']);
    if (idx === -1) return new HttpResponse('Not Found', { status: 404 });
    const raw = await request.json();
    const parsed = UpdateWebsiteInputSchema.safeParse(raw);
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const current = db.websites[idx]!;
    if (parsed.data.locales && parsed.data.defaultLocale) {
      if (!parsed.data.locales.includes(parsed.data.defaultLocale)) {
        return HttpResponse.json(
          { error: { formErrors: ['defaultLocale must be part of locales'], fieldErrors: {} } },
          { status: 400 },
        );
      }
    }
    const next = mergeDefined({ ...current, updatedAt: iso() }, parsed.data);
    db.websites[idx] = next;
    persistWebsites();
    return HttpResponse.json(next);
  }),

  http.delete('/api/websites/:id', async ({ params }) => {
    await delay(100);
    const idx = db.websites.findIndex((w) => w.id === params['id']);
    if (idx === -1) return new HttpResponse('Not Found', { status: 404 });
    db.websites.splice(idx, 1);
    db.websiteSubmissions = db.websiteSubmissions.filter((s) => s.websiteId !== params['id']);
    persistWebsites();
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('/api/websites/:id/submissions', async ({ params }) => {
    await delay(80);
    return HttpResponse.json(
      db.websiteSubmissions.filter((s) => s.websiteId === params['id']),
    );
  }),

  // Public lookup by slug — used by the public site pages.
  http.get('/api/sites/:slug', async ({ params }) => {
    const w = db.websites.find((x) => x.slug === params['slug']);
    if (!w) return new HttpResponse('Not Found', { status: 404 });
    return HttpResponse.json(w);
  }),

  // Public submit — routes to CRM Lead or Recruiting Candidate.
  http.post('/api/sites/:slug/submit', async ({ params, request }) => {
    await delay(200);
    const site = db.websites.find((w) => w.slug === params['slug']);
    if (!site) return new HttpResponse('Not Found', { status: 404 });

    const raw = await request.json();
    const parsed = SubmitWebsiteInputSchema.safeParse(raw);
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const now = iso();
    let leadId: string | null = null;
    let candidateId: string | null = null;

    if (parsed.data.kind === 'ride_interest') {
      const p = parsed.data.payload;
      const lead: Lead = {
        id: uuid(),
        name: p.name,
        company: `Website — ${site.name}`,
        email: p.email,
        source: 'inbound',
        status: 'new',
        estimatedValueCents: 0,
        createdAt: now,
        updatedAt: now,
      };
      db.leads = [lead, ...db.leads];
      leadId = lead.id;
    } else {
      const p = parsed.data.payload;
      const positionId = driverPositionId();
      if (!positionId) {
        return HttpResponse.json(
          { error: { formErrors: ['Driver position not configured'], fieldErrors: {} } },
          { status: 500 },
        );
      }
      const [firstName, ...rest] = p.name.trim().split(/\s+/);
      const lastName = rest.join(' ') || '—';
      const notes = [
        `Phone: ${p.phone}`,
        `City: ${p.city}`,
        `License: ${p.licenseClass}`,
        p.note ? `Note: ${p.note}` : null,
        `Source: website ${site.name} (${site.slug})`,
      ]
        .filter(Boolean)
        .join('\n');
      const candidate: Candidate = {
        id: uuid(),
        firstName: firstName ?? p.name,
        lastName,
        email: p.email,
        positionId,
        stage: 'applied',
        source: 'inbound',
        notes,
        appliedAt: now,
        createdAt: now,
        updatedAt: now,
      };
      db.candidates = [candidate, ...db.candidates];
      candidateId = candidate.id;
    }

    const submission: WebsiteSubmission = {
      id: uuid(),
      websiteId: site.id,
      kind: parsed.data.kind,
      locale: parsed.data.locale,
      payload: parsed.data.payload,
      leadId,
      candidateId,
      submittedAt: now,
    };
    db.websiteSubmissions = [submission, ...db.websiteSubmissions];
    persistWebsites();
    return HttpResponse.json(submission, { status: 201 });
  }),
];
