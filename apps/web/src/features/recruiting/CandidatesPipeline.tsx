import { useMemo } from 'react';
import { toast } from 'sonner';
import { CANDIDATE_STAGE_ORDER, type Candidate } from '@factory/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTableShell } from '@/components/data/DataTableShell';
import { formatDate, formatNumber } from '@/lib/format';
import { candidateHooks, positionHooks } from './hooks';
import { CANDIDATE_SOURCE_LABEL, CANDIDATE_STAGE_LABEL, CANDIDATE_STAGE_VARIANT } from './labels';
import { CandidateDialog } from './CandidateDialog';

function CandidatesTable({ rows }: { rows: Candidate[] }) {
  const positions = positionHooks.useList();
  const remove = candidateHooks.useRemove();

  const positionTitle = useMemo(() => {
    const map = new Map((positions.data ?? []).map((p) => [p.id, p.title] as const));
    return (id: string) => map.get(id) ?? '—';
  }, [positions.data]);

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Source</TableHead>
            <TableHead className="text-right">Applied</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.firstName} {c.lastName}</TableCell>
              <TableCell>{positionTitle(c.positionId)}</TableCell>
              <TableCell>
                <Badge variant={CANDIDATE_STAGE_VARIANT[c.stage]}>{CANDIDATE_STAGE_LABEL[c.stage]}</Badge>
              </TableCell>
              <TableCell>{CANDIDATE_SOURCE_LABEL[c.source]}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{formatDate(c.appliedAt)}</TableCell>
              <TableCell className="text-right">
                <CandidateDialog mode="edit" candidate={c} trigger={<Button size="sm" variant="ghost">Edit</Button>} />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    remove.mutate(c.id, {
                      onSuccess: () => toast.success('Deleted'),
                      onError: (err) => toast.error('Failed', { description: err instanceof Error ? err.message : '' }),
                    })
                  }
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function CandidatesPipeline() {
  const query = candidateHooks.useList();
  const totals = useMemo(() => {
    const t = new Map<string, number>();
    for (const s of CANDIDATE_STAGE_ORDER) t.set(s, 0);
    for (const c of query.data ?? []) t.set(c.stage, (t.get(c.stage) ?? 0) + 1);
    return t;
  }, [query.data]);

  return (
    <DataTableShell {...query} emptyMessage="No candidates yet.">
      {(all) => (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
            {CANDIDATE_STAGE_ORDER.map((s) => (
              <Card key={s}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{CANDIDATE_STAGE_LABEL[s]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-mono text-2xl tabular-nums">{formatNumber(totals.get(s) ?? 0)}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              {CANDIDATE_STAGE_ORDER.map((s) => (
                <TabsTrigger key={s} value={s}>
                  {CANDIDATE_STAGE_LABEL[s]}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="all"><CandidatesTable rows={all} /></TabsContent>
            {CANDIDATE_STAGE_ORDER.map((s) => (
              <TabsContent key={s} value={s}>
                <CandidatesTable rows={all.filter((c) => c.stage === s)} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </DataTableShell>
  );
}
