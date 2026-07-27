import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  CreateLeadInputSchema,
  LeadSourceSchema,
  LeadStatusSchema,
  type CreateLeadInput,
  type Lead,
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

const SOURCE_LABEL: Record<(typeof LeadSourceSchema.options)[number], string> = {
  referral: 'Referral',
  inbound: 'Inbound',
  outbound: 'Outbound',
  event: 'Event',
};

const STATUS_LABEL: Record<(typeof LeadStatusSchema.options)[number], string> = {
  new: 'New',
  qualified: 'Qualified',
  disqualified: 'Disqualified',
};

export function LeadForm({
  defaultValues,
  submitting,
  submitLabel = 'Save',
  onSubmit,
  onCancel,
}: {
  defaultValues?: Partial<Lead>;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (v: CreateLeadInput) => void;
  onCancel?: () => void;
}) {
  const form = useForm<CreateLeadInput>({
    resolver: zodResolver(CreateLeadInputSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      company: defaultValues?.company ?? '',
      email: defaultValues?.email ?? '',
      source: defaultValues?.source ?? 'inbound',
      status: defaultValues?.status ?? 'new',
      estimatedValueCents: defaultValues?.estimatedValueCents ?? 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
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
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LeadSourceSchema.options.map((v) => (
                      <SelectItem key={v} value={v}>
                        {SOURCE_LABEL[v]}
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LeadStatusSchema.options.map((v) => (
                      <SelectItem key={v} value={v}>
                        {STATUS_LABEL[v]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="estimatedValueCents"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated value (EUR)</FormLabel>
              <FormControl>
                <EurInput valueCents={field.value} onChangeCents={field.onChange} />
              </FormControl>
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
