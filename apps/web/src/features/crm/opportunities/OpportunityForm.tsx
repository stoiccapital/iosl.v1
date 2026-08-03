import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import {
  CreateOpportunityInputSchema,
  OpportunityLineBillingCycleSchema,
  OpportunityStageSchema,
  PRODUCT_CATALOG,
  lineMrrCents,
  lineTcvCents,
  type CreateOpportunityInput,
  type Opportunity,
  type OpportunityLineBillingCycle,
} from '@factory/shared';
import { Button } from '@/components/ui/button';
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
import { formatCurrencyEUR } from '@/lib/format';
import { accountHooks } from '../accounts/hooks';
import { usePeople } from '@/features/directory/hooks';
import { STAGE_LABEL } from './stage';

const CYCLE_OPTIONS = OpportunityLineBillingCycleSchema.options;

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

function fromDateInputValue(v: string): string {
  return new Date(`${v}T00:00:00.000Z`).toISOString();
}

function defaultLine() {
  return {
    productCode: PRODUCT_CATALOG[0]!.code,
    quantity: 1,
    contractMonths: 12,
    billingCycle: 'monthly' as OpportunityLineBillingCycle,
  };
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
      lines: defaultValues?.lines?.length ? defaultValues.lines : [defaultLine()],
      probability: defaultValues?.probability ?? 20,
      expectedCloseDate:
        defaultValues?.expectedCloseDate ?? new Date().toISOString(),
      ownerId: defaultValues?.ownerId ?? null,
    },
  });

  const linesField = useFieldArray({ control: form.control, name: 'lines' });
  const watchedLines = form.watch('lines') ?? [];
  const totalCents = watchedLines.reduce(
    (sum, l) => sum + lineTcvCents(l.productCode, l.quantity, l.contractMonths, l.billingCycle),
    0,
  );
  const totalMrrCents = watchedLines.reduce(
    (sum, l) => sum + lineMrrCents(l.productCode, l.quantity, l.contractMonths, l.billingCycle),
    0,
  );

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

        {/* Products / licenses / duration / billing cycle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel>Products</FormLabel>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => linesField.append(defaultLine())}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add product
            </Button>
          </div>

          {linesField.fields.length === 0 ? (
            <div className="rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground">
              No products yet — add at least one.
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <div className="grid grid-cols-[minmax(200px,1fr)_72px_100px_100px_100px_32px] gap-2 border-b bg-muted/40 px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <span>Product</span>
                <span className="text-right">Licenses</span>
                <span className="text-right">Duration</span>
                <span>Cycle</span>
                <span className="text-right">Deal size</span>
                <span />
              </div>
              <div className="divide-y">
                {linesField.fields.map((field, idx) => {
                  const line = watchedLines[idx];
                  const lineTcv = line
                    ? lineTcvCents(line.productCode, line.quantity, line.contractMonths, line.billingCycle)
                    : 0;
                  const lineMrr = line
                    ? lineMrrCents(line.productCode, line.quantity, line.contractMonths, line.billingCycle)
                    : 0;
                  const periods = line
                    ? Math.max(
                        1,
                        Math.ceil(line.contractMonths / (line.billingCycle === 'annual' ? 12 : 1)),
                      )
                    : 0;
                  const perInvoiceCents = periods > 0 ? Math.round(lineTcv / periods) : 0;
                  return (
                    <div key={field.id} className="px-2 py-2">
                      <div className="grid grid-cols-[minmax(200px,1fr)_72px_100px_100px_100px_32px] items-center gap-2">
                        <FormField
                          control={form.control}
                          name={`lines.${idx}.productCode`}
                          render={({ field: f }) => (
                            <Select onValueChange={f.onChange} value={f.value}>
                              <FormControl>
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PRODUCT_CATALOG.map((p) => (
                                  <SelectItem key={p.code} value={p.code}>
                                    {p.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`lines.${idx}.quantity`}
                          render={({ field: f }) => (
                            <Input
                              type="number"
                              min={1}
                              className="h-9 text-right font-mono tabular-nums"
                              value={f.value}
                              onChange={(e) =>
                                f.onChange(Math.max(1, Number.parseInt(e.target.value, 10) || 1))
                              }
                            />
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`lines.${idx}.contractMonths`}
                          render={({ field: f }) => (
                            <div className="relative">
                              <Input
                                type="number"
                                min={1}
                                className="h-9 pr-14 text-right font-mono tabular-nums"
                                value={f.value}
                                onChange={(e) =>
                                  f.onChange(
                                    Math.max(1, Number.parseInt(e.target.value, 10) || 1),
                                  )
                                }
                              />
                              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">
                                months
                              </span>
                            </div>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`lines.${idx}.billingCycle`}
                          render={({ field: f }) => (
                            <Select
                              onValueChange={(v) =>
                                f.onChange(v as OpportunityLineBillingCycle)
                              }
                              value={f.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CYCLE_OPTIONS.map((c) => (
                                  <SelectItem key={c} value={c}>
                                    {c === 'monthly' ? 'Monthly' : 'Annual'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <div className="text-right font-mono text-sm tabular-nums">
                          {formatCurrencyEUR(lineTcv / 100)}
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9"
                          onClick={() => linesField.remove(idx)}
                          aria-label="Remove product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {line && (
                        <div className="mt-1 pl-1 text-xs text-muted-foreground">
                          <span className="font-mono tabular-nums">
                            {formatCurrencyEUR(lineMrr / 100)}
                          </span>{' '}
                          / month · {periods}{' '}
                          {line.billingCycle === 'annual' ? 'annual' : 'monthly'} invoice
                          {periods === 1 ? '' : 's'} of{' '}
                          <span className="font-mono tabular-nums">
                            {formatCurrencyEUR(perInvoiceCents / 100)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
            <div className="flex flex-col">
              <span className="text-sm font-medium">Total deal size</span>
              <span className="text-xs text-muted-foreground font-mono tabular-nums">
                {formatCurrencyEUR(totalMrrCents / 100)} / month
              </span>
            </div>
            <span className="font-mono text-base font-semibold tabular-nums">
              {formatCurrencyEUR(totalCents / 100)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>

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
