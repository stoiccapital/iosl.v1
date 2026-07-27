import { useMemo } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PnlMonth } from '@factory/shared';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrencyEUR, formatPercent } from '@/lib/format';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatCard } from '@/features/finance/StatCard';
import { usePnl } from '@/features/finance/hooks';
import { CHART_MUTED, CHART_PRIMARY, tooltipEur, tooltipEurTick } from '@/features/bi/chart-theme';

type LineRow = {
  key: string;
  label: string;
  values: number[];
  emphasis?: 'strong' | 'muted';
  format?: 'currency' | 'percent';
};

function marginPct(numer: number, denom: number): number {
  if (denom === 0) return 0;
  return (numer / denom) * 100;
}

function buildRows(months: PnlMonth[]): LineRow[] {
  const revenue = months.map((m) => m.revenueCents);
  const cogs = months.map((m) => m.cogsCents);
  const gp = months.map((m) => m.grossProfitCents);
  const rnd = months.map((m) => m.rndCents);
  const sm = months.map((m) => m.smCents);
  const ga = months.map((m) => m.gaCents);
  const opex = months.map((m) => m.opexCents);
  const opi = months.map((m) => m.operatingIncomeCents);

  return [
    { key: 'revenue', label: 'Revenue', values: revenue, format: 'currency', emphasis: 'strong' },
    { key: 'cogs', label: 'Cost of Revenue', values: cogs, format: 'currency' },
    { key: 'gp', label: 'Gross Profit', values: gp, format: 'currency', emphasis: 'strong' },
    {
      key: 'gpm',
      label: 'Gross Margin',
      values: gp.map((g, i) => marginPct(g, revenue[i] ?? 0)),
      format: 'percent',
      emphasis: 'muted',
    },
    { key: 'rnd', label: 'R&D', values: rnd, format: 'currency' },
    { key: 'sm', label: 'S&M', values: sm, format: 'currency' },
    { key: 'ga', label: 'G&A', values: ga, format: 'currency' },
    { key: 'opex', label: 'Operating Expenses', values: opex, format: 'currency', emphasis: 'strong' },
    {
      key: 'opi',
      label: 'Operating Income',
      values: opi,
      format: 'currency',
      emphasis: 'strong',
    },
    {
      key: 'opm',
      label: 'Operating Margin',
      values: opi.map((v, i) => marginPct(v, revenue[i] ?? 0)),
      format: 'percent',
      emphasis: 'muted',
    },
  ];
}

function formatValue(v: number, format: LineRow['format']): string {
  if (format === 'percent') return formatPercent(v, 1);
  return formatCurrencyEUR(v / 100);
}

export function PnlPage() {
  const { data, isLoading, isError, error } = usePnl(6);

  const rows = useMemo(() => (data ? buildRows(data.months) : []), [data]);
  const latest = data?.months.at(-1);
  const opMarginLatest = latest ? marginPct(latest.operatingIncomeCents, latest.revenueCents) : 0;

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">P&amp;L</h1>
        <p className="text-muted-foreground text-sm">
          Monthly profit &amp; loss — revenue from active subscriptions, costs classified from
          suppliers and payroll into COGS · R&amp;D · S&amp;M · G&amp;A.
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
          <AlertTitle>Could not load P&amp;L</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : ''}</AlertDescription>
        </Alert>
      )}

      {data && latest && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Revenue"
              value={formatCurrencyEUR(latest.revenueCents / 100)}
              hint="Current month"
            />
            <StatCard
              label="Operating Income"
              value={formatCurrencyEUR(latest.operatingIncomeCents / 100)}
              hint="Current month"
            />
            <StatCard
              label="Operating Margin"
              value={formatPercent(opMarginLatest, 1)}
              hint="Current month"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Operating Income — last 6 months</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={data.months.map((m) => ({
                    month: m.month,
                    revenue: m.revenueCents / 100,
                    operatingIncome: m.operatingIncomeCents / 100,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={tooltipEurTick} />
                  <Tooltip formatter={tooltipEur} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill={CHART_MUTED} />
                  <Line
                    type="monotone"
                    dataKey="operatingIncome"
                    name="Operating Income"
                    stroke={CHART_PRIMARY}
                    strokeWidth={2}
                    dot
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Line</TableHead>
                  {data.months.map((m) => (
                    <TableHead key={m.month} className="text-right font-mono tabular-nums">
                      {m.month}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.key}>
                    <TableCell
                      className={cn(
                        r.emphasis === 'strong' && 'font-semibold',
                        r.emphasis === 'muted' && 'text-muted-foreground',
                      )}
                    >
                      {r.label}
                    </TableCell>
                    {r.values.map((v, i) => (
                      <TableCell
                        key={i}
                        className={cn(
                          'text-right font-mono tabular-nums',
                          r.emphasis === 'strong' && 'font-semibold',
                          r.emphasis === 'muted' && 'text-muted-foreground',
                        )}
                      >
                        {formatValue(v, r.format)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <p className="text-muted-foreground text-xs">
            Monthly ramp is synthesized because the mock DB only tracks current state — the BE
            will replace this with real monthly ledger entries.
          </p>
        </div>
      )}
    </main>
  );
}
