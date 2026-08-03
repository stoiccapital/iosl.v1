import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import type { ExpenseCategory } from '@factory/shared';
import { supplierHooks } from '@/features/suppliers/hooks';
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
import { TableToolbar } from '@/components/data/TableToolbar';
import { formatCurrencyEUR, formatDate } from '@/lib/format';
import { expenseHooks } from '@/features/finance/expense-hooks';
import { ExpenseDialog } from '@/features/finance/ExpenseDialog';

const CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  travel: 'Travel',
  software: 'Software',
  office: 'Office',
  meals: 'Meals',
  training: 'Training',
  marketing: 'Marketing',
  legal: 'Legal',
  other: 'Other',
};

export function ExpensesPage() {
  const query = expenseHooks.useList();
  const remove = expenseHooks.useRemove();
  const suppliers = supplierHooks.useList();
  const supplierName = useMemo(() => {
    const map = new Map((suppliers.data ?? []).map((s) => [s.id, s.name] as const));
    return (id: string | null, fallback: string) => (id ? map.get(id) ?? fallback : fallback);
  }, [suppliers.data]);
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const rows = query.data ?? [];
    if (!q.trim()) return rows;
    const n = q.toLowerCase();
    return rows.filter(
      (e) =>
        e.description.toLowerCase().includes(n) ||
        e.vendorName.toLowerCase().includes(n) ||
        (e.note ?? '').toLowerCase().includes(n),
    );
  }, [q, query.data]);

  const sorted = useMemo(
    () => filtered.slice().sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1)),
    [filtered],
  );

  const totalCents = sorted.reduce((s, e) => s + e.amountCents, 0);

  return (
    <main className="container py-8">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground text-sm">
            One-off costs. Recurring vendor spend belongs in Suppliers, salaries in HR/Payroll.
          </p>
        </div>
        <ExpenseDialog
          mode="create"
          trigger={
            <Button>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add expense
            </Button>
          }
        />
      </header>

      <DataTableShell {...query} emptyMessage="No expenses yet.">
        {() => (
          <div>
            <TableToolbar
              query={q}
              onQueryChange={setQ}
              placeholder="Filter by description, vendor, note…"
              right={
                <div className="text-xs text-muted-foreground">
                  Total{' '}
                  <span className="font-mono tabular-nums text-foreground">
                    {formatCurrencyEUR(totalCents / 100)}
                  </span>{' '}
                  ·{' '}
                  <span className="font-mono tabular-nums text-foreground">{sorted.length}</span>{' '}
                  items
                </div>
              }
            />
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No expenses match.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sorted.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.description}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {supplierName(e.supplierId, e.vendorName) || '—'}
                          {!e.supplierId && e.vendorName && (
                            <span className="ml-1 text-[10px] uppercase tracking-wide text-muted-foreground/70">
                              (one-off)
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">
                            {CATEGORY_LABEL[e.category]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {formatCurrencyEUR(e.amountCents / 100)}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {formatDate(e.occurredAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <ExpenseDialog
                            mode="edit"
                            expense={e}
                            trigger={
                              <Button size="sm" variant="ghost">
                                Edit
                              </Button>
                            }
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              remove.mutate(e.id, {
                                onSuccess: () => toast.success('Expense deleted'),
                                onError: (err) =>
                                  toast.error('Could not delete expense', {
                                    description:
                                      err instanceof Error ? err.message : 'Unknown error',
                                  }),
                              })
                            }
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DataTableShell>
    </main>
  );
}
