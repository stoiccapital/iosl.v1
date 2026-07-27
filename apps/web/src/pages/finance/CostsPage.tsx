import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrencyEUR } from '@/lib/format';
import { StatCard } from '@/features/finance/StatCard';
import { useCostSummary } from '@/features/finance/hooks';

const CATEGORY_LABEL: Record<string, string> = {
  saas: 'SaaS',
  infrastructure: 'Infrastructure',
  marketing: 'Marketing',
  legal: 'Legal',
  office: 'Office',
  other: 'Other',
  salary: 'Salary',
  contractor: 'Contractor',
};

export function CostsPage() {
  const { data, isLoading, isError, error } = useCostSummary();
  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Costs</h1>
        <p className="text-muted-foreground text-sm">
          Consolidated view of supplier contracts + payroll.
        </p>
      </header>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Could not load costs</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : 'Unknown error'}</AlertDescription>
        </Alert>
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Monthly cost"
              value={formatCurrencyEUR(data.monthlyCents / 100)}
              hint="Total recurring monthly outflow"
            />
            <StatCard
              label="Annualized"
              value={formatCurrencyEUR((data.monthlyCents * 12) / 100)}
              hint="Monthly × 12"
            />
            <StatCard
              label="Line items"
              value={data.items.length}
              hint="Active contracts + monthly payroll"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                By category
              </h2>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Monthly</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.byCategory.map((r) => (
                      <TableRow key={r.category}>
                        <TableCell className="font-medium">
                          {CATEGORY_LABEL[r.category] ?? r.category}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {formatCurrencyEUR(r.monthlyCents / 100)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                By source
              </h2>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Monthly</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.bySource.map((r) => (
                      <TableRow key={r.source}>
                        <TableCell className="font-medium capitalize">{r.source}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {formatCurrencyEUR(r.monthlyCents / 100)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          </div>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Line items
            </h2>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Payee</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Monthly</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell>
                        <Badge variant={i.source === 'supplier' ? 'default' : 'secondary'}>
                          {i.source}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{i.sourceRef}</TableCell>
                      <TableCell>{CATEGORY_LABEL[i.category] ?? i.category}</TableCell>
                      <TableCell className="text-muted-foreground">{i.description}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatCurrencyEUR(i.monthlyCents / 100)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
