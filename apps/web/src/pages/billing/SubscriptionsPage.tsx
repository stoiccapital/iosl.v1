import { useMemo } from 'react';
import type { SubscriptionStatus } from '@factory/shared';
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
import { useProducts } from '@/features/directory/hooks';
import { subscriptionHooks } from '@/features/billing/hooks';

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  active: 'Active',
  past_due: 'Past due',
  cancelled: 'Cancelled',
  paused: 'Paused',
};
const STATUS_VARIANT: Record<SubscriptionStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  past_due: 'destructive',
  cancelled: 'outline',
  paused: 'secondary',
};

export function SubscriptionsPage() {
  const query = subscriptionHooks.useList();
  const customers = customerHooks.useList();
  const accounts = accountHooks.useList();
  const products = useProducts();

  const accountForSub = useMemo(() => {
    const custToAcc = new Map((customers.data ?? []).map((c) => [c.id, c.accountId] as const));
    const accById = new Map((accounts.data ?? []).map((a) => [a.id, a.name] as const));
    return (customerId: string) => {
      const accId = custToAcc.get(customerId);
      return accId ? (accById.get(accId) ?? '—') : '—';
    };
  }, [customers.data, accounts.data]);

  const productName = useMemo(() => {
    const map = new Map((products.data ?? []).map((p) => [p.code, p.name] as const));
    return (code: string) => map.get(code) ?? code;
  }, [products.data]);

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground text-sm">Active + historical customer subscriptions.</p>
      </header>
      <DataTableShell {...query} emptyMessage="No subscriptions yet.">
        {(rows) => (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Cycle</TableHead>
                  <TableHead className="text-right">MRR</TableHead>
                  <TableHead className="text-right">Started</TableHead>
                  <TableHead className="text-right">Next invoice</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{accountForSub(s.customerId)}</TableCell>
                    <TableCell>{productName(s.productCode)}</TableCell>
                    <TableCell className="capitalize">{s.billingCycle}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatCurrencyEUR(s.mrrCents / 100)}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{formatDate(s.startedAt)}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{formatDate(s.nextInvoiceAt)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[s.status]}>{STATUS_LABEL[s.status]}</Badge>
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
