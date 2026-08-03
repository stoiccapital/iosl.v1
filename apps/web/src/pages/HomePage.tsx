import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  formatCurrencyEUR,
  formatNumber,
  formatPercent,
  formatWithUnit,
} from '@/lib/format';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useDashboard } from '@/features/bi/hooks';

const EMPTY = '—';

/**
 * Every metric on the dashboard is either:
 *   - a real measurement (rendered as a formatted number), OR
 *   - not-computable (rendered as em-dash — never 0)
 *
 * `favorable` encodes which direction is good. It's silent today (no delta
 * indicator is shown) but the wiring is here so a future MoM delta card
 * colors down-is-green for churn/cost and up-is-green for MRR/NRR/etc.
 */
function Stat({
  label,
  value,
  hint,
  to,
  favorable = 'up',
}: {
  label: string;
  value: string | null;
  hint?: string;
  to: string;
  favorable?: 'up' | 'down';
}) {
  const display = value ?? EMPTY;
  const isEmpty = value === null;
  return (
    <Link
      to={to}
      className="block h-full"
      data-favorable={favorable}
      aria-label={`${label}: ${isEmpty ? 'no data' : display}`}
    >
      <Card className="flex h-full flex-col transition-colors hover:bg-accent/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{label}</CardTitle>
          <CardDescription className="min-h-[1rem]">{hint ?? '\u00A0'}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto">
          <div
            className={`font-mono text-2xl tabular-nums ${isEmpty ? 'text-muted-foreground' : ''}`}
          >
            {display}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function currencyOrEmpty(cents: number | null): string | null {
  return cents === null ? null : formatCurrencyEUR(cents / 100);
}

function percentFromBps(bps: number | null, fractionDigits = 1): string | null {
  return bps === null ? null : formatPercent(bps / 100, fractionDigits);
}

function monthsOrLabel(months: number | null, infinite: boolean): string | null {
  if (infinite) return '∞';
  if (months === null) return null;
  return formatWithUnit(months, 'mo', 1);
}

export function HomePage() {
  const { data: user } = useCurrentUser();
  const dashboard = useDashboard();
  const d = dashboard.data;

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {user ? `Hi, ${user.firstName}.` : 'Welcome.'}
        </h1>
        <p className="text-muted-foreground text-sm">
          Snapshot of every module. Click a card to jump in.
        </p>
      </header>

      {dashboard.isLoading && (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      )}

      {d && (
        <div className="space-y-8">
          <section>
            <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
              Finance
            </h2>
            <div className="grid gap-4 md:grid-cols-4">
              <Stat
                label="MRR"
                value={currencyOrEmpty(d.finance.mrrCents)}
                hint="Monthly recurring"
                to="/finance/revenue"
                favorable="up"
              />
              <Stat
                label="Monthly cost"
                value={currencyOrEmpty(d.finance.monthlyCostCents)}
                hint="Supplier + payroll + comp"
                to="/finance/costs"
                favorable="down"
              />
              <Stat
                label="Net monthly"
                value={
                  d.finance.netMonthlyCents === null
                    ? null
                    : formatCurrencyEUR(d.finance.netMonthlyCents / 100)
                }
                hint="MRR − cost"
                to="/bi/costs"
                favorable="up"
              />
              <Stat
                label="Runway"
                value={monthsOrLabel(d.finance.runwayMonths, d.finance.runwayInfinite)}
                hint={d.finance.runwayInfinite ? 'Cash-positive' : 'Cash ÷ burn'}
                to="/bi/costs"
                favorable="up"
              />
            </div>
          </section>

          <section>
            <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
              Sales
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Stat
                label="Open opportunities"
                value={formatNumber(d.sales.openOppsCount)}
                hint="Qualified · Trial · Decision · Proposal"
                to="/crm/opportunities"
                favorable="up"
              />
              <Stat
                label="Open pipeline"
                value={currencyOrEmpty(d.sales.openPipelineWeightedCents)}
                hint="Probability-weighted"
                to="/crm/opportunities"
                favorable="up"
              />
              <Stat
                label="Active customers"
                value={formatNumber(d.sales.activeCustomersCount)}
                to="/crm/customers"
                favorable="up"
              />
              <Stat
                label="NRR (6 mo)"
                value={percentFromBps(d.sales.nrrBps)}
                hint="Starting cohort"
                to="/bi/revenue"
                favorable="up"
              />
              <Stat
                label="GRR (6 mo)"
                value={percentFromBps(d.sales.grrBps)}
                hint="Starting cohort, ex-expansion"
                to="/bi/revenue"
                favorable="up"
              />
              <Stat
                label="ARPA"
                value={currencyOrEmpty(d.sales.arpaCents)}
                hint="MRR ÷ active customers"
                to="/crm/customers"
                favorable="up"
              />
              <Stat
                label={`Churned MRR (${d.windowDays} d)`}
                value={formatCurrencyEUR(d.retention.churnedMrrCents / 100)}
                hint={`${formatNumber(d.retention.voluntaryChurnLogos)} voluntary · ${formatNumber(d.retention.involuntaryChurnLogos)} involuntary`}
                to="/crm/churn"
                favorable="down"
              />
            </div>
          </section>

          <section>
            <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
              People
            </h2>
            <div className="grid gap-4 md:grid-cols-5">
              <Stat
                label="Headcount"
                value={formatNumber(d.people.headcount)}
                hint="Employees + freelancers"
                to="/hr/employees"
                favorable="up"
              />
              <Stat
                label="Open positions"
                value={formatNumber(d.people.openPositionsCount)}
                to="/recruiting/positions"
                favorable="up"
              />
              <Stat
                label="Candidates in pipeline"
                value={formatNumber(d.people.activeCandidatesCount)}
                to="/recruiting/candidates"
                favorable="up"
              />
              <Stat
                label="Unpaid commissions"
                value={formatCurrencyEUR(d.people.unpaidCommissionCents / 100)}
                hint="Earned + approved, not paid"
                to="/hr/compensation"
                favorable="down"
              />
              <Stat
                label="Revenue per employee"
                value={currencyOrEmpty(d.people.revenuePerEmployeeCents)}
                hint="ARR ÷ headcount"
                to="/hr/employees"
                favorable="up"
              />
            </div>
          </section>

          <section>
            <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
              Delivery
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Stat
                label="Active projects"
                value={formatNumber(d.delivery.activeProjectsCount)}
                to="/projects"
                favorable="up"
              />
              <Stat
                label="Active assignments"
                value={formatNumber(d.delivery.activeAssignmentsCount)}
                hint="People allocated to projects"
                to="/projects"
                favorable="up"
              />
              <Stat
                label="Line-item costs"
                value={formatNumber(d.delivery.costItemsCount)}
                hint="Active contracts + monthly payroll"
                to="/bi/costs"
                favorable="up"
              />
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
