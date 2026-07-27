import { useMemo } from 'react';
import type { OkrStatus } from '@factory/shared';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DataTableShell } from '@/components/data/DataTableShell';
import { formatDecimal } from '@/lib/format';
import { usePeople } from '@/features/directory/hooks';
import { keyResultHooks, objectiveHooks } from '@/features/okrs/hooks';

const STATUS_LABEL: Record<OkrStatus, string> = {
  on_track: 'On track',
  at_risk: 'At risk',
  off_track: 'Off track',
  done: 'Done',
};
const STATUS_VARIANT: Record<OkrStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  on_track: 'default',
  at_risk: 'secondary',
  off_track: 'destructive',
  done: 'outline',
};

export function OkrsPage() {
  const objectives = objectiveHooks.useList();
  const keyResults = keyResultHooks.useList();
  const people = usePeople();

  const ownerName = useMemo(() => {
    const map = new Map((people.data ?? []).map((p) => [p.id, `${p.firstName} ${p.lastName}`] as const));
    return (id: string | null) => (id ? (map.get(id) ?? '—') : 'Unassigned');
  }, [people.data]);

  const krData = keyResults.data;
  const krByObj = useMemo(() => {
    const map = new Map<string, typeof krData>();
    for (const kr of krData ?? []) {
      const list = map.get(kr.objectiveId) ?? [];
      list.push(kr);
      map.set(kr.objectiveId, list);
    }
    return map;
  }, [krData]);

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">OKRs</h1>
        <p className="text-muted-foreground text-sm">Objectives and key results, this period.</p>
      </header>

      <DataTableShell {...objectives} emptyMessage="No objectives yet.">
        {(rows) => (
          <div className="grid gap-4 md:grid-cols-2">
            {rows.map((o) => {
              const krs = krByObj.get(o.id) ?? [];
              return (
                <Card key={o.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{o.title}</CardTitle>
                      <Badge variant={STATUS_VARIANT[o.status]}>{STATUS_LABEL[o.status]}</Badge>
                    </div>
                    <CardDescription>
                      <span className="font-mono">{o.period}</span> · Owner {ownerName(o.ownerId)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {krs.map((kr) => {
                        const pct =
                          kr.target === 0 ? 0 : Math.min(100, Math.max(0, (kr.current / kr.target) * 100));
                        return (
                          <li key={kr.id}>
                            <div className="mb-1 flex items-center justify-between text-sm">
                              <span>{kr.title}</span>
                              <span className="font-mono tabular-nums">
                                {formatDecimal(kr.current)} / {formatDecimal(kr.target)}{' '}
                                <span className="text-muted-foreground">{kr.unit}</span>
                              </span>
                            </div>
                            <Progress value={pct} />
                          </li>
                        );
                      })}
                      {krs.length === 0 && (
                        <li className="text-muted-foreground text-sm">No key results yet.</li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </DataTableShell>
    </main>
  );
}
