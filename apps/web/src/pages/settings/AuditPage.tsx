import type { AuditAction } from '@factory/shared';
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
import { formatDateTime } from '@/lib/format';
import { useAuditLog } from '@/features/audit/hooks';

const ACTION_LABEL: Record<AuditAction, string> = {
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  login: 'Login',
  logout: 'Logout',
  role_change: 'Role change',
};

const ACTION_VARIANT: Record<AuditAction, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  create: 'default',
  update: 'secondary',
  delete: 'destructive',
  login: 'outline',
  logout: 'outline',
  role_change: 'secondary',
};

export function AuditPage() {
  const query = useAuditLog();
  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
        <p className="text-muted-foreground text-sm">Who changed what, and when.</p>
      </header>
      <DataTableShell {...query} emptyMessage="No audit entries yet.">
        {(rows) => (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">When</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-right font-mono tabular-nums">{formatDateTime(e.at)}</TableCell>
                    <TableCell className="text-muted-foreground">{e.actorEmail}</TableCell>
                    <TableCell>
                      <Badge variant={ACTION_VARIANT[e.action]}>{ACTION_LABEL[e.action]}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">{e.resource}</TableCell>
                    <TableCell className="text-muted-foreground">{e.detail}</TableCell>
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
