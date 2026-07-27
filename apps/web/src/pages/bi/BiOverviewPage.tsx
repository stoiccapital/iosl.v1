import type { ReactNode } from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrencyEUR, formatDecimal, formatNumber, formatPercent } from '@/lib/format';
import { CHART_PRIMARY } from '@/features/bi/chart-theme';
import { useBiOverview } from '@/features/bi/hooks';

function KpiCard({
  label,
  value,
  hint,
  spark,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  spark?: number[];
}) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <CardDescription className="min-h-[1rem]">{hint ?? '\u00A0'}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto space-y-2">
        <div className="font-mono text-2xl tabular-nums">{value}</div>
        {spark && spark.length > 1 && (
          <div style={{ height: 32 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spark.map((v, i) => ({ i, v }))}>
                <Line type="monotone" dataKey="v" stroke={CHART_PRIMARY} strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function bpsToPercent(bps: number): number {
  return bps / 100;
}

export function BiOverviewPage() {
  const { data, isLoading, isError, error } = useBiOverview();

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground text-sm">
          Executive KPI snapshot. Numbers refresh whenever underlying data changes.
        </p>
      </header>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      )}
      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Could not load overview</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : ''}</AlertDescription>
        </Alert>
      )}
      {data && (
        <div className="space-y-8">
          <section>
            <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
              Growth
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <KpiCard
                label="MRR"
                value={formatCurrencyEUR(data.mrrCents / 100)}
                hint="Monthly recurring"
                spark={data.mrrSpark}
              />
              <KpiCard
                label="ARR"
                value={formatCurrencyEUR(data.arrCents / 100)}
                hint="Annualized"
              />
              <KpiCard
                label="Committed ARR"
                value={formatCurrencyEUR(data.committedArrCents / 100)}
                hint="Signed opportunities"
              />
            </div>
          </section>

          <section>
            <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
              Retention
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <KpiCard
                label="NRR"
                value={formatPercent(bpsToPercent(data.nrrBps), 1)}
                hint="Target ≥ 110 %"
              />
              <KpiCard
                label="GRR"
                value={formatPercent(bpsToPercent(data.grrBps), 1)}
                hint="Target ≥ 90 %"
              />
              <KpiCard
                label="Logo churn"
                value={formatPercent(bpsToPercent(data.logoChurnBps), 2)}
                hint="Monthly rate"
              />
            </div>
          </section>

          <section>
            <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
              Efficiency
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <KpiCard
                label="Rule of 40"
                value={formatPercent(bpsToPercent(data.ruleOf40Bps), 0)}
                hint="Growth % + margin %"
              />
              <KpiCard
                label="Magic number"
                value={formatDecimal(data.magicNumber)}
                hint="Net new ARR / prior S&M"
              />
              <KpiCard
                label="CAC payback"
                value={`${formatDecimal(data.paybackMonths)} mo`}
                hint="Target < 12 months"
              />
            </div>
          </section>

          <section>
            <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
              Unit economics
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <KpiCard label="CAC" value={formatCurrencyEUR(data.cacCents / 100)} />
              <KpiCard label="LTV" value={formatCurrencyEUR(data.ltvCents / 100)} />
              <KpiCard
                label="LTV / CAC"
                value={`${formatDecimal(data.ltvCacRatio)}×`}
                hint="Target ≥ 3×"
              />
            </div>
          </section>

          <section>
            <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
              Runway
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <KpiCard
                label="Cash balance"
                value={formatCurrencyEUR(data.cashBalanceCents / 100)}
              />
              <KpiCard
                label="Monthly burn"
                value={formatCurrencyEUR(data.monthlyBurnCents / 100)}
                hint="Net of MRR"
              />
              <KpiCard
                label="Runway"
                value={
                  data.runwayMonths >= 999
                    ? '∞'
                    : `${formatNumber(Math.round(data.runwayMonths))} mo`
                }
                hint="Cash / burn"
              />
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
