import { Link } from 'react-router-dom';
import type { CandidateStage, OpportunityStage } from '@factory/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrencyEUR, formatNumber } from '@/lib/format';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { opportunityHooks } from '@/features/crm/opportunities/hooks';
import { candidateHooks, positionHooks } from '@/features/recruiting/hooks';
import { useCostSummary, useRevenueSummary } from '@/features/finance/hooks';
import { assignmentHooks, projectHooks } from '@/features/projects/hooks';
import { usePeople } from '@/features/directory/hooks';
import { compensationEventHooks } from '@/features/compensation/hooks';

function Stat({
  label,
  value,
  hint,
  to,
}: {
  label: string;
  value: string;
  hint?: string;
  to: string;
}) {
  return (
    <Link to={to} className="block h-full">
      <Card className="flex h-full flex-col transition-colors hover:bg-accent/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{label}</CardTitle>
          <CardDescription className="min-h-[1rem]">{hint ?? '\u00A0'}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto">
          <div className="font-mono text-2xl tabular-nums">{value}</div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function HomePage() {
  const { data: user } = useCurrentUser();
  const revenue = useRevenueSummary();
  const costs = useCostSummary();
  const opportunities = opportunityHooks.useList();
  const positions = positionHooks.useList();
  const candidates = candidateHooks.useList();
  const projects = projectHooks.useList();
  const assignments = assignmentHooks.useList();
  const people = usePeople();
  const compEvents = compensationEventHooks.useList();

  const openOppStages: OpportunityStage[] = ['qualified', 'trial', 'decision'];
  const openOpps = (opportunities.data ?? []).filter((o) => openOppStages.includes(o.stage));
  const pipelineCents = openOpps.reduce((n, o) => n + o.amountCents, 0);

  const openPositions = (positions.data ?? []).filter((p) => p.status === 'open');
  const openPositionsCount = openPositions.reduce((n, p) => n + p.openings, 0);

  const activeCandidateStages: CandidateStage[] = ['applied', 'screen', 'interview', 'offer'];
  const activeCandidates = (candidates.data ?? []).filter((c) =>
    activeCandidateStages.includes(c.stage),
  );

  const activeProjects = (projects.data ?? []).filter((p) => p.status === 'active');
  const activeAssignments = (assignments.data ?? []).filter((a) => a.status === 'active');
  const headcount = (people.data ?? []).filter((p) => p.type !== 'candidate').length;

  const mrrCents = revenue.data?.mrrCents ?? 0;
  const monthlyCostCents = costs.data?.monthlyCents ?? 0;
  const netCents = mrrCents - monthlyCostCents;

  const unpaidCompCents = (compEvents.data ?? [])
    .filter((e) => e.status === 'earned' || e.status === 'approved')
    .reduce((s, e) => s + e.amountCents, 0);

  const isLoading =
    revenue.isLoading ||
    costs.isLoading ||
    opportunities.isLoading ||
    positions.isLoading ||
    candidates.isLoading ||
    projects.isLoading ||
    assignments.isLoading ||
    people.isLoading;

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

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="space-y-8">
          <section>
            <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
              Finance
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Stat label="MRR" value={formatCurrencyEUR(mrrCents / 100)} hint="Monthly recurring" to="/finance/revenue" />
              <Stat
                label="Monthly cost"
                value={formatCurrencyEUR(monthlyCostCents / 100)}
                hint="Supplier + payroll"
                to="/finance/costs"
              />
              <Stat
                label="Net monthly"
                value={formatCurrencyEUR(netCents / 100)}
                hint="MRR − cost"
                to="/bi/costs"
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
                value={formatNumber(openOpps.length)}
                hint="Qualified · Trial · Decision"
                to="/crm/opportunities"
              />
              <Stat
                label="Open pipeline"
                value={formatCurrencyEUR(pipelineCents / 100)}
                hint="Weighted by amount"
                to="/crm/opportunities"
              />
              <Stat
                label="Active customers"
                value={formatNumber(revenue.data?.activeCustomers ?? 0)}
                to="/crm/customers"
              />
            </div>
          </section>

          <section>
            <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
              People
            </h2>
            <div className="grid gap-4 md:grid-cols-4">
              <Stat label="Headcount" value={formatNumber(headcount)} hint="Employees + freelancers" to="/hr/employees" />
              <Stat label="Open positions" value={formatNumber(openPositionsCount)} to="/recruiting/positions" />
              <Stat label="Candidates in pipeline" value={formatNumber(activeCandidates.length)} to="/recruiting/candidates" />
              <Stat
                label="Unpaid commissions"
                value={formatCurrencyEUR(unpaidCompCents / 100)}
                hint="Earned + approved, not paid"
                to="/hr/compensation"
              />
            </div>
          </section>

          <section>
            <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
              Delivery
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Stat label="Active projects" value={formatNumber(activeProjects.length)} to="/projects" />
              <Stat
                label="Active assignments"
                value={formatNumber(activeAssignments.length)}
                hint="People allocated to projects"
                to="/projects"
              />
              <Stat
                label="Line-item costs"
                value={formatNumber(costs.data?.items.length ?? 0)}
                hint="Active contracts + monthly payroll"
                to="/bi/costs"
              />
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
