import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckSquare, Circle, Clock } from 'lucide-react';
import type { OpportunityStage } from '@factory/shared';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrencyEUR, formatDate, formatNumber, formatRelative } from '@/lib/format';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { accountHooks } from '@/features/crm/accounts/hooks';
import { opportunityHooks } from '@/features/crm/opportunities/hooks';
import { STAGE_LABEL, STAGE_VARIANT } from '@/features/crm/opportunities/stage';
import { useTasks, useUpdateTask } from '@/features/tasks/hooks/use-tasks';

const OPEN_STAGES: OpportunityStage[] = ['qualified', 'trial', 'decision'];

function TaskCheckbox({ id, status }: { id: string; status: string }) {
  const update = useUpdateTask(id);
  const done = status === 'done';
  return (
    <button
      type="button"
      onClick={() => update.mutate({ status: done ? 'open' : 'done' })}
      disabled={update.isPending}
      aria-label={done ? 'Mark open' : 'Mark done'}
      className="text-muted-foreground hover:text-foreground"
    >
      {done ? <CheckSquare className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
    </button>
  );
}

function TaskLinkBadge({
  task,
}: {
  task: { relatedType: string | null; relatedId: string | null };
}) {
  const accounts = accountHooks.useList();
  const opps = opportunityHooks.useList();
  if (!task.relatedType || !task.relatedId) return null;
  if (task.relatedType === 'account') {
    const account = (accounts.data ?? []).find((a) => a.id === task.relatedId);
    if (!account) return null;
    return (
      <Link
        to={`/crm/accounts/${account.id}`}
        className="shrink-0 text-xs text-muted-foreground hover:text-foreground hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {account.name}
      </Link>
    );
  }
  if (task.relatedType === 'opportunity') {
    const opp = (opps.data ?? []).find((o) => o.id === task.relatedId);
    if (!opp) return null;
    return (
      <Link
        to={`/crm/opportunities/${opp.id}`}
        className="shrink-0 text-xs text-muted-foreground hover:text-foreground hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {opp.name}
      </Link>
    );
  }
  return null;
}

function MyTasksCard({ userId }: { userId: string }) {
  const tasks = useTasks({ assigneeId: userId });
  const items = (tasks.data ?? []).filter((t) => t.status !== 'done').slice(0, 6);
  const doneCount = (tasks.data ?? []).filter((t) => t.status === 'done').length;

  return (
    <Card className="md:col-span-2">
      <CardHeader className="pb-3 flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-sm">My open tasks</CardTitle>
          <CardDescription>
            {items.length} open · {doneCount} done
          </CardDescription>
        </div>
        <Link to="/tasks" className="text-xs text-muted-foreground hover:text-foreground">
          All tasks →
        </Link>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing on your plate. Nice.</p>
        ) : (
          <ul className="divide-y">
            {items.map((t) => {
              const overdue = t.dueAt && new Date(t.dueAt).getTime() < Date.now();
              return (
                <li key={t.id} className="flex items-center gap-3 py-2 text-sm">
                  <TaskCheckbox id={t.id} status={t.status} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{t.title}</div>
                    {t.dueAt && (
                      <div
                        className={
                          'text-xs ' + (overdue ? 'text-destructive' : 'text-muted-foreground')
                        }
                      >
                        <Clock className="mr-0.5 inline h-3 w-3" />
                        <span className="font-mono tabular-nums" title={t.dueAt}>
                          Due {formatDate(t.dueAt)} · {formatRelative(t.dueAt)}
                        </span>
                      </div>
                    )}
                  </div>
                  <TaskLinkBadge task={t} />
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function CrmDashboardPage() {
  const { data: user } = useCurrentUser();
  const opportunities = opportunityHooks.useList();
  const accounts = accountHooks.useList();

  const openOpps = useMemo(
    () => (opportunities.data ?? []).filter((o) => OPEN_STAGES.includes(o.stage)),
    [opportunities.data],
  );
  const openPipelineCents = openOpps.reduce((s, o) => s + o.amountCents, 0);
  const closeWonCount = (opportunities.data ?? []).filter((o) => o.stage === 'close_won').length;

  const proposalOpps = useMemo(
    () =>
      (opportunities.data ?? [])
        .filter((o) => o.stage === 'proposal')
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    [opportunities.data],
  );
  const proposalWaitingCount = proposalOpps.filter((o) => !o.contractSigned).length;

  const closingSoon = useMemo(
    () =>
      openOpps
        .slice()
        .sort((a, b) => (a.expectedCloseDate < b.expectedCloseDate ? -1 : 1))
        .slice(0, 8),
    [openOpps],
  );

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">CRM</h1>
        <p className="text-muted-foreground text-sm">
          {user ? `Your open work + the shape of the pipeline, ${user.firstName}.` : 'Your open work + the shape of the pipeline.'}
        </p>
      </header>

      {/* Top stats */}
      <section className="mb-8">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Open opportunities"
            value={formatNumber(openOpps.length)}
            hint="Qualified · Trial · Decision"
            to="/crm/opportunities"
          />
          <StatCard
            label="Open pipeline"
            value={formatCurrencyEUR(openPipelineCents / 100)}
            hint="Sum of open amounts"
            to="/crm/opportunities"
          />
          <StatCard
            label="Awaiting close"
            value={formatNumber(proposalOpps.length)}
            hint={`${proposalWaitingCount} unsigned or unpaid`}
            to="/crm/opportunities"
          />
          <StatCard
            label="Close Won this cycle"
            value={formatNumber(closeWonCount)}
            hint="Total won opportunities"
            to="/crm/opportunities"
          />
        </div>
      </section>

      {/* My work */}
      <section className="mb-8">
        <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
          My work
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {user && <MyTasksCard userId={user.id} />}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Awaiting close</CardTitle>
              <CardDescription>Proposals with a live payment link</CardDescription>
            </CardHeader>
            <CardContent>
              {proposalOpps.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing in Proposal.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {proposalOpps.slice(0, 6).map((o) => (
                    <li key={o.id} className="flex items-center justify-between gap-2">
                      <Link
                        to={`/crm/opportunities/${o.id}`}
                        className="truncate hover:underline"
                      >
                        {o.name}
                      </Link>
                      <Badge
                        variant={o.contractSigned ? 'default' : 'outline'}
                        className="text-[10px]"
                      >
                        {o.contractSigned ? 'Signed' : 'Unsigned'}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Closing soon */}
      <section className="mb-8">
        <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
          Closing soon
        </h2>
        <Card>
          <CardContent className="p-0">
            {closingSoon.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No open opportunities.</p>
            ) : (
              <ul className="divide-y">
                {closingSoon.map((o) => {
                  const acc = (accounts.data ?? []).find((a) => a.id === o.accountId);
                  const overdue = new Date(o.expectedCloseDate).getTime() < Date.now();
                  return (
                    <li
                      key={o.id}
                      className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-3 px-3 py-2 text-sm"
                    >
                      <Link
                        to={`/crm/opportunities/${o.id}`}
                        className="truncate font-medium hover:underline"
                      >
                        {o.name}
                      </Link>
                      <span className="truncate text-muted-foreground">{acc?.name ?? '—'}</span>
                      <Badge variant={STAGE_VARIANT[o.stage]}>{STAGE_LABEL[o.stage]}</Badge>
                      <div
                        className={
                          'text-right font-mono tabular-nums ' +
                          (overdue ? 'text-destructive' : 'text-muted-foreground')
                        }
                        title={o.expectedCloseDate}
                      >
                        {overdue && <AlertCircle className="mr-1 inline h-3 w-3" />}
                        {formatDate(o.expectedCloseDate)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function StatCard({
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
