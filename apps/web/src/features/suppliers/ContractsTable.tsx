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
import { ContractDialog } from './ContractDialog';
import { contractHooks, supplierHooks } from './hooks';
import { CONTRACT_STATUS_LABEL, CONTRACT_STATUS_VARIANT } from './labels';

export function ContractsTable() {
  const query = contractHooks.useList();
  const suppliers = supplierHooks.useList();
  const remove = contractHooks.useRemove();

  const supplierName = useMemo(() => {
    const map = new Map((suppliers.data ?? []).map((s) => [s.id, s.name] as const));
    return (id: string) => map.get(id) ?? '—';
  }, [suppliers.data]);

  return (
    <DataTableShell {...query} emptyMessage="No contracts yet.">
      {(rows) => (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead className="text-right">Monthly</TableHead>
                <TableHead className="text-right">Start</TableHead>
                <TableHead className="text-right">End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{supplierName(c.supplierId)}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatCurrencyEUR(c.monthlyAmountCents / 100)}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatDate(c.startDate)}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {c.endDate ? formatDate(c.endDate) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={CONTRACT_STATUS_VARIANT[c.status]}>
                      {CONTRACT_STATUS_LABEL[c.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ContractDialog mode="edit" contract={c} trigger={<Button size="sm" variant="ghost">Edit</Button>} />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        remove.mutate(c.id, {
                          onSuccess: () => toast.success('Contract deleted'),
                          onError: (err) =>
                            toast.error('Delete failed', {
                              description: err instanceof Error ? err.message : '',
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
