import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrencyEUR } from '@/lib/format';
import {
  CHART_LIGHT,
  CHART_PRIMARY,
  colorAt,
  tooltipEur,
  tooltipEurTick,
} from '@/features/bi/chart-theme';
import { useBiCosts } from '@/features/bi/hooks';

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

export function BiCostsPage() {
  const { data, isLoading, isError, error } = useBiCosts();
  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Cost breakdown</h1>
        <p className="text-muted-foreground text-sm">Where costs come from — suppliers, payroll, categories.</p>
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
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Monthly cost</CardTitle></CardHeader>
            <CardContent><div className="font-mono text-2xl tabular-nums">{formatCurrencyEUR(data.monthlyCents / 100)}</div></CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>By category</CardTitle></CardHeader>
              <CardContent style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.byCategory.map((r) => ({ name: CATEGORY_LABEL[r.category] ?? r.category, value: r.monthlyCents / 100 }))}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label
                    >
                      {data.byCategory.map((_, i) => (
                        <Cell key={i} fill={colorAt(i)} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={tooltipEur} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>By source</CardTitle></CardHeader>
              <CardContent style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.bySource.map((r) => ({ name: r.source, value: r.monthlyCents / 100 }))}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} tickFormatter={tooltipEurTick} />
                    <Tooltip formatter={tooltipEur} />
                    <Bar dataKey="value" fill={CHART_PRIMARY} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Monthly cost — last 6 months</CardTitle></CardHeader>
            <CardContent style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlySeries.map((r) => ({ month: r.month, cost: r.monthlyCents / 100 }))}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={tooltipEurTick} />
                  <Tooltip formatter={tooltipEur} />
                  <Area type="monotone" dataKey="cost" stroke={CHART_PRIMARY} fill={CHART_LIGHT} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
