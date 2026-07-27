import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { CreateSupplierInput, Supplier } from '@factory/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SupplierForm } from './SupplierForm';
import { supplierHooks } from './hooks';

export function SupplierDialog(
  props:
    | { mode: 'create'; trigger: ReactNode }
    | { mode: 'edit'; supplier: Supplier; trigger: ReactNode },
) {
  const [open, setOpen] = useState(false);
  const create = supplierHooks.useCreate();
  const update = supplierHooks.useUpdate(props.mode === 'edit' ? props.supplier.id : 'noop');

  const handle = (v: CreateSupplierInput) => {
    if (props.mode === 'create') {
      create.mutate(v, {
        onSuccess: (s) => {
          toast.success('Supplier created', { description: s.name });
          setOpen(false);
        },
        onError: (err) => toast.error('Failed', { description: err instanceof Error ? err.message : '' }),
      });
    } else {
      update.mutate(v, {
        onSuccess: () => {
          toast.success('Supplier updated', { description: v.name });
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
          <DialogTitle>{props.mode === 'create' ? 'New supplier' : 'Edit supplier'}</DialogTitle>
          <DialogDescription>Vendor master data.</DialogDescription>
        </DialogHeader>
        <SupplierForm
          {...(props.mode === 'edit' ? { defaultValues: props.supplier } : {})}
          onSubmit={handle}
          onCancel={() => setOpen(false)}
          submitting={submitting}
          submitLabel={props.mode === 'create' ? 'Create' : 'Save'}
        />
      </DialogContent>
    </Dialog>
  );
}

export function NewSupplierButton() {
  return <SupplierDialog mode="create" trigger={<Button>New supplier</Button>} />;
}
