# IOSL.v1 Frontend Constitution

Scope: everything in `apps/web/`. Read `../../CLAUDE.md` first for repository-wide rules.

## What This App Is

IOSL is the internal operating system for the software company — a single React SPA over a mocked API. It groups seven business modules plus Settings:

- **CRM** — Leads, Accounts, Opportunities (stages: Qualified → Trial → Decision → Close Won → Close Lost), Customers
- **Finance** — Revenue, Costs (costs are consumed from Suppliers + HR/Payroll, never entered manually here)
- **Supplier Management** — Suppliers, Contracts; emits cost rows into the shared store
- **HR** — Employees, Freelancers, Payroll; emits cost rows into the shared store
- **Recruiting** — Positions, Candidates (stages: Applied → Screen → Interview → Offer → Hired → Rejected)
- **Project Management** — Projects, Assignments (person → project), Time entries
- **Business Intelligence** — Read-only aggregates via dedicated `/api/bi/*` endpoints
- **Settings** — General, Users, Roles (module gating)

The FE is a thin React UI over the API. Its only jobs:

- Render data
- Submit user actions
- Show feedback

It contains no business logic, no calculations beyond display formatting, and no direct integrations. **Currently the backend does not exist** — every endpoint is served by MSW handlers in `src/mocks/`. This is a deliberate FE-only phase. Do not add a real backend without explicit approval.

## Stack

- React 18
- Vite
- TypeScript (strict)
- Tailwind CSS
- shadcn/ui (components copied into `src/components/ui/`)
- TanStack Query (server state)
- TanStack Table (data grids)
- React Hook Form + Zod (forms)
- React Router (routing)

Nothing else without approval.

## Folder Structure

```
apps/web/src/
├── main.tsx
├── App.tsx
├── pages/                     ← Route entries. One file per route.
├── features/                  ← Domain compositions
│   ├── auth/                  ← Current-user + role hooks
│   └── <module>/
│       └── <domain>/
│           ├── components/    ← Domain-specific UI
│           ├── hooks/         ← Query + mutation hooks
│           └── lib/           ← Domain-specific helpers
├── components/
│   ├── ui/                    ← shadcn primitives. IMMUTABLE.
│   └── layout/                ← Shell, sidebar, topbar, breadcrumbs, nav-config
├── lib/
│   ├── api-client.ts          ← Single HTTP client
│   ├── query-client.ts        ← TanStack Query config
│   ├── format.ts              ← All number/date/duration formatters
│   └── utils.ts               ← cn()
├── mocks/                     ← MSW — dev only, gated by import.meta.env.DEV
│   ├── db.ts                  ← Shared in-memory store (single source across handlers)
│   ├── seed.ts                ← Seed data on worker start
│   ├── browser.ts             ← Worker init
│   └── handlers/              ← One file per resource
├── styles/
│   └── globals.css            ← Tailwind directives + tokens
└── types/                     ← UI-only types (never domain types)
```

## Modules and Routes

Each module lives at a top-level path with sub-modules underneath, mirrored by `src/features/<module>/`:

```
/               → executive dashboard
/crm/{leads,accounts,opportunities,customers}
/finance/{revenue,costs}
/suppliers, /suppliers/contracts
/hr/{employees,freelancers,payroll}
/recruiting/{positions,candidates}
/projects, /projects/time
/bi/{customers,revenue,usage,costs}
/settings, /settings/{users,roles}
```

Sidebar groups and role visibility are declared in `src/components/layout/nav-config.ts` and `@factory/shared` (`MODULE_ACCESS`). To add a route:

1. Add the domain to `@factory/shared` if it introduces new types
2. Add MSW handlers under `src/mocks/handlers/`
3. Add hooks under `src/features/<module>/<domain>/hooks/`
4. Add components under `src/features/<module>/<domain>/components/`
5. Add a `pages/<Module><Domain>Page.tsx` and register the `<Route>` in `App.tsx`
6. Add the entry to `nav-config.ts` if it should show in the sidebar

## Roles and Access

Roles (defined in `@factory/shared`): `admin`, `manager`, `employee`, `viewer`.

- Sidebar filters modules via `canAccess(role, moduleKey)`.
- Role is served by `GET /api/me` and mutated by `PATCH /api/me/role` (dev-only role switcher lives in the Topbar).
- Do NOT hard-code role checks inside components. Always route via `useCurrentUser()` + `canAccess`.

## Shared MSW Store

- All handlers read and write from `src/mocks/db.ts`.
- Modules that emit derived data (Supplier contracts → costs; Payroll → costs) push into the shared store so consumer modules (Finance, BI) see consistent numbers.
- Seed happens once in `mocks/browser.ts` before the worker starts.
- Never create a per-handler in-memory store. If you feel tempted, add a table to `db.ts` instead.

## The Closed UI Vocabulary

The only allowed primitives are shadcn components already installed in `src/components/ui/`:

- **Layout:** Card, Separator, Sheet, Tabs, Dialog, Accordion
- **Input:** Button, Input, Select, Checkbox, Switch, Textarea, Form, Calendar, DatePicker
- **Data:** Table, Badge, Avatar, Tooltip
- **Feedback:** Toast, Alert, Skeleton, Progress

To build a screen: assemble from the above. To add a new primitive: stop and ask Anh. Do not invent. Do not install new libraries. Files in `src/components/ui/` are immutable. Never edit them.

## The Three-Layer Composition Rule

Every screen is built in exactly three layers:

1. **Page** (`src/pages/`) — route entry. Owns the URL, fetches data via TanStack Query hooks, passes data down. No UI logic beyond layout.
2. **Feature** (`src/features/<domain>/components/`) — domain-specific composition like DriverTable, DriverForm. Assembles primitives. Owns interaction.
3. **Primitive** (`src/components/ui/`) — shadcn. Never modified.

Business logic lives in hooks (`src/features/<domain>/hooks/`), never in components.

## Data Fetching

- TanStack Query for all server state. No `useEffect(fetch)`. No SWR. No raw `fetch` in components.
- One query hook per endpoint, in `src/features/<domain>/hooks/`.
- Mutation hooks colocated with queries.
- All request/response types imported from `@factory/shared`. Never redeclared.
- Query keys follow the pattern: `[domain, action, ...params]` (e.g. `['drivers', 'list', { status: 'active' }]`).

Example pattern:

```ts
export function useDrivers(filters: DriverFilters) {
  return useQuery({
    queryKey: ['drivers', 'list', filters],
    queryFn: () => api.drivers.list(filters),
  });
}
```

## Forms

- React Hook Form + Zod resolver.
- Zod schema imported from `@factory/shared`. Never redeclared in the FE.
- One form component per feature. Reuses shadcn `Form` primitive.

## Styling

- Tailwind utility classes only.
- No inline `style={{}}` except for truly dynamic values (e.g. computed width).
- No CSS files except `globals.css`.
- Design tokens (colors, spacing, radius) live in `tailwind.config.ts`. Never hardcoded.
- No `!important`. Ever.

## Numbers, Units, and Typography

Applies everywhere: cards, tables, forms, tooltips, empty states. Non-negotiable.

**1. European format for values with units — always `<number><space><unit>`, in that order:**

| Kind        | Correct              | Wrong               |
|-------------|----------------------|---------------------|
| Duration    | `1 h 5 min 20 s`     | `1h 5m 20s`         |
| Percentage  | `95 %`               | `95%`               |
| Currency    | `100,00 €`           | `€100`, `100€`      |
| Size        | `250 MB`, `12 kg`    | `250MB`, `12kg`     |
| Distance    | `1.5 km`             | `1.5km`             |

**2. European numeric conventions:** `.` as thousands separator, `,` as decimal separator (`1.234,56`). Dates format `DD.MM.YYYY`; datetimes `DD.MM.YYYY HH:mm`.

**3. Font:** every rendered number uses **JetBrains Mono** — apply the Tailwind classes `font-mono tabular-nums` on any element whose text is (or contains) a number. This includes counts, durations, currency, percentages, IDs, timestamps.

**4. Where formatting lives:** all number/date/duration formatting goes through `src/lib/format.ts` — `formatNumber`, `formatDecimal`, `formatWithUnit`, `formatPercent`, `formatCurrencyEUR`, `formatDuration`, `formatDate`, `formatDateTime`. Never call `.toLocaleString()`, `.toFixed()`, or hand-build a formatted string in a component. If a new format is needed, add it to `src/lib/format.ts` and reuse.

**5. Table columns of numbers:** right-aligned (`text-right`) plus `font-mono tabular-nums`. Non-negotiable — column reading is impossible otherwise.

**6. Compact numbers ≥ 1 000** — `formatNumber` and `formatCurrencyEUR` use lowercase suffixes (`k` · `m` · `b` · `t`) glued to the number. `150.000 €` → `150k €`. `1.500.000` → `1,5m`. `1.500 €` → `1,5k €`. `999` → `999`. Percentages, decimals, durations, and dates are NOT compacted. If a screen genuinely needs full precision (invoices, payslips, ledgers), use `formatNumberFull` / `formatCurrencyEURFull` instead — but the default everywhere is compact.

## State Management

- **Server state:** TanStack Query.
- **URL state:** React Router params/search params (filters, pagination, tabs).
- **Local UI state:** `useState`, `useReducer`.
- **Global client state:** none by default. If needed, justify in writing before adding Zustand.

Never use Redux, MobX, Recoil, Jotai.

## Forbidden in FE

- Direct `fetch`/`axios` outside of a TanStack Query hook
- New UI libraries (MUI, Ant Design, Chakra, Mantine, etc.)
- CSS-in-JS (styled-components, Emotion)
- Editing files in `src/components/ui/`
- Business logic in components (move it to hooks)
- Calculations beyond display formatting (the BE computes; the FE shows)
- `any`, `as unknown as`, `@ts-ignore`
- Hardcoded design tokens
- Local types that duplicate `@factory/shared`
- Inline number formatting (`.toLocaleString()`, `.toFixed()`, template strings that glue value+unit) — always route through `src/lib/format.ts`
- Numbers rendered without `font-mono tabular-nums`
- Unit written stuck to the number: `20s`, `95%`, `€100` — always `20 s`, `95 %`, `100,00 €`

## How Claude Builds a Feature in FE

Given a backend endpoint, the build is mechanical:

1. **Import the type** from `@factory/shared`.
2. **Add the query hook** in `src/features/<domain>/hooks/`.
3. **Build the feature component** in `src/features/<domain>/components/` using only shadcn primitives.
4. **Wire into a page** in `src/pages/`.
5. **Verify** `pnpm typecheck && pnpm lint && pnpm build`.

No new components in `ui/`. No new dependencies. No business logic.

If the BE endpoint doesn't exist yet, stop. Build the BE first.
