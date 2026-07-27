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
import { positionHooks } from './hooks';
import { EMPLOYMENT_TYPE_LABEL, POSITION_STATUS_LABEL, POSITION_STATUS_VARIANT } from './labels';
import { PositionDialog } from './PositionDialog';

export function PositionsTable() {
  const query = positionHooks.useList();
  const remove = positionHooks.useRemove();
  return (
    <DataTableShell {...query} emptyMessage="No positions yet.">
      {(rows) => (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Openings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>{p.department}</TableCell>
                  <TableCell>{p.location}</TableCell>
                  <TableCell>{EMPLOYMENT_TYPE_LABEL[p.employmentType]}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{p.openings}</TableCell>
                  <TableCell>
                    <Badge variant={POSITION_STATUS_VARIANT[p.status]}>{POSITION_STATUS_LABEL[p.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <PositionDialog mode="edit" position={p} trigger={<Button size="sm" variant="ghost">Edit</Button>} />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        remove.mutate(p.id, {
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
