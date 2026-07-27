import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CHART_MUTED,
  CHART_PRIMARY,
  CHART_SLATE,
  tooltipEur,
  tooltipEurTick,
} from '@/features/bi/chart-theme';
import { useBiRevenue } from '@/features/bi/hooks';

export function BiRevenuePage() {
  const { data, isLoading, isError, error } = useBiRevenue();
  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Revenue insights</h1>
        <p className="text-muted-foreground text-sm">
          MRR over time, by product, and by movement type (new / expansion / contraction / churn).
        </p>
      </header>

      {isLoading && <Skeleton className="h-64" />}
      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Could not load view</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : ''}</AlertDescription>
        </Alert>
      )}
      {data && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>MRR — last 6 months</CardTitle>
              </CardHeader>
              <CardContent style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.monthlySeries.map((r) => ({
                      month: r.month,
                      mrr: r.mrrCents / 100,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} tickFormatter={tooltipEurTick} />
                    <Tooltip formatter={tooltipEur} />
                    <Line
                      type="monotone"
                      dataKey="mrr"
                      stroke={CHART_PRIMARY}
                      strokeWidth={2}
                      dot
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>MRR by product</CardTitle>
              </CardHeader>
              <CardContent style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.byProduct.map((r) => ({
                      name: r.productName,
                      mrr: r.mrrCents / 100,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} tickFormatter={tooltipEurTick} />
                    <Tooltip formatter={tooltipEur} />
                    <Bar dataKey="mrr" fill={CHART_PRIMARY} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>MRR movement</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.movement.map((r) => ({
                    month: r.month,
                    new: r.newCents / 100,
                    expansion: r.expansionCents / 100,
                    contraction: r.contractionCents / 100,
                    churn: r.churnCents / 100,
                    net: r.netCents / 100,
                  }))}
                  stackOffset="sign"
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={tooltipEurTick} />
                  <Tooltip formatter={tooltipEur} />
                  <Legend />
                  <Bar dataKey="new" name="New" stackId="mov" fill={CHART_PRIMARY} />
                  <Bar dataKey="expansion" name="Expansion" stackId="mov" fill={CHART_SLATE} />
                  <Bar dataKey="contraction" name="Contraction" stackId="mov" fill={CHART_MUTED} />
                  <Bar dataKey="churn" name="Churn" stackId="mov" fill="#c94b4b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
