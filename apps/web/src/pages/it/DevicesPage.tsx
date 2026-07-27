import { useMemo } from 'react';
import type { DeviceKind, DeviceStatus } from '@factory/shared';
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
import { formatCurrencyEUR, formatDate } from '@/lib/format';
import { usePeople } from '@/features/directory/hooks';
import { deviceHooks } from '@/features/it/hooks';

const KIND_LABEL: Record<DeviceKind, string> = {
  laptop: 'Laptop',
  monitor: 'Monitor',
  phone: 'Phone',
  tablet: 'Tablet',
  other: 'Other',
};

const STATUS_LABEL: Record<DeviceStatus, string> = {
  in_use: 'In use',
  spare: 'Spare',
  retired: 'Retired',
  lost: 'Lost',
};
const STATUS_VARIANT: Record<DeviceStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  in_use: 'default',
  spare: 'secondary',
  retired: 'outline',
  lost: 'destructive',
};

export function DevicesPage() {
  const query = deviceHooks.useList();
  const people = usePeople();
  const personName = useMemo(() => {
    const map = new Map((people.data ?? []).map((p) => [p.id, `${p.firstName} ${p.lastName}`] as const));
    return (id: string | null) => (id ? (map.get(id) ?? '—') : 'Unassigned');
  }, [people.data]);

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Devices</h1>
        <p className="text-muted-foreground text-sm">Laptops, monitors, phones.</p>
      </header>
      <DataTableShell {...query} emptyMessage="No devices yet.">
        {(rows) => (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Serial</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead className="text-right">Purchased</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.model}</TableCell>
                    <TableCell>{KIND_LABEL[d.kind]}</TableCell>
                    <TableCell className="font-mono">{d.serialNumber}</TableCell>
                    <TableCell>{personName(d.assigneeId)}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{formatDate(d.purchasedAt)}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatCurrencyEUR(d.costCents / 100)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[d.status]}>{STATUS_LABEL[d.status]}</Badge>
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
