import { useMemo } from 'react';
import { toast } from 'sonner';
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
import { formatDate, formatDecimal } from '@/lib/format';
import { usePeople } from '@/features/directory/hooks';
import { assignmentHooks, projectHooks, timeEntryHooks } from '@/features/projects/hooks';
import { NewTimeEntryButton, TimeEntryDialog } from '@/features/projects/TimeEntryDialog';

export function TimePage() {
  const entries = timeEntryHooks.useList();
  const assignments = assignmentHooks.useList();
  const projects = projectHooks.useList();
  const people = usePeople();
  const remove = timeEntryHooks.useRemove();

  const projectByAssignment = useMemo(() => {
    const assignById = new Map((assignments.data ?? []).map((a) => [a.id, a] as const));
    const projectById = new Map((projects.data ?? []).map((p) => [p.id, p.name] as const));
    return (assignmentId: string) => {
      const a = assignById.get(assignmentId);
      return a ? (projectById.get(a.projectId) ?? '—') : '—';
    };
  }, [assignments.data, projects.data]);

  const personByAssignment = useMemo(() => {
    const assignById = new Map((assignments.data ?? []).map((a) => [a.id, a] as const));
    const personById = new Map((people.data ?? []).map((p) => [p.id, `${p.firstName} ${p.lastName}`] as const));
    return (assignmentId: string) => {
      const a = assignById.get(assignmentId);
      return a ? (personById.get(a.personId) ?? '—') : '—';
    };
  }, [assignments.data, people.data]);

  return (
    <main className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Time</h1>
          <p className="text-muted-foreground text-sm">Hours logged against project assignments.</p>
        </div>
        <NewTimeEntryButton />
      </div>
      <DataTableShell {...entries} emptyMessage="No time entries yet.">
        {(rows) => (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">Date</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Person</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-right font-mono tabular-nums">{formatDate(e.date)}</TableCell>
                    <TableCell className="font-medium">{projectByAssignment(e.assignmentId)}</TableCell>
                    <TableCell>{personByAssignment(e.assignmentId)}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatDecimal(e.hours)} h
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[280px] truncate">{e.note}</TableCell>
                    <TableCell className="text-right">
                      <TimeEntryDialog mode="edit" entry={e} trigger={<Button size="sm" variant="ghost">Edit</Button>} />
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
    </main>
  );
}
