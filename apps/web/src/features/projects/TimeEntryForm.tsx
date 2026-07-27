import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  CreateTimeEntryInputSchema,
  type CreateTimeEntryInput,
  type TimeEntry,
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
import { usePeople } from '@/features/directory/hooks';
import { assignmentHooks, projectHooks } from './hooks';

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}
function fromDateInputValue(v: string): string {
  return new Date(`${v}T00:00:00.000Z`).toISOString();
}

export function TimeEntryForm({
  defaultValues,
  submitting,
  submitLabel = 'Save',
  onSubmit,
  onCancel,
}: {
  defaultValues?: Partial<TimeEntry>;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (v: CreateTimeEntryInput) => void;
  onCancel?: () => void;
}) {
  const assignments = assignmentHooks.useList();
  const projects = projectHooks.useList();
  const people = usePeople();

  const form = useForm<CreateTimeEntryInput>({
    resolver: zodResolver(CreateTimeEntryInputSchema),
    defaultValues: {
      assignmentId: defaultValues?.assignmentId ?? '',
      date: defaultValues?.date ?? new Date().toISOString(),
      hours: defaultValues?.hours ?? 8,
      note: defaultValues?.note ?? '',
    },
  });

  const labelFor = (aId: string) => {
    const a = assignments.data?.find((x) => x.id === aId);
    if (!a) return '—';
    const project = projects.data?.find((p) => p.id === a.projectId);
    const person = people.data?.find((p) => p.id === a.personId);
    return `${project?.name ?? '—'} — ${person?.firstName ?? ''} ${person?.lastName ?? ''}`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="assignmentId" render={({ field }) => (
          <FormItem>
            <FormLabel>Assignment</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
              <SelectContent>
                {(assignments.data ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id}>{labelFor(a.id)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
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
          <FormField control={form.control} name="hours" render={({ field }) => (
            <FormItem>
              <FormLabel>Hours</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.25"
                  min={0}
                  className="font-mono tabular-nums"
                  value={field.value}
                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value || '0'))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
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
