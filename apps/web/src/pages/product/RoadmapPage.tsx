import type { FeatureStatus } from '@factory/shared';
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
import { featureHooks } from '@/features/product/hooks';

const STATUS_LABEL: Record<FeatureStatus, string> = {
  idea: 'Idea',
  planned: 'Planned',
  in_progress: 'In progress',
  beta: 'Beta',
  shipped: 'Shipped',
  archived: 'Archived',
};

const STATUS_VARIANT: Record<FeatureStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  idea: 'outline',
  planned: 'outline',
  in_progress: 'secondary',
  beta: 'secondary',
  shipped: 'default',
  archived: 'destructive',
};

export function RoadmapPage() {
  const query = featureHooks.useList();
  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Roadmap</h1>
        <p className="text-muted-foreground text-sm">Features across idea → shipped.</p>
      </header>
      <DataTableShell {...query} emptyMessage="No features tracked.">
        {(rows) => (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Effort</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <div className="font-medium">{f.title}</div>
                      <div className="text-muted-foreground text-xs">{f.description}</div>
                    </TableCell>
                    <TableCell className="capitalize">{f.area}</TableCell>
                    <TableCell className="font-mono uppercase">{f.effort}</TableCell>
                    <TableCell className="font-mono">{f.targetRelease ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[f.status]}>{STATUS_LABEL[f.status]}</Badge>
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
