import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  CreatePositionInputSchema,
  EmploymentTypeSchema,
  PositionStatusSchema,
  type CreatePositionInput,
  type Position,
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
import { EMPLOYMENT_TYPE_LABEL, POSITION_STATUS_LABEL } from './labels';

export function PositionForm({
  defaultValues,
  submitting,
  submitLabel = 'Save',
  onSubmit,
  onCancel,
}: {
  defaultValues?: Partial<Position>;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (v: CreatePositionInput) => void;
  onCancel?: () => void;
}) {
  const form = useForm<CreatePositionInput>({
    resolver: zodResolver(CreatePositionInputSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      department: defaultValues?.department ?? '',
      location: defaultValues?.location ?? '',
      employmentType: defaultValues?.employmentType ?? 'full_time',
      openings: defaultValues?.openings ?? 1,
      status: defaultValues?.status ?? 'open',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="department" render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="location" render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField control={form.control} name="employmentType" render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {EmploymentTypeSchema.options.map((v) => (
                    <SelectItem key={v} value={v}>{EMPLOYMENT_TYPE_LABEL[v]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="openings" render={({ field }) => (
            <FormItem>
              <FormLabel>Openings</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
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
                  {PositionStatusSchema.options.map((v) => (
                    <SelectItem key={v} value={v}>{POSITION_STATUS_LABEL[v]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
