import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CreateCustomerInputSchema, type CreateCustomerInput, type Customer } from '@factory/shared';
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
import { Switch } from '@/components/ui/switch';
import { accountHooks } from '../accounts/hooks';
import { useProducts } from '@/features/directory/hooks';

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}
function fromDateInputValue(v: string): string {
  return new Date(`${v}T00:00:00.000Z`).toISOString();
}

export function CustomerForm({
  defaultValues,
  submitting,
  submitLabel = 'Save',
  onSubmit,
  onCancel,
}: {
  defaultValues?: Partial<Customer>;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (v: CreateCustomerInput) => void;
  onCancel?: () => void;
}) {
  const accounts = accountHooks.useList();
  const products = useProducts();

  const form = useForm<CreateCustomerInput>({
    resolver: zodResolver(CreateCustomerInputSchema),
    defaultValues: {
      accountId: defaultValues?.accountId ?? '',
      productCode: defaultValues?.productCode ?? '',
      mrrCents: defaultValues?.mrrCents ?? 0,
      since: defaultValues?.since ?? new Date().toISOString(),
      active: defaultValues?.active ?? true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(accounts.data ?? []).map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="productCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(products.data ?? []).map((p) => (
                      <SelectItem key={p.code} value={p.code}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="mrrCents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MRR (EUR)</FormLabel>
                <FormControl>
                  <EurInput valueCents={field.value} onChangeCents={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="since"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer since</FormLabel>
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
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <FormLabel>Active</FormLabel>
                <p className="text-muted-foreground text-xs">
                  Uncheck to mark this subscription as churned.
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
