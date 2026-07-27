import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { CreateLeadInput, Lead } from '@factory/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LeadForm } from './LeadForm';
import { leadHooks } from './hooks';

export function LeadDialog(
  props:
    | { mode: 'create'; trigger: ReactNode }
    | { mode: 'edit'; lead: Lead; trigger: ReactNode },
) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {props.mode === 'create' ? (
          <Create onDone={() => setOpen(false)} />
        ) : (
          <Edit lead={props.lead} onDone={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Create({ onDone }: { onDone: () => void }) {
  const create = leadHooks.useCreate();
  const handle = (v: CreateLeadInput) =>
    create.mutate(v, {
      onSuccess: (lead) => {
        toast.success('Lead created', { description: lead.name });
        onDone();
      },
      onError: (err) =>
        toast.error('Could not create lead', {
          description: err instanceof Error ? err.message : 'Unknown error',
        }),
    });
  return (
    <>
      <DialogHeader>
        <DialogTitle>New lead</DialogTitle>
        <DialogDescription>Add a prospect to the pipeline.</DialogDescription>
      </DialogHeader>
      <LeadForm onSubmit={handle} onCancel={onDone} submitting={create.isPending} submitLabel="Create" />
    </>
  );
}

function Edit({ lead, onDone }: { lead: Lead; onDone: () => void }) {
  const update = leadHooks.useUpdate(lead.id);
  const handle = (v: CreateLeadInput) =>
    update.mutate(v, {
      onSuccess: () => {
        toast.success('Lead updated', { description: v.name });
        onDone();
      },
      onError: (err) =>
        toast.error('Could not update lead', {
          description: err instanceof Error ? err.message : 'Unknown error',
        }),
    });
  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit lead</DialogTitle>
        <DialogDescription>Update lead details.</DialogDescription>
      </DialogHeader>
      <LeadForm
        defaultValues={lead}
        onSubmit={handle}
        onCancel={onDone}
        submitting={update.isPending}
      />
    </>
  );
}

export function NewLeadButton() {
  return <LeadDialog mode="create" trigger={<Button>New lead</Button>} />;
}
