import { useMemo } from 'react';
import { OPPORTUNITY_STAGE_ORDER, type Opportunity } from '@factory/shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableShell } from '@/components/data/DataTableShell';
import { formatCurrencyEUR } from '@/lib/format';
import { opportunityHooks } from './hooks';
import { OpportunitiesTable } from './OpportunitiesTable';
import { STAGE_LABEL } from './stage';

function stageTotals(rows: Opportunity[]) {
  const totals = new Map<string, { count: number; sumCents: number }>();
  for (const stage of OPPORTUNITY_STAGE_ORDER) {
    totals.set(stage, { count: 0, sumCents: 0 });
  }
  for (const r of rows) {
    const t = totals.get(r.stage)!;
    t.count += 1;
    t.sumCents += r.amountCents;
  }
  return totals;
}

export function OpportunitiesPipeline() {
  const query = opportunityHooks.useList();
  const totals = useMemo(() => stageTotals(query.data ?? []), [query.data]);

  return (
    <DataTableShell {...query} emptyMessage="No opportunities yet.">
      {(all) => (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {OPPORTUNITY_STAGE_ORDER.map((s) => {
              const t = totals.get(s)!;
              return (
                <Card key={s}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{STAGE_LABEL[s]}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-mono text-xl tabular-nums">
                      {formatCurrencyEUR(t.sumCents / 100)}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      <span className="font-mono tabular-nums">{t.count}</span> deals
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              {OPPORTUNITY_STAGE_ORDER.map((s) => (
                <TabsTrigger key={s} value={s}>
                  {STAGE_LABEL[s]}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="all">
              <OpportunitiesTable rows={all} />
            </TabsContent>
            {OPPORTUNITY_STAGE_ORDER.map((s) => (
              <TabsContent key={s} value={s}>
                <OpportunitiesTable rows={all.filter((o) => o.stage === s)} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </DataTableShell>
  );
}
