import type {
  Account,
  AccountContact,
  AccountContactNote,
  AccountNote,
  Assignment,
  AuditEntry,
  Campaign,
  Candidate,
  CompensationEvent,
  CompensationRule,
  ContentPiece,
  Contract,
  CurrentUser,
  Customer,
  Device,
  Doc,
  Expense,
  Feature,
  Incident,
  Invoice,
  KeyResult,
  Lead,
  LegalDocument,
  Objective,
  Opportunity,
  PayrollEntry,
  Person,
  Position,
  Product,
  Project,
  Release,
  SoftwareLicense,
  Subscription,
  SubscriptionTransition,
  Supplier,
  Task,
  Ticket,
  TimeEntry,
  User,
  Website,
  WebsiteSubmission,
} from '@factory/shared';

/**
 * Shared in-memory store for MSW handlers. All modules read/write from here
 * so cross-module views (e.g. Finance/Costs pulling Supplier + Payroll rows)
 * see consistent data.
 *
 * Reset on hard reload.
 */
export type Db = {
  currentUser: CurrentUser;
  cashBalanceCents: number;
  users: User[];
  people: Person[];
  products: Product[];
  tasks: Task[];
  leads: Lead[];
  accounts: Account[];
  accountNotes: AccountNote[];
  accountContacts: AccountContact[];
  accountContactNotes: AccountContactNote[];
  opportunities: Opportunity[];
  customers: Customer[];
  suppliers: Supplier[];
  contracts: Contract[];
  payrollEntries: PayrollEntry[];
  positions: Position[];
  candidates: Candidate[];
  projects: Project[];
  assignments: Assignment[];
  timeEntries: TimeEntry[];
  tickets: Ticket[];
  subscriptions: Subscription[];
  subscriptionTransitions: SubscriptionTransition[];
  invoices: Invoice[];
  expenses: Expense[];
  features: Feature[];
  releases: Release[];
  incidents: Incident[];
  campaigns: Campaign[];
  content: ContentPiece[];
  legalDocuments: LegalDocument[];
  devices: Device[];
  softwareLicenses: SoftwareLicense[];
  objectives: Objective[];
  keyResults: KeyResult[];
  docs: Doc[];
  auditEntries: AuditEntry[];
  compensationRules: CompensationRule[];
  compensationEvents: CompensationEvent[];
  websites: Website[];
  websiteSubmissions: WebsiteSubmission[];
};

export const db: Db = {
  currentUser: {
    id: crypto.randomUUID(),
    firstName: 'Anh',
    lastName: 'Chu',
    email: 'anh@iosl.internal',
    role: 'admin',
  },
  cashBalanceCents: 2_400_000_00,
  users: [],
  people: [],
  products: [],
  tasks: [],
  leads: [],
  accounts: [],
  accountNotes: [],
  accountContacts: [],
  accountContactNotes: [],
  opportunities: [],
  customers: [],
  suppliers: [],
  contracts: [],
  payrollEntries: [],
  positions: [],
  candidates: [],
  projects: [],
  assignments: [],
  timeEntries: [],
  tickets: [],
  subscriptions: [],
  subscriptionTransitions: [],
  invoices: [],
  expenses: [],
  features: [],
  releases: [],
  incidents: [],
  campaigns: [],
  content: [],
  legalDocuments: [],
  devices: [],
  softwareLicenses: [],
  objectives: [],
  keyResults: [],
  docs: [],
  auditEntries: [],
  compensationRules: [],
  compensationEvents: [],
  websites: [],
  websiteSubmissions: [],
};
