import type { ChurnReason } from '@factory/shared';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrencyEUR, formatDate, formatNumber, formatPercent } from '@/lib/format';
import { useChurn } from '@/features/crm/churn/hooks';

const REASON_LABEL: Record<ChurnReason, string> = {
  price: 'Price',
  competitor: 'Competitor',
  lack_of_use: 'Lack of use',
  missing_features: 'Missing features',
  shutdown: 'Customer shutdown',
  payment_failed: 'Payment failed (involuntary)',
  other: 'Other',
};

function reasonLabel(reason: string): string {
  return REASON_LABEL[reason as keyof typeof REASON_LABEL] ?? reason;
}

function bpsToPercent(bps: number): number {
  return bps / 100;
}

export function ChurnPage() {
  const { data, isLoading, isError, error } = useChurn();

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Churn</h1>
        <p className="text-muted-foreground text-sm">
          Who left, why, and who's at risk next. Trailing {data ? data.windowDays : 90} days.
        </p>
      </header>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      )}
      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Could not load churn</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : ''}</AlertDescription>
        </Alert>
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Logo churn</CardTitle>
                <CardDescription>Monthly rate · target &lt; 1 %</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl tabular-nums">
                  {formatPercent(bpsToPercent(data.logoChurnBps), 2)}
                </div>
                <p className="text-muted-foreground text-xs">
                  <span className="font-mono tabular-nums">{formatNumber(data.churnedCount)}</span>{' '}
                  customers left
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Revenue churn</CardTitle>
                <CardDescription>Monthly rate · target &lt; 1 %</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl tabular-nums">
                  {formatPercent(bpsToPercent(data.revenueChurnBps), 2)}
                </div>
                <p className="text-muted-foreground text-xs font-mono tabular-nums">
                  {formatCurrencyEUR(data.churnedMrrCents / 100)} MRR lost
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">At risk</CardTitle>
                <CardDescription>Score &lt; 60</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl tabular-nums">
                  {formatNumber(data.atRiskCount)}
                </div>
                <p className="text-muted-foreground text-xs font-mono tabular-nums">
                  {formatCurrencyEUR(data.atRiskMrrCents / 100)} MRR exposed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Top reason</CardTitle>
                <CardDescription>By MRR lost</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl tabular-nums">
                  {data.byReason[0] ? reasonLabel(data.byReason[0].reason) : '—'}
                </div>
                <p className="text-muted-foreground text-xs font-mono tabular-nums">
                  {data.byReason[0]
                    ? formatCurrencyEUR(data.byReason[0].mrrCents / 100)
                    : '—'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Churned — last {data.windowDays} days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">MRR</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-right">Tenure</TableHead>
                        <TableHead className="text-right">Churned</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.churned.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No churn in the window.
                          </TableCell>
                        </TableRow>
                      )}
                      {data.churned.map((r) => (
                        <TableRow key={r.customerId}>
                          <TableCell className="font-medium">{r.accountName}</TableCell>
                          <TableCell>{r.productName}</TableCell>
                          <TableCell className="text-right font-mono tabular-nums">
                            {formatCurrencyEUR(r.mrrCents / 100)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {r.churnReason ? reasonLabel(r.churnReason) : 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums">
                            {formatNumber(r.tenureDays)} d
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums">
                            {formatDate(r.churnedAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>By reason</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">MRR lost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.byReason.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            —
                          </TableCell>
                        </TableRow>
                      )}
                      {data.byReason.map((r) => (
                        <TableRow key={r.reason}>
                          <TableCell className="font-medium">{reasonLabel(r.reason)}</TableCell>
                          <TableCell className="text-right font-mono tabular-nums">
                            {formatNumber(r.count)}
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums">
                            {formatCurrencyEUR(r.mrrCents / 100)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>At-risk accounts</CardTitle>
              <CardDescription>
                Health score &lt; 60. Push these to CS before they show up in the churn table.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">MRR</TableHead>
                      <TableHead className="text-right">Open tickets</TableHead>
                      <TableHead className="text-right">Overdue invoices</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.atRisk.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No accounts currently at risk.
                        </TableCell>
                      </TableRow>
                    )}
                    {data.atRisk.map((r) => (
                      <TableRow key={r.accountId}>
                        <TableCell className="font-medium">{r.accountName}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {formatCurrencyEUR(r.mrrCents / 100)}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {formatNumber(r.openTickets)}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {formatNumber(r.overdueInvoices)}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {r.score}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
