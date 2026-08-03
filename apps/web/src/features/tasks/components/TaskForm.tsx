import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  CreateTaskInputSchema,
  TaskRelatedTypeSchema,
  type CreateTaskInput,
  type Task,
  type TaskRelatedType,
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { accountHooks } from '@/features/crm/accounts/hooks';
import { opportunityHooks } from '@/features/crm/opportunities/hooks';
import { usePeople } from '@/features/directory/hooks';
import { TASK_STATUSES, TASK_STATUS_LABEL } from '../lib/status';

type PresetContext = {
  relatedType: TaskRelatedType;
  relatedId: string;
};

type Props = {
  defaultValues?: Partial<Task> | undefined;
  presetContext?: PresetContext | undefined;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: CreateTaskInput) => void;
  onCancel?: () => void;
};

function toDateInputValue(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : '';
}

function fromDateInputValue(v: string): string | null {
  return v ? new Date(`${v}T00:00:00.000Z`).toISOString() : null;
}

const RELATED_TYPE_LABEL: Record<TaskRelatedType, string> = {
  account: 'Account',
  opportunity: 'Opportunity',
  account_contact: 'Contact',
};

export function TaskForm({
  defaultValues,
  presetContext,
  submitting,
  submitLabel = 'Save',
  onSubmit,
  onCancel,
}: Props) {
  const people = usePeople('employee');
  const accounts = accountHooks.useList();
  const opportunities = opportunityHooks.useList();

  const relatedType =
    defaultValues?.relatedType ?? presetContext?.relatedType ?? null;
  const relatedId = defaultValues?.relatedId ?? presetContext?.relatedId ?? null;

  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(CreateTaskInputSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? null,
      status: defaultValues?.status ?? 'open',
      assigneeId: defaultValues?.assigneeId ?? null,
      dueAt: defaultValues?.dueAt ?? null,
      relatedType,
      relatedId,
    },
  });

  const watchedRelatedType = form.watch('relatedType');
  const linkOptions =
    watchedRelatedType === 'account'
      ? (accounts.data ?? []).map((a) => ({ id: a.id, label: a.name }))
      : watchedRelatedType === 'opportunity'
        ? (opportunities.data ?? []).map((o) => ({ id: o.id, label: o.name }))
        : [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="What needs doing?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  rows={2}
                  placeholder="Optional details…"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
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
                    {TASK_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {TASK_STATUS_LABEL[s]}
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
            name="assigneeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignee</FormLabel>
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dueAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due</FormLabel>
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
            name="relatedType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Linked to</FormLabel>
                <Select
                  onValueChange={(v) => {
                    field.onChange(v === '__none' ? null : v);
                    if (v === '__none') form.setValue('relatedId', null);
                  }}
                  value={field.value ?? '__none'}
                  disabled={Boolean(presetContext)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none">Nothing</SelectItem>
                    {TaskRelatedTypeSchema.options
                      .filter((t) => t !== 'account_contact')
                      .map((t) => (
                        <SelectItem key={t} value={t}>
                          {RELATED_TYPE_LABEL[t]}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {watchedRelatedType && (
          <FormField
            control={form.control}
            name="relatedId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{RELATED_TYPE_LABEL[watchedRelatedType]}</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v === '__none' ? null : v)}
                  value={field.value ?? '__none'}
                  disabled={Boolean(presetContext)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none">None</SelectItem>
                    {linkOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
