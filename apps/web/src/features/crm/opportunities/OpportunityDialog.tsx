import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { CreateOpportunityInput, Opportunity } from '@factory/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { OpportunityForm } from './OpportunityForm';
import { opportunityHooks } from './hooks';

export function OpportunityDialog(
  props:
    | { mode: 'create'; trigger: ReactNode }
    | { mode: 'edit'; opportunity: Opportunity; trigger: ReactNode },
) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        {props.mode === 'create' ? (
          <Create onDone={() => setOpen(false)} />
        ) : (
          <Edit opportunity={props.opportunity} onDone={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Create({ onDone }: { onDone: () => void }) {
  const create = opportunityHooks.useCreate();
  const handle = (v: CreateOpportunityInput) =>
    create.mutate(v, {
      onSuccess: (opp) => {
        toast.success('Opportunity created', { description: opp.name });
        onDone();
      },
      onError: (err) =>
        toast.error('Could not create opportunity', {
          description: err instanceof Error ? err.message : 'Unknown error',
        }),
    });
  return (
    <>
      <DialogHeader>
        <DialogTitle>New opportunity</DialogTitle>
        <DialogDescription>Add a deal to the pipeline.</DialogDescription>
      </DialogHeader>
      <OpportunityForm onSubmit={handle} onCancel={onDone} submitting={create.isPending} submitLabel="Create" />
    </>
  );
}

function Edit({ opportunity, onDone }: { opportunity: Opportunity; onDone: () => void }) {
  const update = opportunityHooks.useUpdate(opportunity.id);
  const handle = (v: CreateOpportunityInput) =>
    update.mutate(v, {
      onSuccess: () => {
        toast.success('Opportunity updated', { description: v.name });
        onDone();
      },
      onError: (err) =>
        toast.error('Could not update opportunity', {
          description: err instanceof Error ? err.message : 'Unknown error',
        }),
    });
  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit opportunity</DialogTitle>
        <DialogDescription>Update deal details.</DialogDescription>
      </DialogHeader>
      <OpportunityForm
        defaultValues={opportunity}
        onSubmit={handle}
        onCancel={onDone}
        submitting={update.isPending}
      />
    </>
  );
}

export function NewOpportunityButton() {
  return <OpportunityDialog mode="create" trigger={<Button>New opportunity</Button>} />;
}
