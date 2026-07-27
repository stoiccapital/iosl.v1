import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { Assignment, CreateAssignmentInput } from '@factory/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AssignmentForm } from './AssignmentForm';
import { assignmentHooks } from './hooks';

export function AssignmentDialog(
  props:
    | { mode: 'create'; trigger: ReactNode }
    | { mode: 'edit'; assignment: Assignment; trigger: ReactNode },
) {
  const [open, setOpen] = useState(false);
  const create = assignmentHooks.useCreate();
  const update = assignmentHooks.useUpdate(props.mode === 'edit' ? props.assignment.id : 'noop');

  const handle = (v: CreateAssignmentInput) => {
    if (props.mode === 'create') {
      create.mutate(v, {
        onSuccess: () => { toast.success('Assignment created'); setOpen(false); },
        onError: (err) => toast.error('Failed', { description: err instanceof Error ? err.message : '' }),
      });
    } else {
      update.mutate(v, {
        onSuccess: () => { toast.success('Assignment updated'); setOpen(false); },
        onError: (err) => toast.error('Failed', { description: err instanceof Error ? err.message : '' }),
      });
    }
  };

  const submitting = props.mode === 'create' ? create.isPending : update.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{props.mode === 'create' ? 'New assignment' : 'Edit assignment'}</DialogTitle>
          <DialogDescription>Person allocated to a project.</DialogDescription>
        </DialogHeader>
        <AssignmentForm
          {...(props.mode === 'edit' ? { defaultValues: props.assignment } : {})}
          onSubmit={handle}
          onCancel={() => setOpen(false)}
          submitting={submitting}
          submitLabel={props.mode === 'create' ? 'Create' : 'Save'}
        />
      </DialogContent>
    </Dialog>
  );
}

export function NewAssignmentButton() {
  return <AssignmentDialog mode="create" trigger={<Button variant="outline">New assignment</Button>} />;
}
