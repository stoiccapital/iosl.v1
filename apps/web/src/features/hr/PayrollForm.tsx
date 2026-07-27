import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  CreatePayrollEntryInputSchema,
  PayrollCadenceSchema,
  type CreatePayrollEntryInput,
  type PayrollEntry,
} from '@factory/shared';
import { Button } from '@/components/ui/button';
import { EurInput } from '@/components/data/EurInput';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePeople } from '@/features/directory/hooks';

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}
function fromDateInputValue(v: string): string {
  return new Date(`${v}T00:00:00.000Z`).toISOString();
}

const CADENCE_LABEL: Record<'monthly' | 'one_time', string> = {
  monthly: 'Monthly',
  one_time: 'One-time',
};

export function PayrollForm({
  defaultValues,
  submitting,
  submitLabel = 'Save',
  onSubmit,
  onCancel,
}: {
  defaultValues?: Partial<PayrollEntry>;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (v: CreatePayrollEntryInput) => void;
  onCancel?: () => void;
}) {
  const people = usePeople();

  const form = useForm<CreatePayrollEntryInput>({
    resolver: zodResolver(CreatePayrollEntryInputSchema),
    defaultValues: {
      personId: defaultValues?.personId ?? '',
      grossAmountCents: defaultValues?.grossAmountCents ?? 0,
      effectiveDate: defaultValues?.effectiveDate ?? new Date().toISOString(),
      cadence: defaultValues?.cadence ?? 'monthly',
      note: defaultValues?.note ?? '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="personId" render={({ field }) => (
          <FormItem>
            <FormLabel>Person</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
              <SelectContent>
                {(people.data ?? []).filter((p) => p.type !== 'candidate').map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} — {p.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="grossAmountCents" render={({ field }) => (
            <FormItem>
              <FormLabel>Gross amount (EUR)</FormLabel>
              <FormControl>
                <EurInput valueCents={field.value} onChangeCents={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="cadence" render={({ field }) => (
            <FormItem>
              <FormLabel>Cadence</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {PayrollCadenceSchema.options.map((v) => (
                    <SelectItem key={v} value={v}>{CADENCE_LABEL[v]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="effectiveDate" render={({ field }) => (
          <FormItem>
            <FormLabel>Effective from</FormLabel>
            <FormControl>
              <Input
                type="date"
                className="font-mono tabular-nums"
                value={toDateInputValue(field.value)}
                onChange={(e) => field.onChange(fromDateInputValue(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="note" render={({ field }) => (
          <FormItem>
            <FormLabel>Note</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex justify-end gap-2 pt-2">
          {onCancel && <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>Cancel</Button>}
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : submitLabel}</Button>
        </div>
      </form>
    </Form>
  );
}
