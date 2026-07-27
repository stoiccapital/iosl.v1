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
import { releaseHooks } from '@/features/product/hooks';

export function ReleasesPage() {
  const query = releaseHooks.useList();
  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Releases</h1>
        <p className="text-muted-foreground text-sm">What shipped, when.</p>
      </header>
      <DataTableShell {...query} emptyMessage="No releases yet.">
        {(rows) => (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead className="text-right">Released</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows
                  .sort((a, b) => (a.releasedAt < b.releasedAt ? 1 : -1))
                  .map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono font-medium">{r.version}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{formatDate(r.releasedAt)}</TableCell>
                      <TableCell className="text-muted-foreground">{r.notes}</TableCell>
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
