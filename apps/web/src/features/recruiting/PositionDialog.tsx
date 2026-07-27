import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { CreatePositionInput, Position } from '@factory/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PositionForm } from './PositionForm';
import { positionHooks } from './hooks';

export function PositionDialog(
  props:
    | { mode: 'create'; trigger: ReactNode }
    | { mode: 'edit'; position: Position; trigger: ReactNode },
) {
  const [open, setOpen] = useState(false);
  const create = positionHooks.useCreate();
  const update = positionHooks.useUpdate(props.mode === 'edit' ? props.position.id : 'noop');

  const handle = (v: CreatePositionInput) => {
    if (props.mode === 'create') {
      create.mutate(v, {
        onSuccess: () => { toast.success('Position created', { description: v.title }); setOpen(false); },
        onError: (err) => toast.error('Failed', { description: err instanceof Error ? err.message : '' }),
      });
    } else {
      update.mutate(v, {
        onSuccess: () => { toast.success('Position updated', { description: v.title }); setOpen(false); },
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
          <DialogTitle>{props.mode === 'create' ? 'New position' : 'Edit position'}</DialogTitle>
          <DialogDescription>Open role to recruit for.</DialogDescription>
        </DialogHeader>
        <PositionForm
          {...(props.mode === 'edit' ? { defaultValues: props.position } : {})}
          onSubmit={handle}
          onCancel={() => setOpen(false)}
          submitting={submitting}
          submitLabel={props.mode === 'create' ? 'Create' : 'Save'}
        />
      </DialogContent>
    </Dialog>
  );
}

export function NewPositionButton() {
  return <PositionDialog mode="create" trigger={<Button>New position</Button>} />;
}
