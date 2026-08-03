import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp } from 'lucide-react';
import type { Account } from '@factory/shared';
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
import { TableToolbar } from '@/components/data/TableToolbar';
import { AccountDialog } from './AccountDialog';
import { accountHooks } from './hooks';

type SortKey = 'name' | 'industry' | 'size' | 'country';
type SortDir = 'asc' | 'desc';

const SIZE_ORDER = ['1-10', '11-50', '51-200', '201+'];

export function AccountsTable() {
  const query = accountHooks.useList();
  const remove = accountHooks.useRemove();
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const filtered = useMemo(() => {
    const rows = query.data ?? [];
    if (!q.trim()) return rows;
    const needle = q.toLowerCase();
    return rows.filter((a) =>
      [a.name, a.industry, a.country, a.summaryNote].some((v) =>
        (v ?? '').toLowerCase().includes(needle),
      ),
    );
  }, [q, query.data]);

  const sorted = useMemo(() => {
    const factor = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return factor * a.name.localeCompare(b.name);
        case 'industry':
          return factor * a.industry.localeCompare(b.industry);
        case 'size':
          return factor * (SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size));
        case 'country':
          return factor * a.country.localeCompare(b.country);
      }
    });
  }, [filtered, sortKey, sortDir]);

  const toggle = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <DataTableShell {...query} emptyMessage="No accounts yet.">
      {() => (
        <div>
          <TableToolbar query={q} onQueryChange={setQ} placeholder="Filter accounts…" />
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead
                    k="name"
                    label="Name"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onClick={toggle}
                  />
                  <SortableHead
                    k="industry"
                    label="Industry"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onClick={toggle}
                  />
                  <SortableHead
                    k="size"
                    label="Size"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onClick={toggle}
                  />
                  <SortableHead
                    k="country"
                    label="Country"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onClick={toggle}
                  />
                  <TableHead>Website</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No accounts match.
                    </TableCell>
                  </TableRow>
                ) : (
                  sorted.map((a) => (
                    <AccountRow key={a.id} account={a} onDelete={(id) => remove.mutate(id, {
                      onSuccess: () => toast.success('Account deleted'),
                      onError: (err) =>
                        toast.error('Could not delete account', {
                          description: err instanceof Error ? err.message : 'Unknown error',
                        }),
                    })} />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </DataTableShell>
  );
}

function AccountRow({
  account,
  onDelete,
}: {
  account: Account;
  onDelete: (id: string) => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <Link
          to={`/crm/accounts/${account.id}`}
          className="hover:underline focus:underline focus:outline-none"
        >
          {account.name}
        </Link>
      </TableCell>
      <TableCell>{account.industry}</TableCell>
      <TableCell className="font-mono tabular-nums">{account.size}</TableCell>
      <TableCell>{account.country}</TableCell>
      <TableCell className="text-muted-foreground max-w-[200px] truncate">
        {account.website ?? '—'}
      </TableCell>
      <TableCell className="text-right">
        <AccountDialog
          mode="edit"
          account={account}
          trigger={
            <Button size="sm" variant="ghost">
              Edit
            </Button>
          }
        />
        <Button size="sm" variant="ghost" onClick={() => onDelete(account.id)}>
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
}

function SortableHead({
  k,
  label,
  sortKey,
  sortDir,
  onClick,
}: {
  k: SortKey;
  label: string;
  sortKey: SortKey;
  sortDir: SortDir;
  onClick: (k: SortKey) => void;
}) {
  const active = sortKey === k;
  return (
    <TableHead>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-1 text-[11px] font-medium uppercase tracking-wide"
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
