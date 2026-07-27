import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
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
import { accountHooks } from '@/features/crm/accounts/hooks';
import { usePeople } from '@/features/directory/hooks';
import { ticketHooks } from '@/features/support/hooks';
import {
  TICKET_PRIORITY_LABEL,
  TICKET_PRIORITY_VARIANT,
  TICKET_STATUS_LABEL,
  TICKET_STATUS_VARIANT,
} from '@/features/support/labels';

export function TicketsPage() {
  const query = ticketHooks.useList();
  const accounts = accountHooks.useList();
  const people = usePeople('employee');

  const accountName = useMemo(() => {
    const map = new Map((accounts.data ?? []).map((a) => [a.id, a.name] as const));
    return (id: string | null) => (id ? (map.get(id) ?? '—') : '—');
  }, [accounts.data]);

  const assigneeName = useMemo(() => {
    const map = new Map((people.data ?? []).map((p) => [p.id, `${p.firstName} ${p.lastName}`] as const));
    return (id: string | null) => (id ? (map.get(id) ?? '—') : 'Unassigned');
  }, [people.data]);

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Support</h1>
        <p className="text-muted-foreground text-sm">Customer support queue.</p>
      </header>
      <DataTableShell {...query} emptyMessage="No tickets in the queue.">
        {(rows) => (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead className="text-right">Opened</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.subject}</TableCell>
                    <TableCell>{accountName(t.accountId)}</TableCell>
                    <TableCell className="text-muted-foreground">{t.requesterEmail}</TableCell>
                    <TableCell>
                      <Badge variant={TICKET_PRIORITY_VARIANT[t.priority]}>
                        {TICKET_PRIORITY_LABEL[t.priority]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={TICKET_STATUS_VARIANT[t.status]}>
                        {TICKET_STATUS_LABEL[t.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{assigneeName(t.assigneeId)}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{formatDate(t.createdAt)}</TableCell>
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
