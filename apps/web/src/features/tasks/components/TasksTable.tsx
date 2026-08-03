import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { toast } from 'sonner';
import type { Task } from '@factory/shared';
import { formatDate, formatRelative } from '@/lib/format';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { accountHooks } from '@/features/crm/accounts/hooks';
import { opportunityHooks } from '@/features/crm/opportunities/hooks';
import { usePeople } from '@/features/directory/hooks';
import { useDeleteTask, useTasks, useUpdateTask } from '../hooks/use-tasks';
import { TASK_STATUS_LABEL, TASK_STATUS_VARIANT } from '../lib/status';
import { TaskDialog } from './TaskDialog';

function TaskToggle({ task }: { task: Task }) {
  const update = useUpdateTask(task.id);
  const done = task.status === 'done';
  return (
    <input
      type="checkbox"
      checked={done}
      onChange={() => update.mutate({ status: done ? 'open' : 'done' })}
      disabled={update.isPending}
      aria-label={done ? 'Mark task open' : 'Mark task done'}
      className="h-4 w-4 cursor-pointer accent-primary"
    />
  );
}

function LinkedCell({ task }: { task: Task }) {
  const accounts = accountHooks.useList();
  const opps = opportunityHooks.useList();
  if (!task.relatedType || !task.relatedId) {
    return <span className="text-muted-foreground">—</span>;
  }
  if (task.relatedType === 'account') {
    const account = (accounts.data ?? []).find((a) => a.id === task.relatedId);
    return account ? (
      <Link to={`/crm/accounts/${account.id}`} className="hover:underline">
        {account.name}
      </Link>
    ) : (
      <span className="text-muted-foreground">Account</span>
    );
  }
  if (task.relatedType === 'opportunity') {
    const opp = (opps.data ?? []).find((o) => o.id === task.relatedId);
    return opp ? (
      <Link to={`/crm/opportunities/${opp.id}`} className="hover:underline">
        {opp.name}
      </Link>
    ) : (
      <span className="text-muted-foreground">Opportunity</span>
    );
  }
  return <span className="text-muted-foreground">Contact</span>;
}

function AssigneeCell({ id }: { id: string | null }) {
  const people = usePeople('employee');
  if (!id) return <span className="text-muted-foreground">Unassigned</span>;
  const p = (people.data ?? []).find((x) => x.id === id);
  return <span>{p ? `${p.firstName} ${p.lastName}` : '—'}</span>;
}

function useColumns(): ColumnDef<Task>[] {
  const del = useDeleteTask();

  return useMemo<ColumnDef<Task>[]>(
    () => [
      {
        id: 'done',
        header: '',
        cell: ({ row }) => <TaskToggle task={row.original} />,
        enableSorting: false,
      },
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <div>
            <div className={row.original.status === 'done' ? 'line-through text-muted-foreground' : 'font-medium'}>
              {row.original.title}
            </div>
            {row.original.description && (
              <div className="text-xs text-muted-foreground line-clamp-1">
                {row.original.description}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'linked',
        header: 'Linked to',
        cell: ({ row }) => <LinkedCell task={row.original} />,
      },
      {
        id: 'assignee',
        header: 'Assignee',
        cell: ({ row }) => <AssigneeCell id={row.original.assigneeId} />,
      },
      {
        accessorKey: 'dueAt',
        header: () => <span className="block text-right">Due</span>,
        cell: ({ row }) => {
          const dueAt = row.original.dueAt;
          if (!dueAt) return <div className="text-right text-muted-foreground">—</div>;
          const overdue =
            row.original.status !== 'done' && new Date(dueAt).getTime() < Date.now();
          return (
            <div
              className={
                'text-right font-mono tabular-nums ' +
                (overdue ? 'text-destructive' : '')
              }
            >
              {formatDate(dueAt)}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={TASK_STATUS_VARIANT[row.original.status]}>
            {TASK_STATUS_LABEL[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: () => <span className="block text-right">Updated</span>,
        cell: ({ row }) => (
          <div
            className="text-right font-mono tabular-nums text-xs text-muted-foreground"
            title={row.original.updatedAt}
          >
            {formatRelative(row.original.updatedAt)}
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="block text-right">Actions</span>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <TaskDialog
              mode="edit"
              task={row.original}
              trigger={
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              }
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                del.mutate(row.original.id, {
                  onSuccess: () => toast.success('Task deleted'),
                  onError: (err) =>
                    toast.error('Could not delete task', {
                      description: err instanceof Error ? err.message : 'Unknown error',
                    }),
                })
              }
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [del],
  );
}

export function TasksTable() {
  const { data, isLoading, isError, error } = useTasks();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'updatedAt', desc: true }]);
  const columns = useColumns();

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load tasks</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                No tasks yet. Create the first one to get started.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
