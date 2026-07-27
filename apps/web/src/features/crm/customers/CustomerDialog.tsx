import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { CreateCustomerInput, Customer } from '@factory/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CustomerForm } from './CustomerForm';
import { customerHooks } from './hooks';

export function CustomerDialog(
  props:
    | { mode: 'create'; trigger: ReactNode }
    | { mode: 'edit'; customer: Customer; trigger: ReactNode },
) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {props.mode === 'create' ? (
          <Create onDone={() => setOpen(false)} />
        ) : (
          <Edit customer={props.customer} onDone={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Create({ onDone }: { onDone: () => void }) {
  const create = customerHooks.useCreate();
  const handle = (v: CreateCustomerInput) =>
    create.mutate(v, {
      onSuccess: () => {
        toast.success('Customer subscription created');
        onDone();
      },
      onError: (err) =>
        toast.error('Could not create customer', {
          description: err instanceof Error ? err.message : 'Unknown error',
        }),
    });
  return (
    <>
      <DialogHeader>
        <DialogTitle>New customer</DialogTitle>
        <DialogDescription>Add a live subscription.</DialogDescription>
      </DialogHeader>
      <CustomerForm onSubmit={handle} onCancel={onDone} submitting={create.isPending} submitLabel="Create" />
    </>
  );
}

function Edit({ customer, onDone }: { customer: Customer; onDone: () => void }) {
  const update = customerHooks.useUpdate(customer.id);
  const handle = (v: CreateCustomerInput) =>
    update.mutate(v, {
      onSuccess: () => {
        toast.success('Customer updated');
        onDone();
      },
      onError: (err) =>
        toast.error('Could not update customer', {
          description: err instanceof Error ? err.message : 'Unknown error',
        }),
    });
  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit customer</DialogTitle>
        <DialogDescription>Update subscription details.</DialogDescription>
      </DialogHeader>
      <CustomerForm
        defaultValues={customer}
        onSubmit={handle}
        onCancel={onDone}
        submitting={update.isPending}
      />
    </>
  );
}

export function NewCustomerButton() {
  return <CustomerDialog mode="create" trigger={<Button>New customer</Button>} />;
}
