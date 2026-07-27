import { useMemo } from 'react';
import type { Opportunity } from '@factory/shared';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrencyEUR, formatDate, formatNumber, formatPercent } from '@/lib/format';
import { accountHooks } from '@/features/crm/accounts/hooks';
import { opportunityHooks } from '@/features/crm/opportunities/hooks';
import { STAGE_LABEL, STAGE_VARIANT } from '@/features/crm/opportunities/stage';
import { usePeople } from '@/features/directory/hooks';
import {
  bucketByTier,
  FORECAST_TIER_DESCRIPTION,
  FORECAST_TIER_LABEL,
  FORECAST_TIER_ORDER,
  weighted,
  type ForecastTier,
} from './tiers';

const TIER_VARIANT: Record<ForecastTier, 'default' | 'secondary' | 'outline'> = {
  commit: 'default',
  forecast: 'secondary',
  upside: 'outline',
};

function DealsTable({ deals, tier }: { deals: Opportunity[]; tier: ForecastTier }) {
  const accounts = accountHooks.useList();
  const people = usePeople('employee');

  const accountName = useMemo(() => {
    const map = new Map((accounts.data ?? []).map((a) => [a.id, a.name] as const));
    return (id: string) => map.get(id) ?? '—';
  }, [accounts.data]);

  const ownerName = useMemo(() => {
    const map = new Map(
      (people.data ?? []).map((p) => [p.id, `${p.firstName} ${p.lastName}`] as const),
    );
    return (id: string | null) => (id ? (map.get(id) ?? '—') : 'Unassigned');
  }, [people.data]);

  const sorted = [...deals].sort((a, b) => b.amountCents - a.amountCents);
  const totalAmount = sorted.reduce((n, d) => n + d.amountCents, 0);
  const totalWeighted = sorted.reduce((n, d) => n + weighted(d.amountCents, d.probability), 0);

  if (deals.length === 0) {
    return (
      <div className="rounded-lg border p-4 text-center text-sm text-muted-foreground">
        No deals in {FORECAST_TIER_LABEL[tier]} right now.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Deal</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Prob.</TableHead>
            <TableHead className="text-right">Weighted</TableHead>
            <TableHead className="text-right">Close</TableHead>
            <TableHead>Owner</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((d) => (
            <TableRow key={d.id}>
              <TableCell className="font-medium">{d.name}</TableCell>
              <TableCell>{accountName(d.accountId)}</TableCell>
              <TableCell>
                <Badge variant={STAGE_VARIANT[d.stage]}>{STAGE_LABEL[d.stage]}</Badge>
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatCurrencyEUR(d.amountCents / 100)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatPercent(d.probability)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatCurrencyEUR(weighted(d.amountCents, d.probability) / 100)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatDate(d.expectedCloseDate)}
              </TableCell>
              <TableCell className="text-muted-foreground">{ownerName(d.ownerId)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3} className="font-medium">
              Subtotal
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {formatCurrencyEUR(totalAmount / 100)}
            </TableCell>
            <TableCell />
            <TableCell className="text-right font-mono tabular-nums">
              {formatCurrencyEUR(totalWeighted / 100)}
            </TableCell>
            <TableCell colSpan={2} />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}

export function ForecastPage() {
  const { data, isLoading, isError, error } = opportunityHooks.useList();

  const buckets = useMemo(() => bucketByTier(data ?? []), [data]);
  const totalWeighted =
    buckets.commit.weightedCents + buckets.forecast.weightedCents + buckets.upside.weightedCents;
  const totalDeals =
    buckets.commit.deals.length + buckets.forecast.deals.length + buckets.upside.deals.length;

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Forecast</h1>
        <p className="text-muted-foreground text-sm">
          Weighted view of open deals. Expand a tier to see the deals behind it.
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
          <AlertTitle>Could not load forecast</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Unknown error'}
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total forecast</CardTitle>
                <CardDescription>Commit + Forecast + Upside, weighted.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl tabular-nums">
                  {formatCurrencyEUR(totalWeighted / 100)}
                </div>
                <p className="text-muted-foreground text-xs">
                  <span className="font-mono tabular-nums">{formatNumber(totalDeals)}</span> deals
                </p>
              </CardContent>
            </Card>
            {FORECAST_TIER_ORDER.map((t) => (
              <Card key={t}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    <Badge variant={TIER_VARIANT[t]} className="mr-2">
                      {FORECAST_TIER_LABEL[t]}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{FORECAST_TIER_DESCRIPTION[t]}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="font-mono text-2xl tabular-nums">
                    {formatCurrencyEUR(buckets[t].weightedCents / 100)}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    <span className="font-mono tabular-nums">
                      {formatNumber(buckets[t].deals.length)}
                    </span>{' '}
                    deals ·{' '}
                    <span className="font-mono tabular-nums">
                      {formatCurrencyEUR(buckets[t].amountCents / 100)}
                    </span>{' '}
                    unweighted
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Deals behind the forecast</CardTitle>
              <CardDescription>Click a tier to expand the deal list.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" defaultValue={['commit']} className="w-full">
                {FORECAST_TIER_ORDER.map((t) => (
                  <AccordionItem key={t} value={t}>
                    <AccordionTrigger>
                      <div className="flex flex-1 items-center justify-between pr-2">
                        <div className="flex items-center gap-3">
                          <Badge variant={TIER_VARIANT[t]}>{FORECAST_TIER_LABEL[t]}</Badge>
                          <span className="text-muted-foreground text-sm">
                            {formatNumber(buckets[t].deals.length)} deals
                          </span>
                        </div>
                        <span className="font-mono text-sm tabular-nums">
                          {formatCurrencyEUR(buckets[t].weightedCents / 100)}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <DealsTable deals={buckets[t].deals} tier={t} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
