import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { CreatePayrollEntryInput, PayrollEntry } from '@factory/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PayrollForm } from './PayrollForm';
import { payrollHooks } from './hooks';

export function PayrollDialog(
  props:
    | { mode: 'create'; trigger: ReactNode }
    | { mode: 'edit'; entry: PayrollEntry; trigger: ReactNode },
) {
  const [open, setOpen] = useState(false);
  const create = payrollHooks.useCreate();
  const update = payrollHooks.useUpdate(props.mode === 'edit' ? props.entry.id : 'noop');

  const handle = (v: CreatePayrollEntryInput) => {
    if (props.mode === 'create') {
      create.mutate(v, {
        onSuccess: () => {
          toast.success('Payroll entry created');
          setOpen(false);
        },
        onError: (err) => toast.error('Failed', { description: err instanceof Error ? err.message : '' }),
      });
    } else {
      update.mutate(v, {
        onSuccess: () => {
          toast.success('Payroll entry updated');
          setOpen(false);
        },
        onError: (err) => toast.error('Failed', { description: err instanceof Error ? err.message : '' }),
      });
    }
  };

  const submitting = props.mode === 'create' ? create.isPending : update.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{props.mode === 'create' ? 'New payroll entry' : 'Edit payroll entry'}</DialogTitle>
          <DialogDescription>Flows into Finance / Costs.</DialogDescription>
        </DialogHeader>
        <PayrollForm
          {...(props.mode === 'edit' ? { defaultValues: props.entry } : {})}
          onSubmit={handle}
          onCancel={() => setOpen(false)}
          submitting={submitting}
          submitLabel={props.mode === 'create' ? 'Create' : 'Save'}
        />
      </DialogContent>
    </Dialog>
  );
}

export function NewPayrollButton() {
  return <PayrollDialog mode="create" trigger={<Button>New payroll entry</Button>} />;
}
