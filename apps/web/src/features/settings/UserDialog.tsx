import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { CreateUserInput, User } from '@factory/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UserForm } from './UserForm';
import { userHooks } from './hooks';

export function UserDialog(
  props:
    | { mode: 'create'; trigger: ReactNode }
    | { mode: 'edit'; user: User; trigger: ReactNode },
) {
  const [open, setOpen] = useState(false);
  const create = userHooks.useCreate();
  const update = userHooks.useUpdate(props.mode === 'edit' ? props.user.id : 'noop');
  const handle = (v: CreateUserInput) => {
    if (props.mode === 'create') {
      create.mutate(v, {
        onSuccess: () => { toast.success('User added'); setOpen(false); },
        onError: (err) => toast.error('Failed', { description: err instanceof Error ? err.message : '' }),
      });
    } else {
      update.mutate(v, {
        onSuccess: () => { toast.success('User updated'); setOpen(false); },
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
          <DialogTitle>{props.mode === 'create' ? 'New user' : 'Edit user'}</DialogTitle>
          <DialogDescription>Team member with system access.</DialogDescription>
        </DialogHeader>
        <UserForm
          {...(props.mode === 'edit' ? { defaultValues: props.user } : {})}
          onSubmit={handle}
          onCancel={() => setOpen(false)}
          submitting={submitting}
          submitLabel={props.mode === 'create' ? 'Create' : 'Save'}
        />
      </DialogContent>
    </Dialog>
  );
}

export function NewUserButton() {
  return <UserDialog mode="create" trigger={<Button>New user</Button>} />;
}
