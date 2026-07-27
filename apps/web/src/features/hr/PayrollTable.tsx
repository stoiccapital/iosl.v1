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
import { usePeople } from '@/features/directory/hooks';
import { payrollHooks } from './hooks';
import { PayrollDialog } from './PayrollDialog';

export function PayrollTable() {
  const query = payrollHooks.useList();
  const people = usePeople();
  const remove = payrollHooks.useRemove();

  const personName = useMemo(() => {
    const map = new Map((people.data ?? []).map((p) => [p.id, `${p.firstName} ${p.lastName}`] as const));
    return (id: string) => map.get(id) ?? '—';
  }, [people.data]);

  const personKind = useMemo(() => {
    const map = new Map((people.data ?? []).map((p) => [p.id, p.type] as const));
    return (id: string) => map.get(id);
  }, [people.data]);

  return (
    <DataTableShell {...query} emptyMessage="No payroll entries yet.">
      {(rows) => (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead>Cadence</TableHead>
                <TableHead className="text-right">Since</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{personName(e.personId)}</TableCell>
                  <TableCell>
                    <Badge variant={personKind(e.personId) === 'employee' ? 'default' : 'secondary'}>
                      {personKind(e.personId) ?? '—'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatCurrencyEUR(e.grossAmountCents / 100)}
                  </TableCell>
                  <TableCell>{e.cadence === 'monthly' ? 'Monthly' : 'One-time'}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatDate(e.effectiveDate)}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[220px] truncate">{e.note}</TableCell>
                  <TableCell className="text-right">
                    <PayrollDialog mode="edit" entry={e} trigger={<Button size="sm" variant="ghost">Edit</Button>} />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        remove.mutate(e.id, {
                          onSuccess: () => toast.success('Deleted'),
                          onError: (err) => toast.error('Failed', { description: err instanceof Error ? err.message : '' }),
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
