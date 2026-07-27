import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { formatCurrencyEUR, formatDecimal, formatNumber, formatPercent } from '@/lib/format';
import { CHART_PRIMARY } from '@/features/bi/chart-theme';
import { useBiSales } from '@/features/bi/hooks';

function bpsToPercent(bps: number): number {
  return bps / 100;
}

export function BiSalesPage() {
  const { data, isLoading, isError, error } = useBiSales();

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Sales</h1>
        <p className="text-muted-foreground text-sm">
          Win rates by segment, sales cycle length, and pipeline coverage.
        </p>
      </header>

      {isLoading && <Skeleton className="h-96" />}
      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Could not load sales</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : ''}</AlertDescription>
        </Alert>
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overall win rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl tabular-nums">
                  {formatPercent(bpsToPercent(data.winRateBps), 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Open pipeline (weighted)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl tabular-nums">
                  {formatCurrencyEUR(data.pipeline.openWeightedCents / 100)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pipeline coverage</CardTitle>
                <CardDescription>Target ≥ 3× quarter target</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl tabular-nums">
                  {formatDecimal(data.pipeline.coverageRatio)}×
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Win rate by account size</CardTitle>
              </CardHeader>
              <CardContent style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.winRateBySize.map((r) => ({
                      size: r.size,
                      winRate: bpsToPercent(r.winRateBps),
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="size" fontSize={12} />
                    <YAxis fontSize={12} tickFormatter={(v: number) => `${v.toFixed(0)}%`} />
                    <Tooltip formatter={(v: unknown) => `${Number(v).toFixed(1)} %`} />
                    <Bar dataKey="winRate" name="Win rate" fill={CHART_PRIMARY} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Median cycle length by size (days)</CardTitle>
              </CardHeader>
              <CardContent style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.cycleBySize.map((r) => ({
                      size: r.size,
                      medianDays: r.medianDays,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="size" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="medianDays" name="Median days" fill={CHART_PRIMARY} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>By-segment detail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Won</TableHead>
                      <TableHead className="text-right">Lost</TableHead>
                      <TableHead className="text-right">Win rate</TableHead>
                      <TableHead className="text-right">Median cycle</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.winRateBySize.map((row) => {
                      const cycle = data.cycleBySize.find((c) => c.size === row.size);
                      return (
                        <TableRow key={row.size}>
                          <TableCell className="font-mono">{row.size}</TableCell>
                          <TableCell className="text-right font-mono tabular-nums">
                            {formatNumber(row.wonCount)}
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums">
                            {formatNumber(row.lostCount)}
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums">
                            {formatPercent(bpsToPercent(row.winRateBps), 0)}
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums">
                            {cycle ? `${formatNumber(Math.round(cycle.medianDays))} d` : '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
