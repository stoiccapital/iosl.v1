import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp } from 'lucide-react';
import type { Opportunity, OpportunityStage } from '@factory/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { accountHooks } from '../accounts/hooks';
import { opportunityHooks } from './hooks';
import { STAGE_LABEL, STAGE_VARIANT } from './stage';

type SortKey = 'name' | 'account' | 'stage' | 'amountCents' | 'expectedCloseDate';
type SortDir = 'asc' | 'desc';

const STAGE_ORDER: OpportunityStage[] = [
  'qualified',
  'trial',
  'decision',
  'proposal',
  'close_won',
  'close_lost',
];

export function OpportunitiesTable({ rows }: { rows: Opportunity[] }) {
  const accounts = accountHooks.useList();
  const [sortKey, setSortKey] = useState<SortKey>('expectedCloseDate');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const accountName = useMemo(() => {
    const map = new Map((accounts.data ?? []).map((a) => [a.id, a.name] as const));
    return (id: string) => map.get(id) ?? '—';
  }, [accounts.data]);

  const toggle = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'amountCents' ? 'desc' : 'asc');
    }
  };

  const sorted = useMemo(() => {
    const factor = sortDir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return factor * a.name.localeCompare(b.name);
        case 'account':
          return factor * accountName(a.accountId).localeCompare(accountName(b.accountId));
        case 'stage':
          return factor * (STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage));
        case 'amountCents':
          return factor * (a.amountCents - b.amountCents);
        case 'expectedCloseDate':
          return factor * a.expectedCloseDate.localeCompare(b.expectedCloseDate);
      }
    });
  }, [rows, sortKey, sortDir, accountName]);

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHead k="name" label="Name" sortKey={sortKey} sortDir={sortDir} onClick={toggle} />
            <SortableHead
              k="account"
              label="Account"
              sortKey={sortKey}
              sortDir={sortDir}
              onClick={toggle}
            />
            <SortableHead k="stage" label="Stage" sortKey={sortKey} sortDir={sortDir} onClick={toggle} />
            <SortableHead
              k="amountCents"
              label="Amount"
              align="right"
              sortKey={sortKey}
              sortDir={sortDir}
              onClick={toggle}
            />
            <SortableHead
              k="expectedCloseDate"
              label="Close date"
              align="right"
              sortKey={sortKey}
              sortDir={sortDir}
              onClick={toggle}
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No opportunities match.
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">
                  <Link
                    to={`/crm/opportunities/${o.id}`}
                    className="hover:underline focus:underline focus:outline-none"
                  >
                    {o.name}
                  </Link>
                </TableCell>
                <TableCell>{accountName(o.accountId)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1">
                    <Badge variant={STAGE_VARIANT[o.stage]}>{STAGE_LABEL[o.stage]}</Badge>
                    {o.stage === 'proposal' && (
                      <Badge
                        variant={o.contractSigned ? 'default' : 'outline'}
                        className="text-[10px]"
                      >
                        {o.contractSigned ? 'Signed' : 'Unsigned'}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatCurrencyEUR(o.amountCents / 100)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatDate(o.expectedCloseDate)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function SortableHead({
  k,
  label,
  sortKey,
  sortDir,
  onClick,
  align,
}: {
  k: SortKey;
  label: string;
  sortKey: SortKey;
  sortDir: SortDir;
  onClick: (k: SortKey) => void;
  align?: 'left' | 'right';
}) {
  const active = sortKey === k;
  return (
    <TableHead className={align === 'right' ? 'text-right' : undefined}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={
          'h-7 px-1 text-[11px] font-medium uppercase tracking-wide ' +
          (align === 'right' ? 'ml-auto flex' : '')
        }
        onClick={() => onClick(k)}
      >
        {label}
        {active &&
          (sortDir === 'asc' ? (
            <ArrowUp className="ml-1 h-3 w-3" />
          ) : (
            <ArrowDown className="ml-1 h-3 w-3" />
          ))}
      </Button>
    </TableHead>
  );
}

export function OpportunitiesTableWrapper() {
  const query = opportunityHooks.useList();
  return (
    <DataTableShell {...query} emptyMessage="No opportunities yet.">
      {(rows) => <OpportunitiesTable rows={rows} />}
    </DataTableShell>
  );
}
