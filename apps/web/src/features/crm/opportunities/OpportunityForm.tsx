import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  CreateOpportunityInputSchema,
  OpportunityStageSchema,
  type CreateOpportunityInput,
  type Opportunity,
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
import { accountHooks } from '../accounts/hooks';
import { usePeople } from '@/features/directory/hooks';
import { STAGE_LABEL } from './stage';

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

function fromDateInputValue(v: string): string {
  return new Date(`${v}T00:00:00.000Z`).toISOString();
}

export function OpportunityForm({
  defaultValues,
  submitting,
  submitLabel = 'Save',
  onSubmit,
  onCancel,
}: {
  defaultValues?: Partial<Opportunity>;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (v: CreateOpportunityInput) => void;
  onCancel?: () => void;
}) {
  const accounts = accountHooks.useList();
  const people = usePeople('employee');

  const form = useForm<CreateOpportunityInput>({
    resolver: zodResolver(CreateOpportunityInputSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      accountId: defaultValues?.accountId ?? '',
      stage: defaultValues?.stage ?? 'qualified',
      amountCents: defaultValues?.amountCents ?? 0,
      probability: defaultValues?.probability ?? 20,
      expectedCloseDate:
        defaultValues?.expectedCloseDate ?? new Date().toISOString(),
      ownerId: defaultValues?.ownerId ?? null,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            name="stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stage</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {OpportunityStageSchema.options.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STAGE_LABEL[s]}
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
            name="amountCents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (EUR)</FormLabel>
                <FormControl>
                  <EurInput valueCents={field.value} onChangeCents={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="probability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Probability (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="font-mono tabular-nums"
                    value={field.value}
                    onChange={(e) => field.onChange(Number.parseInt(e.target.value || '0', 10))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="expectedCloseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected close</FormLabel>
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
          <FormField
            control={form.control}
            name="ownerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Owner</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v === '__none' ? null : v)}
                  value={field.value ?? '__none'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none">Unassigned</SelectItem>
                    {(people.data ?? []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.firstName} {p.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
