import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrencyEUR, formatNumber } from '@/lib/format';
import { StatCard } from '@/features/finance/StatCard';
import { useRevenueSummary } from '@/features/finance/hooks';

export function RevenuePage() {
  const { data, isLoading, isError, error } = useRevenueSummary();

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Revenue</h1>
        <p className="text-muted-foreground text-sm">
          MRR / ARR derived from active customer subscriptions.
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
          <AlertTitle>Could not load revenue</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : 'Unknown error'}</AlertDescription>
        </Alert>
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="MRR" value={formatCurrencyEUR(data.mrrCents / 100)} hint="Monthly recurring revenue" />
            <StatCard label="ARR" value={formatCurrencyEUR(data.arrCents / 100)} hint="Annualized" />
            <StatCard label="Active customers" value={formatNumber(data.activeCustomers)} hint="Distinct paying accounts" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                By product
              </h2>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Customers</TableHead>
                      <TableHead className="text-right">MRR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.byProduct.map((r) => (
                      <TableRow key={r.productCode}>
                        <TableCell className="font-medium">{r.productName}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {formatNumber(r.customers)}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {formatCurrencyEUR(r.mrrCents / 100)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                By account
              </h2>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead className="text-right">MRR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.byAccount.map((r) => (
                      <TableRow key={r.accountId}>
                        <TableCell className="font-medium">{r.accountName}</TableCell>
                        <TableCell className="text-muted-foreground">{r.products.join(', ')}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {formatCurrencyEUR(r.mrrCents / 100)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          </div>
        </div>
      )}
    </main>
  );
}
