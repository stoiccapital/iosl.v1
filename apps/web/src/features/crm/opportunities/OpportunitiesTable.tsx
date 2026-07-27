import { useMemo } from 'react';
import { toast } from 'sonner';
import type { Opportunity } from '@factory/shared';
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
import { formatCurrencyEUR, formatDate, formatPercent } from '@/lib/format';
import { accountHooks } from '../accounts/hooks';
import { usePeople } from '@/features/directory/hooks';
import { opportunityHooks } from './hooks';
import { OpportunityDialog } from './OpportunityDialog';
import { STAGE_LABEL, STAGE_VARIANT } from './stage';

export function OpportunitiesTable({ rows }: { rows: Opportunity[] }) {
  const accounts = accountHooks.useList();
  const people = usePeople('employee');
  const remove = opportunityHooks.useRemove();

  const accountName = useMemo(() => {
    const map = new Map((accounts.data ?? []).map((a) => [a.id, a.name] as const));
    return (id: string) => map.get(id) ?? '—';
  }, [accounts.data]);

  const ownerName = useMemo(() => {
    const map = new Map((people.data ?? []).map((p) => [p.id, `${p.firstName} ${p.lastName}`] as const));
    return (id: string | null) => (id ? map.get(id) ?? '—' : 'Unassigned');
  }, [people.data]);

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Prob.</TableHead>
            <TableHead className="text-right">Close</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="font-medium">{o.name}</TableCell>
              <TableCell>{accountName(o.accountId)}</TableCell>
              <TableCell>
                <Badge variant={STAGE_VARIANT[o.stage]}>{STAGE_LABEL[o.stage]}</Badge>
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatCurrencyEUR(o.amountCents / 100)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatPercent(o.probability)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatDate(o.expectedCloseDate)}
              </TableCell>
              <TableCell className="text-muted-foreground">{ownerName(o.ownerId)}</TableCell>
              <TableCell className="text-right">
                <OpportunityDialog
                  mode="edit"
                  opportunity={o}
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
                    remove.mutate(o.id, {
                      onSuccess: () => toast.success('Opportunity deleted'),
                      onError: (err) =>
                        toast.error('Could not delete opportunity', {
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
  );
}

export function OpportunitiesTableWrapper() {
  const query = opportunityHooks.useList();
  return (
    <DataTableShell {...query} emptyMessage="No opportunities yet.">
      {(rows) => <OpportunitiesTable rows={rows} />}
    </DataTableShell>
  );
}
