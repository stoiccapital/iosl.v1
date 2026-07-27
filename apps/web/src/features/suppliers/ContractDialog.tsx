import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { Contract, CreateContractInput } from '@factory/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ContractForm } from './ContractForm';
import { contractHooks } from './hooks';

export function ContractDialog(
  props:
    | { mode: 'create'; trigger: ReactNode }
    | { mode: 'edit'; contract: Contract; trigger: ReactNode },
) {
  const [open, setOpen] = useState(false);
  const create = contractHooks.useCreate();
  const update = contractHooks.useUpdate(props.mode === 'edit' ? props.contract.id : 'noop');

  const handle = (v: CreateContractInput) => {
    if (props.mode === 'create') {
      create.mutate(v, {
        onSuccess: () => {
          toast.success('Contract created', { description: v.name });
          setOpen(false);
        },
        onError: (err) => toast.error('Failed', { description: err instanceof Error ? err.message : '' }),
      });
    } else {
      update.mutate(v, {
        onSuccess: () => {
          toast.success('Contract updated', { description: v.name });
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
          <DialogTitle>{props.mode === 'create' ? 'New contract' : 'Edit contract'}</DialogTitle>
          <DialogDescription>Costs from this contract flow into Finance.</DialogDescription>
        </DialogHeader>
        <ContractForm
          {...(props.mode === 'edit' ? { defaultValues: props.contract } : {})}
          onSubmit={handle}
          onCancel={() => setOpen(false)}
          submitting={submitting}
          submitLabel={props.mode === 'create' ? 'Create' : 'Save'}
        />
      </DialogContent>
    </Dialog>
  );
}

export function NewContractButton() {
  return <ContractDialog mode="create" trigger={<Button>New contract</Button>} />;
}
