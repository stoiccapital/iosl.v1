import type { IncidentSeverity, IncidentStatus } from '@factory/shared';
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
import { incidentHooks } from '@/features/product/hooks';

const SEV_LABEL: Record<IncidentSeverity, string> = {
  sev1: 'SEV-1',
  sev2: 'SEV-2',
  sev3: 'SEV-3',
  sev4: 'SEV-4',
};
const SEV_VARIANT: Record<IncidentSeverity, 'default' | 'secondary' | 'destructive'> = {
  sev1: 'destructive',
  sev2: 'destructive',
  sev3: 'secondary',
  sev4: 'default',
};

const STATUS_LABEL: Record<IncidentStatus, string> = {
  investigating: 'Investigating',
  identified: 'Identified',
  monitoring: 'Monitoring',
  resolved: 'Resolved',
};
const STATUS_VARIANT: Record<IncidentStatus, 'default' | 'secondary' | 'outline'> = {
  investigating: 'secondary',
  identified: 'secondary',
  monitoring: 'secondary',
  resolved: 'default',
};

export function IncidentsPage() {
  const query = incidentHooks.useList();
  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Incidents</h1>
        <p className="text-muted-foreground text-sm">Outages and platform events.</p>
      </header>
      <DataTableShell {...query} emptyMessage="No incidents.">
        {(rows) => (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Started</TableHead>
                  <TableHead className="text-right">Resolved</TableHead>
                  <TableHead>Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows
                  .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
                  .map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.title}</TableCell>
                      <TableCell>
                        <Badge variant={SEV_VARIANT[i.severity]}>{SEV_LABEL[i.severity]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[i.status]}>{STATUS_LABEL[i.status]}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{formatDate(i.startedAt)}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {i.resolvedAt ? formatDate(i.resolvedAt) : '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[400px]">{i.summary}</TableCell>
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
