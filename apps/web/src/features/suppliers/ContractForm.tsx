import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  ContractStatusSchema,
  CreateContractInputSchema,
  type Contract,
  type CreateContractInput,
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
import { CONTRACT_STATUS_LABEL } from './labels';
import { supplierHooks } from './hooks';

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}
function fromDateInputValue(v: string): string {
  return new Date(`${v}T00:00:00.000Z`).toISOString();
}

export function ContractForm({
  defaultValues,
  submitting,
  submitLabel = 'Save',
  onSubmit,
  onCancel,
}: {
  defaultValues?: Partial<Contract>;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (v: CreateContractInput) => void;
  onCancel?: () => void;
}) {
  const suppliers = supplierHooks.useList();

  const form = useForm<CreateContractInput>({
    resolver: zodResolver(CreateContractInputSchema),
    defaultValues: {
      supplierId: defaultValues?.supplierId ?? '',
      name: defaultValues?.name ?? '',
      monthlyAmountCents: defaultValues?.monthlyAmountCents ?? 0,
      startDate: defaultValues?.startDate ?? new Date().toISOString(),
      endDate: defaultValues?.endDate ?? null,
      status: defaultValues?.status ?? 'active',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="supplierId" render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                <SelectContent>
                  {(suppliers.data ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Contract name</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="monthlyAmountCents" render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly amount (EUR)</FormLabel>
              <FormControl>
                <EurInput valueCents={field.value} onChangeCents={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {ContractStatusSchema.options.map((v) => (
                    <SelectItem key={v} value={v}>{CONTRACT_STATUS_LABEL[v]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="startDate" render={({ field }) => (
            <FormItem>
              <FormLabel>Start date</FormLabel>
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
          <FormField control={form.control} name="endDate" render={({ field }) => (
            <FormItem>
              <FormLabel>End date (optional)</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  className="font-mono tabular-nums"
                  value={field.value ? toDateInputValue(field.value) : ''}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? null : fromDateInputValue(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {onCancel && <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>Cancel</Button>}
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : submitLabel}</Button>
        </div>
      </form>
    </Form>
  );
}
