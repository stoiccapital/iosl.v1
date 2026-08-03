import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTableShell } from '@/components/data/DataTableShell';
import { formatCurrencyEUR, formatDate, formatNumber } from '@/lib/format';
import { accountHooks } from '@/features/crm/accounts/hooks';
import { customerHooks } from '@/features/crm/customers/hooks';
import { invoiceHooks, subscriptionHooks } from '@/features/billing/hooks';
import { ticketHooks } from '@/features/support/hooks';

type AccountHealth = {
  accountId: string;
  accountName: string;
  mrrCents: number;
  since: string;
  productCount: number;
  openTickets: number;
  overdueInvoices: number;
  score: number;
  status: 'green' | 'yellow' | 'red';
};

function scoreAccount(input: {
  activeMrr: number;
  openTickets: number;
  overdue: number;
  ageDays: number;
}): { score: number; status: AccountHealth['status'] } {
  let s = 80;
  s -= input.openTickets * 8;
  s -= input.overdue * 20;
  if (input.ageDays > 365) s += 10;
  if (input.activeMrr === 0) s -= 40;
  s = Math.max(0, Math.min(100, s));
  const status: AccountHealth['status'] = s >= 70 ? 'green' : s >= 45 ? 'yellow' : 'red';
  return { score: s, status };
}

const STATUS_VARIANT: Record<AccountHealth['status'], 'default' | 'secondary' | 'destructive'> = {
  green: 'default',
  yellow: 'secondary',
  red: 'destructive',
};

const STATUS_LABEL: Record<AccountHealth['status'], string> = {
  green: 'Healthy',
  yellow: 'Watch',
  red: 'At risk',
};

export function CustomerSuccessPage() {
  const accounts = accountHooks.useList();
  const customers = customerHooks.useList();
  const subs = subscriptionHooks.useList();
  const invoices = invoiceHooks.useList();
  const tickets = ticketHooks.useList();

  const health = useMemo<AccountHealth[]>(() => {
    const rows: AccountHealth[] = [];
    const now = Date.now();
    for (const a of accounts.data ?? []) {
      const cust = (customers.data ?? []).filter((c) => c.accountId === a.id);
      if (cust.length === 0) continue;
      const activeMrr = cust.filter((c) => c.active).reduce((n, c) => n + c.mrrCents, 0);
      const oldestSince = cust.reduce((min, c) => (c.since < min ? c.since : min), cust[0]!.since);
      const ageDays = Math.floor((now - new Date(oldestSince).getTime()) / 86400_000);
      const openTickets = (tickets.data ?? []).filter(
        (t) => t.accountId === a.id && (t.status === 'open' || t.status === 'pending'),
      ).length;
      const overdue = (invoices.data ?? []).filter(
        (i) => cust.some((c) => c.id === i.customerId) && i.status === 'overdue',
      ).length;
      const { score, status } = scoreAccount({ activeMrr, openTickets, overdue, ageDays });
      rows.push({
        accountId: a.id,
        accountName: a.name,
        mrrCents: activeMrr,
        since: oldestSince,
        productCount: cust.length,
        openTickets,
        overdueInvoices: overdue,
        score,
        status,
      });
    }
    return rows.sort((a, b) => a.score - b.score);
  }, [accounts.data, customers.data, invoices.data, tickets.data]);

  const upcomingRenewals = useMemo(() => {
    const now = Date.now();
    return (subs.data ?? [])
      .filter((s): s is typeof s & { nextInvoiceAt: string } => s.status === 'active' && s.nextInvoiceAt !== null)
      .map((s) => ({
        sub: s,
        daysUntil: Math.floor((new Date(s.nextInvoiceAt).getTime() - now) / 86400_000),
      }))
      .filter((r) => r.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [subs.data]);

  const totalActive = health.filter((h) => h.status === 'green').length;
  const totalWatch = health.filter((h) => h.status === 'yellow').length;
  const totalAtRisk = health.filter((h) => h.status === 'red').length;

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Customer Success</h1>
        <p className="text-muted-foreground text-sm">
          Health scores, upcoming renewals, at-risk accounts.
        </p>
      </header>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Healthy</CardTitle>
            <CardDescription>Score ≥ 70</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl tabular-nums">{formatNumber(totalActive)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Watch</CardTitle>
            <CardDescription>Score 45 – 69</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl tabular-nums">{formatNumber(totalWatch)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">At risk</CardTitle>
            <CardDescription>Score &lt; 45</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl tabular-nums">{formatNumber(totalAtRisk)}</div>
          </CardContent>
        </Card>
      </div>

      <section className="mb-8">
        <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
          Account health
        </h2>
        <DataTableShell {...accounts} emptyMessage="No accounts yet.">
          {() => (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">MRR</TableHead>
                    <TableHead className="text-right">Products</TableHead>
                    <TableHead className="text-right">Open tickets</TableHead>
                    <TableHead className="text-right">Overdue</TableHead>
                    <TableHead className="text-right">Since</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {health.map((h) => (
                    <TableRow key={h.accountId}>
                      <TableCell className="font-medium">{h.accountName}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatCurrencyEUR(h.mrrCents / 100)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{formatNumber(h.productCount)}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{formatNumber(h.openTickets)}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{formatNumber(h.overdueInvoices)}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{formatDate(h.since)}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{h.score}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[h.status]}>{STATUS_LABEL[h.status]}</Badge>
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
        <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
          Renewals in next 30 days
        </h2>
        <DataTableShell {...subs} emptyMessage="No upcoming renewals.">
          {() => (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer subscription</TableHead>
                    <TableHead className="text-right">MRR</TableHead>
                    <TableHead className="text-right">Next invoice</TableHead>
                    <TableHead className="text-right">Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingRenewals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No renewals in the next 30 days.
                      </TableCell>
                    </TableRow>
                  ) : (
                    upcomingRenewals.map(({ sub, daysUntil }) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-mono">{sub.productCode}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {formatCurrencyEUR(sub.mrrCents / 100)}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {formatDate(sub.nextInvoiceAt)}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {formatNumber(daysUntil)} d
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DataTableShell>
      </section>
    </main>
  );
}
