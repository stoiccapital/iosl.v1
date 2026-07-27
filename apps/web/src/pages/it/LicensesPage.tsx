import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTableShell } from '@/components/data/DataTableShell';
import { formatCurrencyEUR, formatDate, formatNumber } from '@/lib/format';
import { softwareLicenseHooks } from '@/features/it/hooks';

export function LicensesPage() {
  const query = softwareLicenseHooks.useList();
  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Software licenses</h1>
        <p className="text-muted-foreground text-sm">Internal SaaS seats and renewals.</p>
      </header>
      <DataTableShell {...query} emptyMessage="No licenses yet.">
        {(rows) => (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tool</TableHead>
                  <TableHead className="text-right">Seats</TableHead>
                  <TableHead className="text-right">Used</TableHead>
                  <TableHead className="text-right">Monthly</TableHead>
                  <TableHead className="text-right">Renewal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.tool}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{formatNumber(l.seatCount)}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatNumber(l.seatsUsed)} / {formatNumber(l.seatCount)}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatCurrencyEUR(l.monthlyCostCents / 100)}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {l.renewalAt ? formatDate(l.renewalAt) : '—'}
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
