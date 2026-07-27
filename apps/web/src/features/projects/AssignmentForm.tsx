import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  AssignmentStatusSchema,
  CreateAssignmentInputSchema,
  type Assignment,
  type CreateAssignmentInput,
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
import { ASSIGNMENT_STATUS_LABEL } from './labels';
import { projectHooks } from './hooks';

export function AssignmentForm({
  defaultValues,
  submitting,
  submitLabel = 'Save',
  onSubmit,
  onCancel,
}: {
  defaultValues?: Partial<Assignment>;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (v: CreateAssignmentInput) => void;
  onCancel?: () => void;
}) {
  const projects = projectHooks.useList();
  const people = usePeople();
  const form = useForm<CreateAssignmentInput>({
    resolver: zodResolver(CreateAssignmentInputSchema),
    defaultValues: {
      projectId: defaultValues?.projectId ?? '',
      personId: defaultValues?.personId ?? '',
      role: defaultValues?.role ?? '',
      allocationPercent: defaultValues?.allocationPercent ?? 50,
      status: defaultValues?.status ?? 'active',
      location: defaultValues?.location ?? '',
    },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="projectId" render={({ field }) => (
            <FormItem>
              <FormLabel>Project</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                <SelectContent>
                  {(projects.data ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="personId" render={({ field }) => (
            <FormItem>
              <FormLabel>Person</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                <SelectContent>
                  {(people.data ?? []).filter((p) => p.type !== 'candidate').map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField control={form.control} name="role" render={({ field }) => (
            <FormItem>
              <FormLabel>Role on project</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="allocationPercent" render={({ field }) => (
            <FormItem>
              <FormLabel>Allocation (%)</FormLabel>
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
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {AssignmentStatusSchema.options.map((v) => (
                    <SelectItem key={v} value={v}>{ASSIGNMENT_STATUS_LABEL[v]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="location" render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl><Input placeholder="Remote, Munich, Bangalore…" {...field} /></FormControl>
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
