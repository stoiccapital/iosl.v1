import { useMemo } from 'react';
import type { InvoiceStatus } from '@factory/shared';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTableShell } from '@/components/data/DataTableShell';
import { formatCurrencyEUR, formatDate } from '@/lib/format';
import { customerHooks } from '@/features/crm/customers/hooks';
import { accountHooks } from '@/features/crm/accounts/hooks';
import { invoiceHooks } from '@/features/billing/hooks';

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  void: 'Void',
};
const STATUS_VARIANT: Record<InvoiceStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'outline',
  sent: 'secondary',
  paid: 'default',
  overdue: 'destructive',
  void: 'outline',
};

export function InvoicesPage() {
  const query = invoiceHooks.useList();
  const customers = customerHooks.useList();
  const accounts = accountHooks.useList();

  const accountForCustomer = useMemo(() => {
    const custToAcc = new Map((customers.data ?? []).map((c) => [c.id, c.accountId] as const));
    const accById = new Map((accounts.data ?? []).map((a) => [a.id, a.name] as const));
    return (customerId: string) => {
      const accId = custToAcc.get(customerId);
      return accId ? (accById.get(accId) ?? '—') : '—';
    };
  }, [customers.data, accounts.data]);

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground text-sm">Recent customer invoices.</p>
      </header>
      <DataTableShell {...query} emptyMessage="No invoices yet.">
        {(rows) => (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Issued</TableHead>
                  <TableHead className="text-right">Due</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows
                  .sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1))
                  .map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-mono">{i.number}</TableCell>
                      <TableCell className="font-medium">{accountForCustomer(i.customerId)}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatCurrencyEUR(i.amountCents / 100)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[i.status]}>{STATUS_LABEL[i.status]}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{formatDate(i.issuedAt)}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{formatDate(i.dueAt)}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {i.paidAt ? formatDate(i.paidAt) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DataTableShell>
    </main>
  );
}
