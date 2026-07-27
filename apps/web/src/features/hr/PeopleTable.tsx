import { toast } from 'sonner';
import type { PersonType } from '@factory/shared';
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
import { formatDate } from '@/lib/format';
import { usePeople } from '@/features/directory/hooks';
import { personHooks } from './hooks';
import { PersonDialog } from './PersonDialog';

export function PeopleTable({ type }: { type: PersonType }) {
  const query = usePeople(type);
  const remove = personHooks.useRemove();
  return (
    <DataTableShell
      {...query}
      emptyMessage={type === 'employee' ? 'No employees yet.' : 'No freelancers yet.'}
    >
      {(rows) => (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Since</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.firstName} {p.lastName}</TableCell>
                  <TableCell>{p.role}</TableCell>
                  <TableCell>{p.location}</TableCell>
                  <TableCell className="text-muted-foreground">{p.email}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {p.startDate ? formatDate(p.startDate) : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <PersonDialog mode="edit" person={p} trigger={<Button size="sm" variant="ghost">Edit</Button>} />
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
