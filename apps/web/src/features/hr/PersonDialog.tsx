import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { CreatePersonInput, Person, PersonType } from '@factory/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PersonForm } from './PersonForm';
import { personHooks } from './hooks';

export function PersonDialog(
  props:
    | { mode: 'create'; type: PersonType; trigger: ReactNode }
    | { mode: 'edit'; person: Person; trigger: ReactNode },
) {
  const [open, setOpen] = useState(false);
  const create = personHooks.useCreate();
  const update = personHooks.useUpdate(props.mode === 'edit' ? props.person.id : 'noop');

  const handle = (v: CreatePersonInput) => {
    if (props.mode === 'create') {
      create.mutate(v, {
        onSuccess: () => {
          toast.success('Person created', { description: `${v.firstName} ${v.lastName}` });
          setOpen(false);
        },
        onError: (err) => toast.error('Failed', { description: err instanceof Error ? err.message : '' }),
      });
    } else {
      update.mutate(v, {
        onSuccess: () => {
          toast.success('Person updated');
          setOpen(false);
        },
        onError: (err) => toast.error('Failed', { description: err instanceof Error ? err.message : '' }),
      });
    }
  };

  const submitting = props.mode === 'create' ? create.isPending : update.isPending;
  const type = props.mode === 'create' ? props.type : props.person.type;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {props.mode === 'create' ? `New ${type}` : `Edit ${type}`}
          </DialogTitle>
          <DialogDescription>Personal + engagement details.</DialogDescription>
        </DialogHeader>
        <PersonForm
          type={type}
          {...(props.mode === 'edit' ? { defaultValues: props.person } : {})}
          onSubmit={handle}
          onCancel={() => setOpen(false)}
          submitting={submitting}
          submitLabel={props.mode === 'create' ? 'Create' : 'Save'}
        />
      </DialogContent>
    </Dialog>
  );
}

export function NewPersonButton({ type }: { type: PersonType }) {
  const label = type === 'employee' ? 'New employee' : type === 'freelancer' ? 'New freelancer' : 'New candidate';
  return <PersonDialog mode="create" type={type} trigger={<Button>{label}</Button>} />;
}
