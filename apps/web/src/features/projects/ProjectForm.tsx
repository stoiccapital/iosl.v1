import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  CreateProjectInputSchema,
  ProjectStatusSchema,
  type CreateProjectInput,
  type Project,
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
import { accountHooks } from '@/features/crm/accounts/hooks';
import { PROJECT_STATUS_LABEL } from './labels';

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}
function fromDateInputValue(v: string): string {
  return new Date(`${v}T00:00:00.000Z`).toISOString();
}

export function ProjectForm({
  defaultValues,
  submitting,
  submitLabel = 'Save',
  onSubmit,
  onCancel,
}: {
  defaultValues?: Partial<Project>;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (v: CreateProjectInput) => void;
  onCancel?: () => void;
}) {
  const accounts = accountHooks.useList();
  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(CreateProjectInputSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      code: defaultValues?.code ?? '',
      clientAccountId: defaultValues?.clientAccountId ?? null,
      status: defaultValues?.status ?? 'planning',
      startDate: defaultValues?.startDate ?? new Date().toISOString(),
      targetEndDate: defaultValues?.targetEndDate ?? null,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="code" render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl><Input className="font-mono" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="clientAccountId" render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <Select
                onValueChange={(v) => field.onChange(v === '__internal' ? null : v)}
                value={field.value ?? '__internal'}
              >
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="__internal">Internal</SelectItem>
                  {(accounts.data ?? []).map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {ProjectStatusSchema.options.map((v) => (
                    <SelectItem key={v} value={v}>{PROJECT_STATUS_LABEL[v]}</SelectItem>
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
              <FormLabel>Start</FormLabel>
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
          <FormField control={form.control} name="targetEndDate" render={({ field }) => (
            <FormItem>
              <FormLabel>Target end</FormLabel>
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
