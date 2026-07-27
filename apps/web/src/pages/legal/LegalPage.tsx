import { useMemo } from 'react';
import type { LegalDocumentStatus, LegalDocumentType } from '@factory/shared';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTableShell } from '@/components/data/DataTableShell';
import { formatCurrencyEUR, formatDate } from '@/lib/format';
import { accountHooks } from '@/features/crm/accounts/hooks';
import { legalHooks } from '@/features/legal/hooks';

const TYPE_LABEL: Record<LegalDocumentType, string> = {
  msa: 'MSA',
  order_form: 'Order form',
  sow: 'SOW',
  nda: 'NDA',
  dpa: 'DPA',
  other: 'Other',
};
const STATUS_LABEL: Record<LegalDocumentStatus, string> = {
  drafting: 'Drafting',
  in_review: 'In review',
  signed: 'Signed',
  expired: 'Expired',
  terminated: 'Terminated',
};
const STATUS_VARIANT: Record<LegalDocumentStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  drafting: 'outline',
  in_review: 'secondary',
  signed: 'default',
  expired: 'destructive',
  terminated: 'destructive',
};

export function LegalPage() {
  const query = legalHooks.useList();
  const accounts = accountHooks.useList();
  const accountName = useMemo(() => {
    const map = new Map((accounts.data ?? []).map((a) => [a.id, a.name] as const));
    return (id: string | null) => (id ? (map.get(id) ?? '—') : 'Internal');
  }, [accounts.data]);

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Legal</h1>
        <p className="text-muted-foreground text-sm">Customer contracts and legal documents.</p>
      </header>
      <DataTableShell {...query} emptyMessage="No legal documents yet.">
        {(rows) => (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Effective</TableHead>
                  <TableHead className="text-right">Until</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>{accountName(d.accountId)}</TableCell>
                    <TableCell>{TYPE_LABEL[d.type]}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {d.valueCents > 0 ? formatCurrencyEUR(d.valueCents / 100) : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[d.status]}>{STATUS_LABEL[d.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{formatDate(d.effectiveFrom)}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {d.effectiveTo ? formatDate(d.effectiveTo) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DataTableShell>
    </main>
  );
}
