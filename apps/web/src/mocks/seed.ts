import type {
  Account,
  Assignment,
  Candidate,
  Contract,
  Customer,
  Lead,
  Opportunity,
  PayrollEntry,
  Person,
  Position,
  Product,
  Project,
  Supplier,
  Task,
  TimeEntry,
  User,
  Website,
} from '@factory/shared';
import { buildDefaults } from '@/features/marketing/websites/templates/defaults';
import { db } from './db';
import { loadPersistedWebsites } from './persistence';

const uuid = () => crypto.randomUUID();
const iso = (d = new Date()) => d.toISOString();

function seedProducts(): Product[] {
  return [
    { id: uuid(), name: 'Core Platform', code: 'core', monthlyPriceCents: 4900_00, active: true },
    { id: uuid(), name: 'Analytics Add-on', code: 'analytics', monthlyPriceCents: 1900_00, active: true },
    { id: uuid(), name: 'Automation Add-on', code: 'automation', monthlyPriceCents: 2900_00, active: true },
    { id: uuid(), name: 'Legacy Starter', code: 'starter', monthlyPriceCents: 900_00, active: false },
  ];
}

function seedPeople(): Person[] {
  const now = iso();
  const rows: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { type: 'employee', firstName: 'Anh', lastName: 'Chu', email: 'anh@iosl.internal', role: 'CEO', location: 'Munich', startDate: iso(new Date('2022-01-01')) },
    { type: 'employee', firstName: 'Lena', lastName: 'Weber', email: 'lena@iosl.internal', role: 'Head of Engineering', location: 'Berlin', startDate: iso(new Date('2022-03-15')) },
    { type: 'employee', firstName: 'Marco', lastName: 'Rossi', email: 'marco@iosl.internal', role: 'Senior Backend Engineer', location: 'Milan', startDate: iso(new Date('2023-05-01')) },
    { type: 'employee', firstName: 'Sara', lastName: 'Nguyen', email: 'sara@iosl.internal', role: 'Product Designer', location: 'Ho Chi Minh City', startDate: iso(new Date('2023-09-01')) },
    { type: 'employee', firstName: 'Jonas', lastName: 'Meier', email: 'jonas@iosl.internal', role: 'Head of Sales', location: 'Zurich', startDate: iso(new Date('2022-06-01')) },
    { type: 'freelancer', firstName: 'Priya', lastName: 'Sharma', email: 'priya@contract.io', role: 'Frontend Engineer', location: 'Bangalore', startDate: iso(new Date('2024-02-01')) },
    { type: 'freelancer', firstName: 'Tom', lastName: 'Becker', email: 'tom@contract.io', role: 'DevOps Consultant', location: 'Hamburg', startDate: iso(new Date('2024-04-15')) },
    { type: 'candidate', firstName: 'Elif', lastName: 'Yılmaz', email: 'elif@applicants.io', role: 'Senior Frontend Engineer', location: 'Istanbul', startDate: null },
    { type: 'candidate', firstName: 'David', lastName: 'Kim', email: 'david@applicants.io', role: 'Product Manager', location: 'Seoul', startDate: null },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

function seedTasks(): Task[] {
  const now = iso();
  return [
    {
      id: uuid(),
      title: 'Wire up MSW mocks',
      description: 'Add handlers for /api/health and /api/tasks so the FE renders green.',
      status: 'done',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      title: 'Design AppShell layout',
      description: 'Sidebar + topbar using only shadcn primitives.',
      status: 'in_progress',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      title: 'Ship IOSL modules',
      description: 'Roll out CRM, Finance, Suppliers, HR, Recruiting, Projects, BI, Settings.',
      status: 'open',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function seedAccounts(): Account[] {
  const now = iso();
  const rows: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { name: 'Northwind GmbH', industry: 'Logistics', size: '51-200', country: 'Germany', website: 'https://northwind.example.com' },
    { name: 'Bluewave Studios', industry: 'Media', size: '11-50', country: 'Germany', website: 'https://bluewave.example.com' },
    { name: 'Alpina AG', industry: 'Manufacturing', size: '201+', country: 'Switzerland', website: 'https://alpina.example.ch' },
    { name: 'Poseidon SRL', industry: 'Shipping', size: '51-200', country: 'Italy', website: 'https://poseidon.example.it' },
    { name: 'Ríos Consulting', industry: 'Consulting', size: '11-50', country: 'Spain', website: 'https://rios.example.es' },
    { name: 'Nordic Retail AB', industry: 'Retail', size: '201+', country: 'Sweden', website: null },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

function seedLeads(): Lead[] {
  const now = iso();
  const rows: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { name: 'Jana Kraus', company: 'Kraus Digital', email: 'jana@krausdigital.example', source: 'inbound', status: 'new', estimatedValueCents: 1200000 },
    { name: 'Emilio Bianchi', company: 'Bianchi Foods', email: 'emilio@bianchi.example', source: 'referral', status: 'qualified', estimatedValueCents: 4800000 },
    { name: 'Sofia Martín', company: 'MartinTech', email: 'sofia@martintech.example', source: 'event', status: 'new', estimatedValueCents: 2400000 },
    { name: 'Ove Lindqvist', company: 'Lindqvist AB', email: 'ove@lindqvist.example', source: 'outbound', status: 'disqualified', estimatedValueCents: 300000 },
    { name: 'Klara Novak', company: 'Novak Studio', email: 'klara@novak.example', source: 'inbound', status: 'qualified', estimatedValueCents: 900000 },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

function seedOpportunities(accounts: Account[], people: Person[]): Opportunity[] {
  const now = iso();
  const owner = people.find((p) => p.role === 'Head of Sales')?.id ?? null;
  const acc = (name: string) => accounts.find((a) => a.name === name)!.id;
  const future = (days: number) => new Date(Date.now() + days * 86400_000).toISOString();
  const rows: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { name: 'Northwind — Core rollout',       accountId: acc('Northwind GmbH'),    stage: 'qualified', amountCents: 8_400_000, probability: 20, expectedCloseDate: future(45), ownerId: owner },
    { name: 'Bluewave — Analytics add-on',    accountId: acc('Bluewave Studios'),  stage: 'trial',      amountCents: 2_280_000, probability: 40, expectedCloseDate: future(20), ownerId: owner },
    { name: 'Alpina — Enterprise agreement',  accountId: acc('Alpina AG'),         stage: 'decision',   amountCents: 24_000_000, probability: 70, expectedCloseDate: future(10), ownerId: owner },
    { name: 'Poseidon — Automation add-on',   accountId: acc('Poseidon SRL'),      stage: 'close_won',  amountCents: 3_480_000, probability: 100, expectedCloseDate: future(-5), ownerId: owner },
    { name: 'Ríos — Core annual',             accountId: acc('Ríos Consulting'),   stage: 'close_lost', amountCents: 1_800_000, probability: 0,   expectedCloseDate: future(-15), ownerId: owner },
    { name: 'Nordic Retail — Multi-site',     accountId: acc('Nordic Retail AB'),  stage: 'qualified',  amountCents: 12_000_000, probability: 15, expectedCloseDate: future(60), ownerId: owner },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

function seedCustomers(accounts: Account[], products: Product[]): Customer[] {
  const now = iso();
  const acc = (name: string) => accounts.find((a) => a.name === name)!.id;
  const prod = (code: string) => products.find((p) => p.code === code)!.code;
  const daysAgo = (n: number) => iso(new Date(Date.now() - n * 86400_000));
  const rows: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { accountId: acc('Poseidon SRL'),     productCode: prod('core'),       mrrCents: 4_900_00, since: iso(new Date('2024-11-01')), active: true,  churnedAt: null,           churnReason: null },
    { accountId: acc('Poseidon SRL'),     productCode: prod('automation'), mrrCents: 2_900_00, since: iso(new Date('2025-02-01')), active: true,  churnedAt: null,           churnReason: null },
    { accountId: acc('Northwind GmbH'),   productCode: prod('core'),       mrrCents: 4_900_00, since: iso(new Date('2023-07-01')), active: true,  churnedAt: null,           churnReason: null },
    { accountId: acc('Bluewave Studios'), productCode: prod('core'),       mrrCents: 4_900_00, since: iso(new Date('2024-02-15')), active: true,  churnedAt: null,           churnReason: null },
    { accountId: acc('Bluewave Studios'), productCode: prod('analytics'),  mrrCents: 1_900_00, since: iso(new Date('2024-08-01')), active: true,  churnedAt: null,           churnReason: null },
    { accountId: acc('Nordic Retail AB'), productCode: prod('core'),       mrrCents: 4_900_00, since: iso(new Date('2022-04-01')), active: true,  churnedAt: null,           churnReason: null },
    { accountId: acc('Nordic Retail AB'), productCode: prod('analytics'),  mrrCents: 1_900_00, since: iso(new Date('2023-01-01')), active: true,  churnedAt: null,           churnReason: null },
    { accountId: acc('Ríos Consulting'),  productCode: prod('core'),       mrrCents: 4_900_00, since: iso(new Date('2023-05-01')), active: false, churnedAt: daysAgo(12),   churnReason: 'price' },
    { accountId: acc('Alpina AG'),        productCode: prod('analytics'),  mrrCents: 1_900_00, since: iso(new Date('2023-11-01')), active: false, churnedAt: daysAgo(45),   churnReason: 'lack_of_use' },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

function seedSuppliers(): Supplier[] {
  const now = iso();
  const rows: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { name: 'AWS',           category: 'infrastructure', country: 'Ireland', contactName: 'Account Manager', contactEmail: 'billing@aws.example',   active: true },
    { name: 'Vercel',        category: 'infrastructure', country: 'USA',     contactName: 'Support',         contactEmail: 'billing@vercel.example', active: true },
    { name: 'Linear',        category: 'saas',           country: 'USA',     contactName: 'Success',         contactEmail: 'billing@linear.example', active: true },
    { name: 'Google Workspace', category: 'saas',        country: 'Ireland', contactName: 'Billing',         contactEmail: 'billing@google.example', active: true },
    { name: 'Notion',        category: 'saas',           country: 'USA',     contactName: 'Billing',         contactEmail: 'billing@notion.example', active: true },
    { name: 'Adwords',       category: 'marketing',      country: 'Ireland', contactName: 'Ads',             contactEmail: 'billing@google.example', active: true },
    { name: 'Weberpartners',  category: 'legal',          country: 'Germany', contactName: 'Dr. Weber',       contactEmail: 'kanzlei@weber.example',  active: true },
    { name: 'WeWork Munich', category: 'office',         country: 'Germany', contactName: 'Community',       contactEmail: 'billing@wework.example',  active: false },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

function seedContracts(suppliers: Supplier[]): Contract[] {
  const now = iso();
  const sup = (name: string) => suppliers.find((s) => s.name === name)!.id;
  const start = (months: number) =>
    iso(new Date(new Date().setMonth(new Date().getMonth() - months)));
  const rows: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { supplierId: sup('AWS'),              name: 'Production hosting',   monthlyAmountCents: 320_000, startDate: start(18), endDate: null, status: 'active' },
    { supplierId: sup('Vercel'),           name: 'Frontend hosting',     monthlyAmountCents:  40_000, startDate: start(12), endDate: null, status: 'active' },
    { supplierId: sup('Linear'),           name: 'Team plan',            monthlyAmountCents:  15_000, startDate: start(20), endDate: null, status: 'active' },
    { supplierId: sup('Google Workspace'), name: 'Business Standard',    monthlyAmountCents:  22_000, startDate: start(24), endDate: null, status: 'active' },
    { supplierId: sup('Notion'),           name: 'Business plan',        monthlyAmountCents:  12_000, startDate: start(15), endDate: null, status: 'active' },
    { supplierId: sup('Adwords'),          name: 'Q4 campaign',          monthlyAmountCents: 500_000, startDate: start(4),  endDate: null, status: 'active' },
    { supplierId: sup('Weberpartners'),    name: 'Retainer',             monthlyAmountCents: 120_000, startDate: start(30), endDate: null, status: 'active' },
    { supplierId: sup('WeWork Munich'),    name: 'Munich office',        monthlyAmountCents: 240_000, startDate: start(24), endDate: start(2), status: 'ended' },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

function seedPayroll(people: Person[]): PayrollEntry[] {
  const now = iso();
  const employees = people.filter((p) => p.type === 'employee');
  const freelancers = people.filter((p) => p.type === 'freelancer');
  const monthlyForRole: Record<string, number> = {
    'CEO': 1_200_000,
    'Head of Engineering': 1_100_000,
    'Senior Backend Engineer': 900_000,
    'Product Designer': 800_000,
    'Head of Sales': 1_050_000,
    'Frontend Engineer': 780_000,
    'DevOps Consultant': 950_000,
  };
  const emp = employees.map<PayrollEntry>((p) => ({
    id: uuid(),
    personId: p.id,
    grossAmountCents: monthlyForRole[p.role] ?? 700_000,
    effectiveDate: p.startDate ?? iso(),
    cadence: 'monthly',
    note: `Salary — ${p.role}`,
    createdAt: now,
    updatedAt: now,
  }));
  const free = freelancers.map<PayrollEntry>((p) => ({
    id: uuid(),
    personId: p.id,
    grossAmountCents: monthlyForRole[p.role] ?? 700_000,
    effectiveDate: p.startDate ?? iso(),
    cadence: 'monthly',
    note: `Contractor day-rate × 20 — ${p.role}`,
    createdAt: now,
    updatedAt: now,
  }));
  return [...emp, ...free];
}

function seedPositions(): Position[] {
  const now = iso();
  const rows: Omit<Position, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { title: 'Senior Frontend Engineer', department: 'Engineering', location: 'Remote EU', employmentType: 'full_time', openings: 2, status: 'open' },
    { title: 'Product Manager',           department: 'Product',     location: 'Munich',    employmentType: 'full_time', openings: 1, status: 'open' },
    { title: 'DevOps Engineer',           department: 'Engineering', location: 'Remote EU', employmentType: 'full_time', openings: 1, status: 'open' },
    { title: 'Content Marketer',          department: 'Marketing',   location: 'Berlin',    employmentType: 'part_time', openings: 1, status: 'paused' },
    { title: 'QA Contractor',             department: 'Engineering', location: 'Remote',    employmentType: 'contract',  openings: 2, status: 'filled' },
    { title: 'Driver',                    department: 'Operations',  location: 'Munich',    employmentType: 'contract',  openings: 25, status: 'open' },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

export const DRIVER_POSITION_TITLE = 'Driver';

function seedCandidates(positions: Position[]): Candidate[] {
  const now = iso();
  const pos = (title: string) => positions.find((p) => p.title === title)!.id;
  const applied = (days: number) => iso(new Date(Date.now() - days * 86400_000));
  const rows: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { firstName: 'Elif',   lastName: 'Yılmaz',    email: 'elif@applicants.io',    positionId: pos('Senior Frontend Engineer'), stage: 'interview', source: 'inbound',  notes: 'Strong React portfolio', appliedAt: applied(12) },
    { firstName: 'David',  lastName: 'Kim',        email: 'david@applicants.io',   positionId: pos('Product Manager'),           stage: 'offer',     source: 'referral', notes: 'PM at Series B startup, referred by Jonas', appliedAt: applied(20) },
    { firstName: 'Aria',   lastName: 'Sadeghi',    email: 'aria@applicants.io',    positionId: pos('Senior Frontend Engineer'), stage: 'applied',   source: 'inbound',  notes: 'From LinkedIn', appliedAt: applied(3) },
    { firstName: 'Luca',   lastName: 'Moretti',    email: 'luca@applicants.io',    positionId: pos('DevOps Engineer'),            stage: 'screen',    source: 'outbound', notes: 'Sourced', appliedAt: applied(6) },
    { firstName: 'Hana',   lastName: 'Kowalski',   email: 'hana@applicants.io',    positionId: pos('DevOps Engineer'),            stage: 'rejected',  source: 'inbound',  notes: 'Not enough infra depth', appliedAt: applied(15) },
    { firstName: 'Mateo',  lastName: 'Gomez',      email: 'mateo@applicants.io',   positionId: pos('Content Marketer'),           stage: 'hired',     source: 'agency',   notes: 'Signed contract', appliedAt: applied(35) },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

function seedProjects(accounts: Account[]): Project[] {
  const now = iso();
  const acc = (name: string) => accounts.find((a) => a.name === name)?.id ?? null;
  const start = (months: number) =>
    iso(new Date(new Date().setMonth(new Date().getMonth() - months)));
  const future = (months: number) =>
    iso(new Date(new Date().setMonth(new Date().getMonth() + months)));
  const rows: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { name: 'Platform 2.0',        code: 'PLAT2', clientAccountId: null,                       status: 'active',   startDate: start(4), targetEndDate: future(3) },
    { name: 'Northwind rollout',   code: 'NW-01', clientAccountId: acc('Northwind GmbH'),      status: 'active',   startDate: start(2), targetEndDate: future(2) },
    { name: 'Bluewave onboarding', code: 'BW-01', clientAccountId: acc('Bluewave Studios'),    status: 'active',   startDate: start(1), targetEndDate: future(1) },
    { name: 'Internal design system', code: 'DS',   clientAccountId: null,                    status: 'planning', startDate: iso(),    targetEndDate: null       },
    { name: 'Poseidon expansion',  code: 'PO-02', clientAccountId: acc('Poseidon SRL'),        status: 'on_hold',  startDate: start(3), targetEndDate: null       },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

function seedAssignments(projects: Project[], people: Person[]): Assignment[] {
  const now = iso();
  const p = (code: string) => projects.find((x) => x.code === code)!.id;
  const person = (email: string) => people.find((x) => x.email === email)!;
  const rows: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { projectId: p('PLAT2'), personId: person('lena@iosl.internal').id,    role: 'Tech lead',       allocationPercent: 60, status: 'active', location: person('lena@iosl.internal').location },
    { projectId: p('PLAT2'), personId: person('marco@iosl.internal').id,   role: 'Backend',         allocationPercent: 100, status: 'active', location: person('marco@iosl.internal').location },
    { projectId: p('PLAT2'), personId: person('priya@contract.io').id,      role: 'Frontend',        allocationPercent: 80,  status: 'active', location: person('priya@contract.io').location },
    { projectId: p('PLAT2'), personId: person('sara@iosl.internal').id,    role: 'Design',          allocationPercent: 50,  status: 'active', location: person('sara@iosl.internal').location },
    { projectId: p('NW-01'), personId: person('jonas@iosl.internal').id,   role: 'Account lead',    allocationPercent: 30,  status: 'active', location: person('jonas@iosl.internal').location },
    { projectId: p('NW-01'), personId: person('marco@iosl.internal').id,   role: 'Integration',     allocationPercent: 20,  status: 'active', location: person('marco@iosl.internal').location },
    { projectId: p('BW-01'), personId: person('sara@iosl.internal').id,    role: 'Onboarding',      allocationPercent: 40,  status: 'active', location: person('sara@iosl.internal').location },
    { projectId: p('DS'),    personId: person('sara@iosl.internal').id,    role: 'Lead designer',   allocationPercent: 10,  status: 'active', location: person('sara@iosl.internal').location },
    { projectId: p('PO-02'), personId: person('tom@contract.io').id,        role: 'DevOps',          allocationPercent: 0,   status: 'ended',  location: person('tom@contract.io').location },
  ];
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

function seedTimeEntries(assignments: Assignment[]): TimeEntry[] {
  const now = iso();
  const rows: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [];
  const activeAssignments = assignments.filter((a) => a.status === 'active').slice(0, 5);
  for (const a of activeAssignments) {
    for (let d = 1; d <= 5; d++) {
      rows.push({
        assignmentId: a.id,
        date: iso(new Date(Date.now() - d * 86400_000)),
        hours: 6 + (d % 3),
        note: `Day ${d} on project`,
      });
    }
  }
  return rows.map((r) => ({ ...r, id: uuid(), createdAt: now, updatedAt: now }));
}

function seedUsers(currentUser: User): User[] {
  const now = iso();
  return [
    currentUser,
    { id: uuid(), firstName: 'Lena',   lastName: 'Weber',    email: 'lena@iosl.internal',   role: 'manager',  active: true, createdAt: now, updatedAt: now },
    { id: uuid(), firstName: 'Marco',  lastName: 'Rossi',    email: 'marco@iosl.internal',  role: 'employee', active: true, createdAt: now, updatedAt: now },
    { id: uuid(), firstName: 'Sara',   lastName: 'Nguyen',   email: 'sara@iosl.internal',   role: 'employee', active: true, createdAt: now, updatedAt: now },
    { id: uuid(), firstName: 'Jonas',  lastName: 'Meier',    email: 'jonas@iosl.internal',  role: 'manager',  active: true, createdAt: now, updatedAt: now },
    { id: uuid(), firstName: 'Board',  lastName: 'Observer', email: 'board@iosl.internal',  role: 'viewer',   active: true, createdAt: now, updatedAt: now },
  ];
}

function seedWebsites(): Website[] {
  const now = iso();
  const demoName = 'Fahrly Munich';
  const rows: Website[] = [
    {
      id: uuid(),
      name: demoName,
      slug: 'fahrly-munich',
      status: 'published',
      templateId: 'dark-classic',
      locales: ['de', 'en'],
      defaultLocale: 'de',
      content: buildDefaults('dark-classic', demoName),
      createdAt: now,
      updatedAt: now,
    },
  ];
  return rows;
}

import * as extra from './seed-extra';

let seeded = false;
export function seedDb() {
  if (seeded) return;
  db.products = seedProducts();
  db.people = seedPeople();
  db.tasks = seedTasks();
  db.accounts = seedAccounts();
  db.leads = seedLeads();
  db.opportunities = seedOpportunities(db.accounts, db.people);
  db.customers = seedCustomers(db.accounts, db.products);
  db.suppliers = seedSuppliers();
  db.contracts = seedContracts(db.suppliers);
  db.payrollEntries = seedPayroll(db.people);
  db.positions = seedPositions();
  db.candidates = seedCandidates(db.positions);
  db.projects = seedProjects(db.accounts);
  db.assignments = seedAssignments(db.projects, db.people);
  db.timeEntries = seedTimeEntries(db.assignments);
  db.users = seedUsers({ ...db.currentUser, active: true, createdAt: iso(), updatedAt: iso() });

  db.tickets = extra.seedTickets(db.accounts, db.people);
  db.subscriptions = extra.seedSubscriptions(db.customers);
  db.invoices = extra.seedInvoices(db.subscriptions);
  db.features = extra.seedFeatures();
  db.releases = extra.seedReleases();
  db.incidents = extra.seedIncidents();
  db.campaigns = extra.seedCampaigns();
  db.content = extra.seedContent(db.people);
  db.legalDocuments = extra.seedLegal(db.accounts, db.people);
  db.devices = extra.seedDevices(db.people);
  db.softwareLicenses = extra.seedSoftwareLicenses();
  db.objectives = extra.seedObjectives(db.people);
  db.keyResults = extra.seedKeyResults(db.objectives);
  db.docs = extra.seedDocs(db.people);
  db.auditEntries = extra.seedAudit(db.users);
  db.compensationRules = extra.seedCompensationRules(db.people);
  db.compensationEvents = extra.seedCompensationEvents(
    db.compensationRules,
    db.opportunities,
    db.users,
  );

  const persisted = loadPersistedWebsites();
  if (persisted) {
    db.websites = persisted.websites;
    db.websiteSubmissions = persisted.websiteSubmissions;
  } else {
    db.websites = seedWebsites();
  }

  seeded = true;
}
