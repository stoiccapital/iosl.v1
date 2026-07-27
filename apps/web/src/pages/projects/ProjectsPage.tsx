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
import { formatDate, formatPercent } from '@/lib/format';
import { accountHooks } from '@/features/crm/accounts/hooks';
import { usePeople } from '@/features/directory/hooks';
import { AssignmentDialog, NewAssignmentButton } from '@/features/projects/AssignmentDialog';
import { NewProjectButton, ProjectDialog } from '@/features/projects/ProjectDialog';
import { assignmentHooks, projectHooks } from '@/features/projects/hooks';
import {
  ASSIGNMENT_STATUS_LABEL,
  PROJECT_STATUS_LABEL,
  PROJECT_STATUS_VARIANT,
} from '@/features/projects/labels';

export function ProjectsPage() {
  const projects = projectHooks.useList();
  const assignments = assignmentHooks.useList();
  const accounts = accountHooks.useList();
  const people = usePeople();
  const removeProject = projectHooks.useRemove();
  const removeAssignment = assignmentHooks.useRemove();

  const accountName = useMemo(() => {
    const map = new Map((accounts.data ?? []).map((a) => [a.id, a.name] as const));
    return (id: string | null) => (id ? (map.get(id) ?? '—') : 'Internal');
  }, [accounts.data]);

  const projectName = useMemo(() => {
    const map = new Map((projects.data ?? []).map((p) => [p.id, p.name] as const));
    return (id: string) => map.get(id) ?? '—';
  }, [projects.data]);

  const personName = useMemo(() => {
    const map = new Map((people.data ?? []).map((p) => [p.id, `${p.firstName} ${p.lastName}`] as const));
    return (id: string) => map.get(id) ?? '—';
  }, [people.data]);

  return (
    <main className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm">
            What everyone is working on, and where.
          </p>
        </div>
        <div className="flex gap-2">
          <NewAssignmentButton />
          <NewProjectButton />
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Projects
        </h2>
        <DataTableShell {...projects} emptyMessage="No projects yet.">
          {(rows) => (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Start</TableHead>
                    <TableHead className="text-right">Target end</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="font-mono">{p.code}</TableCell>
                      <TableCell>{accountName(p.clientAccountId)}</TableCell>
                      <TableCell>
                        <Badge variant={PROJECT_STATUS_VARIANT[p.status]}>{PROJECT_STATUS_LABEL[p.status]}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{formatDate(p.startDate)}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {p.targetEndDate ? formatDate(p.targetEndDate) : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <ProjectDialog mode="edit" project={p} trigger={<Button size="sm" variant="ghost">Edit</Button>} />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            removeProject.mutate(p.id, {
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
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Assignments
        </h2>
        <DataTableShell {...assignments} emptyMessage="No assignments yet.">
          {(rows) => (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Person</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Allocation</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{projectName(a.projectId)}</TableCell>
                      <TableCell>{personName(a.personId)}</TableCell>
                      <TableCell>{a.role}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatPercent(a.allocationPercent)}
                      </TableCell>
                      <TableCell>{a.location}</TableCell>
                      <TableCell>
                        <Badge variant={a.status === 'active' ? 'default' : 'destructive'}>
                          {ASSIGNMENT_STATUS_LABEL[a.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <AssignmentDialog mode="edit" assignment={a} trigger={<Button size="sm" variant="ghost">Edit</Button>} />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            removeAssignment.mutate(a.id, {
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
      </section>
    </main>
  );
}
