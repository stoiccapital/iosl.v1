import { useMemo } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { accountHooks } from '../accounts/hooks';
import { useProducts } from '@/features/directory/hooks';
import { customerHooks } from './hooks';
import { CustomerDialog } from './CustomerDialog';

export function CustomersTable() {
  const query = customerHooks.useList();
  const accounts = accountHooks.useList();
  const products = useProducts();
  const remove = customerHooks.useRemove();

  const accountName = useMemo(() => {
    const map = new Map((accounts.data ?? []).map((a) => [a.id, a.name] as const));
    return (id: string) => map.get(id) ?? '—';
  }, [accounts.data]);

  const productName = useMemo(() => {
    const map = new Map((products.data ?? []).map((p) => [p.code, p.name] as const));
    return (code: string) => map.get(code) ?? code;
  }, [products.data]);

  return (
    <DataTableShell {...query} emptyMessage="No customers yet.">
      {(rows) => (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">MRR</TableHead>
                <TableHead className="text-right">Since</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{accountName(c.accountId)}</TableCell>
                  <TableCell>{productName(c.productCode)}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatCurrencyEUR(c.mrrCents / 100)}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatDate(c.since)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.active ? 'default' : 'destructive'}>
                      {c.active ? 'Active' : 'Churned'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <CustomerDialog
                      mode="edit"
                      customer={c}
                      trigger={
                        <Button size="sm" variant="ghost">
                          Edit
                        </Button>
                      }
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        remove.mutate(c.id, {
                          onSuccess: () => toast.success('Customer deleted'),
                          onError: (err) =>
                            toast.error('Could not delete customer', {
                              description: err instanceof Error ? err.message : 'Unknown error',
                            }),
                        })
                      }
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DataTableShell>
  );
}
