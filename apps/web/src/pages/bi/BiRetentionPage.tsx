import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatPercent } from '@/lib/format';
import { CHART_MUTED, CHART_PRIMARY, CHART_SLATE } from '@/features/bi/chart-theme';
import { useBiRetention } from '@/features/bi/hooks';

function bpsToPercent(bps: number): number {
  return bps / 100;
}

function cellColor(retention: number): string {
  if (retention >= 0.95) return 'bg-primary/80 text-primary-foreground';
  if (retention >= 0.85) return 'bg-primary/60 text-primary-foreground';
  if (retention >= 0.7) return 'bg-primary/40';
  if (retention >= 0.5) return 'bg-primary/20';
  return 'bg-muted';
}

export function BiRetentionPage() {
  const { data, isLoading, isError, error } = useBiRetention();

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Retention</h1>
        <p className="text-muted-foreground text-sm">
          Cohort survival and monthly NRR / GRR / churn rates.
        </p>
      </header>

      {isLoading && <Skeleton className="h-96" />}
      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Could not load retention</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : ''}</AlertDescription>
        </Alert>
      )}

      {data && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly NRR / GRR / Churn</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.monthly.map((m) => ({
                    month: m.month,
                    nrr: bpsToPercent(m.nrrBps),
                    grr: bpsToPercent(m.grrBps),
                    logoChurn: bpsToPercent(m.logoChurnBps),
                    revenueChurn: bpsToPercent(m.revenueChurnBps),
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(v: number) => `${v.toFixed(1)}%`} />
                  <Tooltip formatter={(v: unknown) => `${Number(v).toFixed(2)} %`} />
                  <Legend />
                  <Line type="monotone" dataKey="nrr" name="NRR" stroke={CHART_PRIMARY} dot />
                  <Line type="monotone" dataKey="grr" name="GRR" stroke={CHART_SLATE} dot />
                  <Line type="monotone" dataKey="logoChurn" name="Logo churn" stroke={CHART_MUTED} dot />
                  <Line
                    type="monotone"
                    dataKey="revenueChurn"
                    name="Revenue churn"
                    stroke={CHART_MUTED}
                    strokeDasharray="4 2"
                    dot
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cohort retention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cohort</TableHead>
                      <TableHead className="text-right">Size</TableHead>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <TableHead key={i} className="text-right font-mono tabular-nums">
                          M{i}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.cohorts.map((c) => (
                      <TableRow key={c.cohortMonth}>
                        <TableCell className="font-mono">{c.cohortMonth}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {c.initialCount}
                        </TableCell>
                        {c.retention.map((r, i) => (
                          <TableCell
                            key={i}
                            className={cn(
                              'text-right font-mono tabular-nums',
                              cellColor(r),
                            )}
                          >
                            {formatPercent(r * 100, 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-muted-foreground mt-3 text-xs">
                Constant-rate decay (logo churn ≈ 1.3 % / month) applied because the mock DB has no
                real churn events. Real BE swaps this for event-driven cohort analysis.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
