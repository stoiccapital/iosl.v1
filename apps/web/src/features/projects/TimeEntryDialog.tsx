import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { CreateTimeEntryInput, TimeEntry } from '@factory/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TimeEntryForm } from './TimeEntryForm';
import { timeEntryHooks } from './hooks';

export function TimeEntryDialog(
  props:
    | { mode: 'create'; trigger: ReactNode }
    | { mode: 'edit'; entry: TimeEntry; trigger: ReactNode },
) {
  const [open, setOpen] = useState(false);
  const create = timeEntryHooks.useCreate();
  const update = timeEntryHooks.useUpdate(props.mode === 'edit' ? props.entry.id : 'noop');

  const handle = (v: CreateTimeEntryInput) => {
    if (props.mode === 'create') {
      create.mutate(v, {
        onSuccess: () => { toast.success('Time entry logged'); setOpen(false); },
        onError: (err) => toast.error('Failed', { description: err instanceof Error ? err.message : '' }),
      });
    } else {
      update.mutate(v, {
        onSuccess: () => { toast.success('Time entry updated'); setOpen(false); },
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
          <DialogTitle>{props.mode === 'create' ? 'Log time' : 'Edit time entry'}</DialogTitle>
          <DialogDescription>Hours worked on a project assignment.</DialogDescription>
        </DialogHeader>
        <TimeEntryForm
          {...(props.mode === 'edit' ? { defaultValues: props.entry } : {})}
          onSubmit={handle}
          onCancel={() => setOpen(false)}
          submitting={submitting}
          submitLabel={props.mode === 'create' ? 'Log' : 'Save'}
        />
      </DialogContent>
    </Dialog>
  );
}

export function NewTimeEntryButton() {
  return <TimeEntryDialog mode="create" trigger={<Button>Log time</Button>} />;
}
