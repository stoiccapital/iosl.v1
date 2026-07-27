import { toast } from 'sonner';
import type { LeadSource, LeadStatus } from '@factory/shared';
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
import { formatCurrencyEUR } from '@/lib/format';
import { leadHooks } from './hooks';
import { LeadDialog } from './LeadDialog';

const SOURCE_LABEL: Record<LeadSource, string> = {
  referral: 'Referral',
  inbound: 'Inbound',
  outbound: 'Outbound',
  event: 'Event',
};

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'New',
  qualified: 'Qualified',
  disqualified: 'Disqualified',
};

const STATUS_VARIANT: Record<LeadStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  new: 'outline',
  qualified: 'default',
  disqualified: 'destructive',
};

export function LeadsTable() {
  const query = leadHooks.useList();
  const remove = leadHooks.useRemove();

  return (
    <DataTableShell {...query} emptyMessage="No leads yet.">
      {(rows) => (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Est. value</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.company}</TableCell>
                  <TableCell>{SOURCE_LABEL[r.source]}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatCurrencyEUR(r.estimatedValueCents / 100)}
                  </TableCell>
                  <TableCell className="text-right">
                    <LeadDialog
                      mode="edit"
                      lead={r}
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
                        remove.mutate(r.id, {
                          onSuccess: () => toast.success('Lead deleted'),
                          onError: (err) =>
                            toast.error('Could not delete lead', {
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
