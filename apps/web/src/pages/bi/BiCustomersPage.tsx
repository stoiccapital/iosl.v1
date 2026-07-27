import {
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrencyEUR, formatNumber, formatPercent } from '@/lib/format';
import { CHART_PRIMARY, colorAt, tooltipEur, tooltipEurTick } from '@/features/bi/chart-theme';
import { useBiCustomers } from '@/features/bi/hooks';

export function BiCustomersPage() {
  const { data, isLoading, isError, error } = useBiCustomers();
  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Customer insights</h1>
        <p className="text-muted-foreground text-sm">Where customers are and how much revenue they contribute.</p>
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
          <AlertTitle>Could not load view</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : ''}</AlertDescription>
        </Alert>
      )}
      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total customers</CardTitle></CardHeader>
              <CardContent><div className="font-mono text-2xl tabular-nums">{formatNumber(data.totalCustomers)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active</CardTitle></CardHeader>
              <CardContent><div className="font-mono text-2xl tabular-nums">{formatNumber(data.activeCustomers)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">MRR</CardTitle></CardHeader>
              <CardContent><div className="font-mono text-2xl tabular-nums">{formatCurrencyEUR(data.totalMrrCents / 100)}</div></CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>MRR by country</CardTitle></CardHeader>
              <CardContent style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.byCountry.map((r) => ({ name: r.country, mrr: r.mrrCents / 100 }))}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} tickFormatter={tooltipEurTick} />
                    <Tooltip formatter={tooltipEur} />
                    <Bar dataKey="mrr" fill={CHART_PRIMARY} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Customers by country</CardTitle></CardHeader>
              <CardContent style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.byCountry.map((r) => ({ name: r.country, value: r.customers }))}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label
                    >
                      {data.byCountry.map((_, i) => (
                        <Cell key={i} fill={colorAt(i)} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Product attach</CardTitle>
                <p className="text-muted-foreground text-xs">
                  How many products each customer subscribes to.
                </p>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Products / customer</TableHead>
                        <TableHead className="text-right">Customers</TableHead>
                        <TableHead className="text-right">MRR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.attach.map((r) => (
                        <TableRow key={r.productCount}>
                          <TableCell className="font-mono">{r.productCount}</TableCell>
                          <TableCell className="text-right font-mono tabular-nums">
                            {formatNumber(r.customerCount)}
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

            <Card>
              <CardHeader>
                <CardTitle>Concentration risk</CardTitle>
                <p className="text-muted-foreground text-xs">
                  Top-10 accounts as a share of total MRR. Under 30 % is safe; over 50 % is
                  concentration risk.
                </p>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-4xl tabular-nums">
                  {formatPercent(data.concentration.top10ShareBps / 100, 1)}
                </div>
                <p className="text-muted-foreground mt-2 text-xs">of MRR from top-10 accounts</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Top accounts by MRR</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">MRR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topAccounts.map((r) => (
                      <TableRow key={r.accountName}>
                        <TableCell className="font-medium">{r.accountName}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums">{formatCurrencyEUR(r.mrrCents / 100)}</TableCell>
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
