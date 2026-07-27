import type {
  Account,
  AuditEntry,
  Campaign,
  CompensationEvent,
  CompensationRule,
  ContentPiece,
  Customer,
  Device,
  Doc,
  Feature,
  Incident,
  Invoice,
  KeyResult,
  LegalDocument,
  Objective,
  Opportunity,
  Person,
  Release,
  SoftwareLicense,
  Subscription,
  Ticket,
  User,
} from '@factory/shared';

const uuid = () => crypto.randomUUID();
const iso = (d = new Date()) => d.toISOString();

function daysAgo(n: number) {
  return iso(new Date(Date.now() - n * 86400_000));
}
function daysFromNow(n: number) {
  return iso(new Date(Date.now() + n * 86400_000));
}

export function seedTickets(accounts: Account[], people: Person[]): Ticket[] {
  const now = iso();
  const owner = people.find((p) => p.role === 'Head of Sales')?.id ?? null;
  const engineer = people.find((p) => p.role === 'Senior Backend Engineer')?.id ?? null;
  const acc = (name: string) => accounts.find((a) => a.name === name)?.id ?? null;
  const rows: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { subject: 'Cannot invite new team members',       description: 'Invite email never arrives.', accountId: acc('Northwind GmbH'),   requesterEmail: 'ops@northwind.example',   status: 'open',     priority: 'high',   assigneeId: engineer },
    { subject: 'Export to CSV missing new columns',    description: 'Analytics export doesn’t include product code.', accountId: acc('Bluewave Studios'), requesterEmail: 'billing@bluewave.example', status: 'pending',  priority: 'normal', assigneeId: engineer },
    { subject: 'SSO error after upgrade',              description: 'Getting 500 on callback.',  accountId: acc('Alpina AG'),         requesterEmail: 'it@alpina.example',        status: 'open',     priority: 'urgent', assigneeId: engineer },
    { subject: 'Please update primary contact',        description: 'New billing contact.',       accountId: acc('Poseidon SRL'),      requesterEmail: 'finance@poseidon.example', status: 'resolved', priority: 'low',    assigneeId: owner },
    { subject: 'Feature request: bulk delete',         description: 'Would like to delete multiple rows.', accountId: acc('Nordic Retail AB'), requesterEmail: 'ops@nordicretail.example', status: 'closed',   priority: 'low',    assigneeId: null },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

export function seedSubscriptions(customers: Customer[]): Subscription[] {
  const now = iso();
  return customers.map((c) => ({
    id: uuid(),
    customerId: c.id,
    productCode: c.productCode,
    mrrCents: c.mrrCents,
    billingCycle: 'monthly',
    status: c.active ? 'active' : 'cancelled',
    startedAt: c.since,
    nextInvoiceAt: daysFromNow(14),
    createdAt: now,
    updatedAt: now,
  }));
}

export function seedInvoices(subscriptions: Subscription[]): Invoice[] {
  const now = iso();
  const rows: Invoice[] = [];
  let n = 1001;
  for (const sub of subscriptions) {
    for (let i = 1; i <= 3; i++) {
      const issued = daysAgo(i * 30);
      const due = daysAgo(i * 30 - 14);
      const overdue = i === 1 && sub.status === 'past_due';
      const status: Invoice['status'] = overdue ? 'overdue' : i === 1 && sub.status === 'active' ? 'sent' : 'paid';
      rows.push({
        id: uuid(),
        number: `INV-${String(n++).padStart(5, '0')}`,
        customerId: sub.customerId,
        subscriptionId: sub.id,
        amountCents: sub.mrrCents,
        status,
        issuedAt: issued,
        dueAt: due,
        paidAt: status === 'paid' ? daysAgo(i * 30 - 10) : null,
        createdAt: now,
        updatedAt: now,
      });
    }
  }
  return rows;
}

export function seedFeatures(): Feature[] {
  const now = iso();
  const rows: Omit<Feature, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { title: 'Bulk import (CSV)',            description: 'Import 10k+ rows at once.',              area: 'core',       status: 'shipped',     effort: 'm', targetRelease: '3.1' },
    { title: 'Custom dashboards',            description: 'User-defined widgets.',                    area: 'analytics',  status: 'beta',        effort: 'l', targetRelease: '3.2' },
    { title: 'Zapier integration',           description: 'Trigger + action on any event.',           area: 'automation', status: 'in_progress', effort: 'l', targetRelease: '3.2' },
    { title: 'API v2',                       description: 'Cursor pagination + typed schema.',        area: 'platform',   status: 'planned',     effort: 'xl', targetRelease: '4.0' },
    { title: 'Dark theme',                   description: 'Full dark mode.',                          area: 'core',       status: 'idea',        effort: 's', targetRelease: null },
    { title: 'SSO — SAML',                   description: 'Enterprise SSO.',                          area: 'platform',   status: 'planned',     effort: 'l', targetRelease: '3.3' },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

export function seedReleases(): Release[] {
  const now = iso();
  const rows: Omit<Release, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { version: '3.1.0', releasedAt: daysAgo(60), notes: 'Bulk CSV import, tables now sortable everywhere.' },
    { version: '3.0.5', releasedAt: daysAgo(90), notes: 'Bug fixes across reports.' },
    { version: '3.0.0', releasedAt: daysAgo(180), notes: 'New API, redesigned dashboard.' },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

export function seedIncidents(): Incident[] {
  const now = iso();
  const rows: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { title: 'API latency spike — EU region', severity: 'sev2', status: 'resolved',      summary: 'Elevated latency 12:00–12:35 UTC. RCA published.', startedAt: daysAgo(5), resolvedAt: daysAgo(5) },
    { title: 'Login page 503',                severity: 'sev1', status: 'resolved',      summary: 'Full outage 03:12–03:24 UTC. Cause: bad deploy.', startedAt: daysAgo(21), resolvedAt: daysAgo(21) },
    { title: 'Reports slow to load',          severity: 'sev3', status: 'monitoring',    summary: 'Users report slower report renders.', startedAt: daysAgo(1), resolvedAt: null },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

export function seedCampaigns(): Campaign[] {
  const now = iso();
  const rows: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { name: 'Q4 Google Ads',        channel: 'paid_search', status: 'live',     budgetCents: 6_000_000, spentCents: 3_800_000, leadsGenerated: 87, startDate: daysAgo(45), endDate: daysFromNow(15) },
    { name: 'Autumn newsletter',    channel: 'email',       status: 'complete', budgetCents: 200_000,   spentCents: 180_000,   leadsGenerated: 42, startDate: daysAgo(30), endDate: daysAgo(15) },
    { name: 'LinkedIn thought lead', channel: 'social',     status: 'live',     budgetCents: 1_500_000, spentCents: 700_000,   leadsGenerated: 24, startDate: daysAgo(20), endDate: null },
    { name: 'DACH conference booth', channel: 'event',      status: 'planned',  budgetCents: 4_500_000, spentCents: 0,         leadsGenerated: 0,  startDate: daysFromNow(30), endDate: daysFromNow(32) },
    { name: 'Ops playbook',          channel: 'content',    status: 'complete', budgetCents: 300_000,   spentCents: 250_000,   leadsGenerated: 61, startDate: daysAgo(90), endDate: daysAgo(30) },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

export function seedContent(people: Person[]): ContentPiece[] {
  const now = iso();
  const sara = people.find((p) => p.email === 'sara@iosl.internal')?.id ?? null;
  const jonas = people.find((p) => p.email === 'jonas@iosl.internal')?.id ?? null;
  const rows: Omit<ContentPiece, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { title: 'How Northwind cut ops time by 40 %', type: 'case_study', status: 'published', authorId: jonas, publishedAt: daysAgo(20) },
    { title: 'Guide to team onboarding',           type: 'guide',      status: 'published', authorId: sara,  publishedAt: daysAgo(45) },
    { title: 'The state of ops in DACH 2026',      type: 'whitepaper', status: 'review',    authorId: sara,  publishedAt: null },
    { title: 'Deep-dive: our new API',             type: 'blog',       status: 'drafting',  authorId: sara,  publishedAt: null },
    { title: '5-min product tour',                 type: 'video',      status: 'idea',      authorId: null,  publishedAt: null },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

export function seedLegal(accounts: Account[], people: Person[]): LegalDocument[] {
  const now = iso();
  const owner = people.find((p) => p.role === 'CEO')?.id ?? null;
  const acc = (name: string) => accounts.find((a) => a.name === name)?.id ?? null;
  const rows: Omit<LegalDocument, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { name: 'Northwind — MSA',        accountId: acc('Northwind GmbH'),    type: 'msa',        status: 'signed',    valueCents: 0,          signedAt: daysAgo(400), effectiveFrom: daysAgo(400), effectiveTo: null,             ownerId: owner },
    { name: 'Northwind — Order form 2026', accountId: acc('Northwind GmbH'), type: 'order_form', status: 'signed', valueCents: 8_400_000, signedAt: daysAgo(30),  effectiveFrom: daysAgo(30),  effectiveTo: daysFromNow(335), ownerId: owner },
    { name: 'Alpina — DPA',           accountId: acc('Alpina AG'),         type: 'dpa',        status: 'in_review', valueCents: 0,          signedAt: null,          effectiveFrom: daysFromNow(0), effectiveTo: null,             ownerId: owner },
    { name: 'Bluewave — SOW #1',      accountId: acc('Bluewave Studios'),  type: 'sow',        status: 'signed',    valueCents: 1_200_000, signedAt: daysAgo(60),  effectiveFrom: daysAgo(60),  effectiveTo: daysFromNow(30),  ownerId: owner },
    { name: 'Employee NDA — template',accountId: null,                     type: 'nda',        status: 'signed',    valueCents: 0,          signedAt: daysAgo(300), effectiveFrom: daysAgo(300), effectiveTo: null,             ownerId: owner },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

export function seedDevices(people: Person[]): Device[] {
  const now = iso();
  const person = (email: string) => people.find((p) => p.email === email)?.id ?? null;
  const rows: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { kind: 'laptop',  model: 'MacBook Pro 14"',      serialNumber: 'C02XL0EMH', assigneeId: person('anh@iosl.internal'),   purchasedAt: daysAgo(600), costCents: 2_800_000, status: 'in_use' },
    { kind: 'laptop',  model: 'MacBook Air M2',        serialNumber: 'C02Y88YZQ', assigneeId: person('lena@iosl.internal'),  purchasedAt: daysAgo(400), costCents: 1_500_000, status: 'in_use' },
    { kind: 'laptop',  model: 'ThinkPad X1 Carbon',    serialNumber: 'PF3G7B9A',  assigneeId: person('marco@iosl.internal'), purchasedAt: daysAgo(300), costCents: 1_800_000, status: 'in_use' },
    { kind: 'monitor', model: 'LG UltraFine 27"',      serialNumber: '2211QK1',   assigneeId: person('marco@iosl.internal'), purchasedAt: daysAgo(200), costCents: 600_000,   status: 'in_use' },
    { kind: 'phone',   model: 'iPhone 15',              serialNumber: 'F2LWX8ZRN', assigneeId: person('jonas@iosl.internal'), purchasedAt: daysAgo(180), costCents: 950_000,   status: 'in_use' },
    { kind: 'laptop',  model: 'MacBook Pro 13"',       serialNumber: 'C02XSPARE', assigneeId: null,                          purchasedAt: daysAgo(700), costCents: 2_100_000, status: 'spare' },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

export function seedSoftwareLicenses(): SoftwareLicense[] {
  const now = iso();
  const rows: Omit<SoftwareLicense, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { tool: 'Linear',            seatCount: 15, seatsUsed: 12, monthlyCostCents: 15_000, renewalAt: daysFromNow(45) },
    { tool: 'Google Workspace',  seatCount: 20, seatsUsed: 14, monthlyCostCents: 22_000, renewalAt: daysFromNow(90) },
    { tool: 'Notion',            seatCount: 15, seatsUsed: 10, monthlyCostCents: 12_000, renewalAt: daysFromNow(120) },
    { tool: 'GitHub Teams',      seatCount: 12, seatsUsed: 8,  monthlyCostCents:  8_400, renewalAt: daysFromNow(60) },
    { tool: 'Figma',             seatCount: 8,  seatsUsed: 5,  monthlyCostCents: 12_000, renewalAt: daysFromNow(180) },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

export function seedObjectives(people: Person[]): Objective[] {
  const now = iso();
  const period = ((): string => {
    const d = new Date();
    return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
  })();
  const owner = (email: string) => people.find((p) => p.email === email)?.id ?? null;
  const rows: Omit<Objective, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { title: 'Hit 250k MRR',                         period, ownerId: owner('jonas@iosl.internal'), status: 'on_track' },
    { title: 'Ship API v2 to GA',                    period, ownerId: owner('lena@iosl.internal'),  status: 'at_risk' },
    { title: 'Reduce infra spend by 15 %',           period, ownerId: owner('lena@iosl.internal'),  status: 'on_track' },
    { title: 'Delight customers (NPS ≥ 55)',         period, ownerId: owner('sara@iosl.internal'),  status: 'off_track' },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

export function seedKeyResults(objectives: Objective[]): KeyResult[] {
  const now = iso();
  const obj = (title: string) => objectives.find((o) => o.title === title)!.id;
  const rows: Omit<KeyResult, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { objectiveId: obj('Hit 250k MRR'),           title: 'New MRR from mid-market',       target: 150000, current: 90000,  unit: '€',   status: 'on_track' },
    { objectiveId: obj('Hit 250k MRR'),           title: 'Reduce churn to under 1 % / mo', target: 1,      current: 1.3,    unit: '%',   status: 'at_risk' },
    { objectiveId: obj('Ship API v2 to GA'),      title: 'RFCs merged',                    target: 8,      current: 6,      unit: 'RFCs',status: 'on_track' },
    { objectiveId: obj('Ship API v2 to GA'),      title: 'Design-partner integrations',    target: 3,      current: 1,      unit: 'orgs',status: 'at_risk' },
    { objectiveId: obj('Reduce infra spend by 15 %'), title: 'AWS bill',                    target: 15,     current: 8,      unit: '%',   status: 'on_track' },
    { objectiveId: obj('Delight customers (NPS ≥ 55)'), title: 'NPS score',                target: 55,     current: 42,     unit: 'NPS', status: 'off_track' },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

export function seedDocs(people: Person[]): Doc[] {
  const now = iso();
  const author = (email: string) => people.find((p) => p.email === email)?.id ?? null;
  const rows: Omit<Doc, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { title: 'Engineering onboarding',      category: 'engineering', body: 'Set up your laptop, get access to GitHub, Linear, and Notion. Read the constitution.', authorId: author('lena@iosl.internal') },
    { title: 'Sales playbook',              category: 'sales',       body: 'Qualification criteria, discovery questions, pricing table.',                          authorId: author('jonas@iosl.internal') },
    { title: 'Incident response runbook',   category: 'engineering', body: 'On-call rotation, sev definitions, escalation path.',                                  authorId: author('lena@iosl.internal') },
    { title: 'Expense policy',              category: 'finance',     body: 'What can and cannot be expensed, receipts, reimbursements.',                            authorId: author('anh@iosl.internal') },
    { title: 'Design principles',           category: 'product',     body: 'Numbers right-aligned, JetBrains Mono, European format. shadcn only. No new UI libs.',   authorId: author('sara@iosl.internal') },
    { title: 'People — leave & benefits',   category: 'people',      body: 'Vacation, sick leave, benefits, insurance.',                                             authorId: author('anh@iosl.internal') },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

export function seedAudit(users: User[]): AuditEntry[] {
  const actor = users[0]!;
  const rows: Omit<AuditEntry, 'id'>[] = [
    { actorId: actor.id, actorEmail: actor.email, action: 'login',       resource: 'auth',           resourceId: null,                                            detail: 'Signed in',                                                    at: daysAgo(0) },
    { actorId: actor.id, actorEmail: actor.email, action: 'create',      resource: 'opportunity',    resourceId: 'opp_seed',                                       detail: 'Created "Nordic Retail — Multi-site"',                          at: daysAgo(1) },
    { actorId: actor.id, actorEmail: actor.email, action: 'update',      resource: 'opportunity',    resourceId: 'opp_seed',                                       detail: 'Advanced Bluewave to trial',                                    at: daysAgo(2) },
    { actorId: actor.id, actorEmail: actor.email, action: 'role_change', resource: 'user',           resourceId: users[1]?.id ?? null,                             detail: 'Promoted Lena to manager',                                      at: daysAgo(4) },
    { actorId: actor.id, actorEmail: actor.email, action: 'delete',      resource: 'lead',           resourceId: 'lead_seed',                                       detail: 'Removed spam lead',                                             at: daysAgo(6) },
  ];
  return rows.map((r) => ({ ...r, id: uuid() }));
}

export function seedCompensationRules(people: Person[]): CompensationRule[] {
  const now = iso();
  const jonas = people.find((p) => p.email === 'jonas@iosl.internal');
  const sara = people.find((p) => p.email === 'sara@iosl.internal');
  const rules: CompensationRule[] = [];

  if (jonas) {
    rules.push({
      id: uuid(),
      personId: jonas.id,
      kind: 'sales_commission',
      triggerType: 'opportunity_won',
      computation: 'percentage_of_source',
      percentageBps: 800, // 8 %
      fixedAmountCents: null,
      capCents: null,
      effectiveFrom: daysAgo(365),
      effectiveTo: null,
      active: true,
      createdAt: now,
      updatedAt: now,
    });
    rules.push({
      id: uuid(),
      personId: jonas.id,
      kind: 'expansion_commission',
      triggerType: 'customer_expansion',
      computation: 'percentage_of_source',
      percentageBps: 400, // 4 %
      fixedAmountCents: null,
      capCents: null,
      effectiveFrom: daysAgo(365),
      effectiveTo: null,
      active: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  if (sara) {
    rules.push({
      id: uuid(),
      personId: sara.id,
      kind: 'referral_bonus',
      triggerType: 'referral_hire',
      computation: 'fixed_amount',
      percentageBps: null,
      fixedAmountCents: 500_00,
      capCents: null,
      effectiveFrom: daysAgo(365),
      effectiveTo: null,
      active: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  return rules;
}

/**
 * Backfill compensation events for historical close_won opportunities. Also
 * seeds a variety of statuses (earned / approved / paid) so the UI shows the
 * full workflow out of the box.
 */
export function seedCompensationEvents(
  rules: CompensationRule[],
  opportunities: Opportunity[],
  users: User[],
): CompensationEvent[] {
  const now = iso();
  const approver = users[0]!.id;
  const events: CompensationEvent[] = [];

  const won = opportunities.filter((o) => o.stage === 'close_won');
  for (const opp of won) {
    if (!opp.ownerId) continue;
    const rule = rules.find(
      (r) => r.personId === opp.ownerId && r.triggerType === 'opportunity_won' && r.active,
    );
    if (!rule || !rule.percentageBps) continue;
    const amount = Math.round((opp.amountCents * rule.percentageBps) / 10_000);
    if (amount <= 0) continue;
    events.push({
      id: uuid(),
      personId: rule.personId,
      ruleId: rule.id,
      kind: rule.kind,
      triggerType: 'opportunity_won',
      sourceType: 'opportunity',
      sourceId: opp.id,
      amountCents: amount,
      earnedAt: opp.expectedCloseDate,
      status: 'approved',
      approvedById: approver,
      approvedAt: daysAgo(2),
      paidAt: null,
      note: `Auto: ${opp.name}`,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Add a few illustrative extras so all statuses are represented.
  const jonasRule = rules.find(
    (r) => r.triggerType === 'opportunity_won' && r.kind === 'sales_commission',
  );
  if (jonasRule) {
    events.push({
      id: uuid(),
      personId: jonasRule.personId,
      ruleId: null,
      kind: 'spot_bonus',
      triggerType: 'manual',
      sourceType: 'manual',
      sourceId: null,
      amountCents: 1_500_00,
      earnedAt: daysAgo(20),
      status: 'paid',
      approvedById: approver,
      approvedAt: daysAgo(18),
      paidAt: daysAgo(10),
      note: 'Q3 above-and-beyond',
      createdAt: now,
      updatedAt: now,
    });
    events.push({
      id: uuid(),
      personId: jonasRule.personId,
      ruleId: jonasRule.id,
      kind: 'sales_commission',
      triggerType: 'opportunity_won',
      sourceType: 'opportunity',
      sourceId: null,
      amountCents: 3_600_00,
      earnedAt: daysAgo(5),
      status: 'earned',
      approvedById: null,
      approvedAt: null,
      paidAt: null,
      note: 'Auto: Nordic Retail — pending approval',
      createdAt: now,
      updatedAt: now,
    });
  }

  const saraRule = rules.find((r) => r.kind === 'referral_bonus');
  if (saraRule) {
    events.push({
      id: uuid(),
      personId: saraRule.personId,
      ruleId: saraRule.id,
      kind: 'referral_bonus',
      triggerType: 'referral_hire',
      sourceType: 'person',
      sourceId: null,
      amountCents: 500_00,
      earnedAt: daysAgo(40),
      status: 'paid',
      approvedById: approver,
      approvedAt: daysAgo(38),
      paidAt: daysAgo(30),
      note: 'Referred Marco Rossi',
      createdAt: now,
      updatedAt: now,
    });
  }

  return events;
}
