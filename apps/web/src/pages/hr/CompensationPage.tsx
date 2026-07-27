import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { CompensationStatus } from '@factory/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTableShell } from '@/components/data/DataTableShell';
import { formatCurrencyEUR, formatDate, formatNumber, formatPercent } from '@/lib/format';
import { usePeople } from '@/features/directory/hooks';
import {
  compensationEventHooks,
  compensationRuleHooks,
  useApproveCompensationEvent,
  usePayCompensationEvent,
  useVoidCompensationEvent,
} from '@/features/compensation/hooks';
import {
  COMPENSATION_KIND_LABEL,
  COMPENSATION_STATUS_LABEL,
  COMPENSATION_STATUS_VARIANT,
  COMPENSATION_TRIGGER_LABEL,
} from '@/features/compensation/labels';

const STATUS_FILTERS: (CompensationStatus | 'all')[] = [
  'all',
  'earned',
  'approved',
  'paid',
  'void',
];

function bpsToPercent(bps: number | null): string {
  if (bps == null) return '—';
  return formatPercent(bps / 100, 2);
}

export function CompensationPage() {
  const rules = compensationRuleHooks.useList();
  const events = compensationEventHooks.useList();
  const people = usePeople();

  const approve = useApproveCompensationEvent();
  const pay = usePayCompensationEvent();
  const voidEvent = useVoidCompensationEvent();

  const [status, setStatus] = useState<CompensationStatus | 'all'>('all');

  const personName = useMemo(() => {
    const map = new Map((people.data ?? []).map((p) => [p.id, `${p.firstName} ${p.lastName}`] as const));
    return (id: string) => map.get(id) ?? '—';
  }, [people.data]);

  const filteredEvents = useMemo(() => {
    const all = events.data ?? [];
    return status === 'all' ? all : all.filter((e) => e.status === status);
  }, [events.data, status]);

  // Summary stats
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const earned = (events.data ?? []).filter((e) => e.status === 'earned');
  const approved = (events.data ?? []).filter((e) => e.status === 'approved');
  const paidThisMonth = (events.data ?? []).filter(
    (e) => e.status === 'paid' && e.paidAt?.slice(0, 7) === monthKey,
  );
  const earnedThisMonth = (events.data ?? []).filter(
    (e) => e.earnedAt.slice(0, 7) === monthKey && e.status !== 'void',
  );

  const totalUnpaid =
    earned.reduce((s, e) => s + e.amountCents, 0) + approved.reduce((s, e) => s + e.amountCents, 0);

  const handle = (action: 'approve' | 'pay' | 'void', id: string, label: string) => {
    const m = action === 'approve' ? approve : action === 'pay' ? pay : voidEvent;
    m.mutate(id, {
      onSuccess: () => toast.success(`${label} — done`),
      onError: (err) =>
        toast.error(`Failed to ${action}`, {
          description: err instanceof Error ? err.message : '',
        }),
    });
  };

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Compensation</h1>
        <p className="text-muted-foreground text-sm">
          Rules per person + earned / approved / paid ledger. Sales commissions auto-generate when
          opportunities close won.
        </p>
      </header>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Earned this month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl tabular-nums">
              {formatCurrencyEUR(earnedThisMonth.reduce((s, e) => s + e.amountCents, 0) / 100)}
            </div>
            <p className="text-muted-foreground text-xs">
              {formatNumber(earnedThisMonth.length)} events
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved (owed)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl tabular-nums">
              {formatCurrencyEUR(approved.reduce((s, e) => s + e.amountCents, 0) / 100)}
            </div>
            <p className="text-muted-foreground text-xs">
              {formatNumber(approved.length)} events
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid this month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl tabular-nums">
              {formatCurrencyEUR(paidThisMonth.reduce((s, e) => s + e.amountCents, 0) / 100)}
            </div>
            <p className="text-muted-foreground text-xs">
              {formatNumber(paidThisMonth.length)} events
            </p>
          </CardContent>
        </Card>
        <Card className="border-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unpaid liability</CardTitle>
            <CardDescription>Earned + approved, not yet paid</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl tabular-nums">
              {formatCurrencyEUR(totalUnpaid / 100)}
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="mb-8">
        <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
          Rules
        </h2>
        <DataTableShell {...rules} emptyMessage="No compensation rules yet.">
          {(rows) => (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Person</TableHead>
                    <TableHead>Kind</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Computation</TableHead>
                    <TableHead className="text-right">Rate / Amount</TableHead>
                    <TableHead className="text-right">Effective</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{personName(r.personId)}</TableCell>
                      <TableCell>{COMPENSATION_KIND_LABEL[r.kind]}</TableCell>
                      <TableCell>{COMPENSATION_TRIGGER_LABEL[r.triggerType]}</TableCell>
                      <TableCell className="capitalize">
                        {r.computation === 'percentage_of_source' ? '% of source' : 'Fixed'}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {r.computation === 'percentage_of_source'
                          ? bpsToPercent(r.percentageBps)
                          : r.fixedAmountCents != null
                            ? formatCurrencyEUR(r.fixedAmountCents / 100)
                            : '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatDate(r.effectiveFrom)}
                        {r.effectiveTo ? ` → ${formatDate(r.effectiveTo)}` : ''}
                      </TableCell>
                      <TableCell>
                        <Badge variant={r.active ? 'default' : 'outline'}>
                          {r.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DataTableShell>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
            Events
          </h2>
          <Select value={status} onValueChange={(v) => setStatus(v as CompensationStatus | 'all')}>
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === 'all' ? 'All statuses' : COMPENSATION_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DataTableShell
          isLoading={events.isLoading}
          isError={events.isError}
          error={events.error}
          data={filteredEvents}
          emptyMessage="No events match this filter."
        >
          {(rows) => (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Person</TableHead>
                    <TableHead>Kind</TableHead>
                    <TableHead>Source / note</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Earned</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{personName(e.personId)}</TableCell>
                      <TableCell>{COMPENSATION_KIND_LABEL[e.kind]}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[260px] truncate">
                        {e.note}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatCurrencyEUR(e.amountCents / 100)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatDate(e.earnedAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={COMPENSATION_STATUS_VARIANT[e.status]}>
                          {COMPENSATION_STATUS_LABEL[e.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {e.status === 'earned' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handle('approve', e.id, 'Approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handle('void', e.id, 'Voided')}
                            >
                              Void
                            </Button>
                          </>
                        )}
                        {e.status === 'approved' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handle('pay', e.id, 'Marked paid')}
                            >
                              Mark paid
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handle('void', e.id, 'Voided')}
                            >
                              Void
                            </Button>
                          </>
                        )}
                        {(e.status === 'paid' || e.status === 'void') && (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DataTableShell>
      </section>
    </main>
  );
}
