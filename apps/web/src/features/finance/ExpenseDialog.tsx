import { useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import {
  ExpenseCategorySchema,
  type CreateExpenseInput,
  type Expense,
  type ExpenseCategory,
} from '@factory/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EurInput } from '@/components/data/EurInput';
import { supplierHooks } from '@/features/suppliers/hooks';
import { expenseHooks } from './expense-hooks';

const OTHER_VENDOR = '__other';

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

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}
function fromDateInputValue(v: string): string {
  return new Date(`${v}T00:00:00.000Z`).toISOString();
}

type Mode = { mode: 'create' } | { mode: 'edit'; expense: Expense };

export function ExpenseDialog(props: Mode & { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        {props.mode === 'create' ? (
          <Body onDone={() => setOpen(false)} />
        ) : (
          <Body expense={props.expense} onDone={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Body({ expense, onDone }: { expense?: Expense; onDone: () => void }) {
  const create = expenseHooks.useCreate();
  const update = expenseHooks.useUpdate(expense?.id ?? '');
  const suppliersQuery = supplierHooks.useList();
  const activeSuppliers = (suppliersQuery.data ?? [])
    .filter((s) => s.active)
    .sort((a, b) => a.name.localeCompare(b.name));

  const [description, setDescription] = useState(expense?.description ?? '');
  const [supplierId, setSupplierId] = useState<string | null>(expense?.supplierId ?? null);
  const [vendorName, setVendorName] = useState(expense?.vendorName ?? '');
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? 'other');
  const [amountCents, setAmountCents] = useState<number>(expense?.amountCents ?? 0);
  const [occurredAt, setOccurredAt] = useState<string>(
    expense?.occurredAt ?? new Date().toISOString(),
  );
  const [note, setNote] = useState<string>(expense?.note ?? '');

  useEffect(() => {
    if (!expense) return;
    setDescription(expense.description);
    setSupplierId(expense.supplierId);
    setVendorName(expense.vendorName);
    setCategory(expense.category);
    setAmountCents(expense.amountCents);
    setOccurredAt(expense.occurredAt);
    setNote(expense.note ?? '');
  }, [expense]);

  const isOther = supplierId === null;

  const handleVendorChange = (v: string) => {
    if (v === OTHER_VENDOR) {
      setSupplierId(null);
      setVendorName(expense?.supplierId ? '' : vendorName);
      return;
    }
    const supplier = activeSuppliers.find((s) => s.id === v);
    if (supplier) {
      setSupplierId(supplier.id);
      setVendorName(supplier.name);
    }
  };

  const canSave =
    description.trim().length > 0 && amountCents > 0 && (!isOther || vendorName.trim().length > 0);
  const isPending = expense ? update.isPending : create.isPending;

  const handleSave = () => {
    const payload: CreateExpenseInput = {
      description,
      supplierId,
      vendorName,
      category,
      amountCents,
      occurredAt,
      paidById: null,
      note: note.trim() ? note : null,
    };
    const done = () => {
      toast.success(expense ? 'Expense updated' : 'Expense added');
      onDone();
    };
    const err = (e: Error) =>
      toast.error(expense ? 'Could not update expense' : 'Could not add expense', {
        description: e.message,
      });
    if (expense) update.mutate(payload, { onSuccess: done, onError: err });
    else create.mutate(payload, { onSuccess: done, onError: err });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{expense ? 'Edit expense' : 'Add expense'}</DialogTitle>
        <DialogDescription>
          One-off costs (a taxi, a book, a single-seat SaaS). Recurring vendor spend belongs in
          Suppliers.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-1">
        <Label>Description</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this?"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Vendor</Label>
          <Select
            value={supplierId ?? OTHER_VENDOR}
            onValueChange={handleVendorChange}
            disabled={suppliersQuery.isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pick a supplier…" />
            </SelectTrigger>
            <SelectContent>
              {activeSuppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
              <SelectItem value={OTHER_VENDOR}>Other…</SelectItem>
            </SelectContent>
          </Select>
          {isOther && (
            <Input
              className="mt-2"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="Vendor name (one-off — not in supplier list)"
            />
          )}
        </div>
        <div className="space-y-1">
          <Label>Category</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ExpenseCategorySchema.options.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Amount</Label>
          <EurInput valueCents={amountCents} onChangeCents={setAmountCents} />
        </div>
        <div className="space-y-1">
          <Label>Date</Label>
          <Input
            type="date"
            className="font-mono tabular-nums"
            value={toDateInputValue(occurredAt)}
            onChange={(e) => setOccurredAt(fromDateInputValue(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Note</Label>
        <Textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional context — receipt info, project, etc."
        />
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onDone} disabled={isPending}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!canSave || isPending}>
          {isPending ? 'Saving…' : expense ? 'Save' : 'Add expense'}
        </Button>
      </DialogFooter>
    </>
  );
}
