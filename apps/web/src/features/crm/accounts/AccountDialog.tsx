import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { Account, CreateAccountInput } from '@factory/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AccountForm } from './AccountForm';
import { accountHooks } from './hooks';

export function AccountDialog(
  props:
    | { mode: 'create'; trigger: ReactNode }
    | { mode: 'edit'; account: Account; trigger: ReactNode },
) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {props.mode === 'create' ? (
          <Create onDone={() => setOpen(false)} />
        ) : (
          <Edit account={props.account} onDone={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Create({ onDone }: { onDone: () => void }) {
  const create = accountHooks.useCreate();
  const handle = (v: CreateAccountInput) =>
    create.mutate(v, {
      onSuccess: (a) => {
        toast.success('Account created', { description: a.name });
        onDone();
      },
      onError: (err) =>
        toast.error('Could not create account', {
          description: err instanceof Error ? err.message : 'Unknown error',
        }),
    });
  return (
    <>
      <DialogHeader>
        <DialogTitle>New account</DialogTitle>
        <DialogDescription>Add a company you want to sell to.</DialogDescription>
      </DialogHeader>
      <AccountForm onSubmit={handle} onCancel={onDone} submitting={create.isPending} submitLabel="Create" />
    </>
  );
}

function Edit({ account, onDone }: { account: Account; onDone: () => void }) {
  const update = accountHooks.useUpdate(account.id);
  const handle = (v: CreateAccountInput) =>
    update.mutate(v, {
      onSuccess: () => {
        toast.success('Account updated', { description: v.name });
        onDone();
      },
      onError: (err) =>
        toast.error('Could not update account', {
          description: err instanceof Error ? err.message : 'Unknown error',
        }),
    });
  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit account</DialogTitle>
        <DialogDescription>Update account details.</DialogDescription>
      </DialogHeader>
      <AccountForm
        defaultValues={account}
        onSubmit={handle}
        onCancel={onDone}
        submitting={update.isPending}
      />
    </>
  );
}

export function NewAccountButton() {
  return <AccountDialog mode="create" trigger={<Button>New account</Button>} />;
}
