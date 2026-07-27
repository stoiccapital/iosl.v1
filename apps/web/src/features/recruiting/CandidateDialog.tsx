import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { Candidate, CreateCandidateInput } from '@factory/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CandidateForm } from './CandidateForm';
import { candidateHooks } from './hooks';

export function CandidateDialog(
  props:
    | { mode: 'create'; trigger: ReactNode }
    | { mode: 'edit'; candidate: Candidate; trigger: ReactNode },
) {
  const [open, setOpen] = useState(false);
  const create = candidateHooks.useCreate();
  const update = candidateHooks.useUpdate(props.mode === 'edit' ? props.candidate.id : 'noop');

  const handle = (v: CreateCandidateInput) => {
    if (props.mode === 'create') {
      create.mutate(v, {
        onSuccess: () => { toast.success('Candidate added', { description: `${v.firstName} ${v.lastName}` }); setOpen(false); },
        onError: (err) => toast.error('Failed', { description: err instanceof Error ? err.message : '' }),
      });
    } else {
      update.mutate(v, {
        onSuccess: () => { toast.success('Candidate updated'); setOpen(false); },
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
          <DialogTitle>{props.mode === 'create' ? 'New candidate' : 'Edit candidate'}</DialogTitle>
          <DialogDescription>Applicant details and current stage.</DialogDescription>
        </DialogHeader>
        <CandidateForm
          {...(props.mode === 'edit' ? { defaultValues: props.candidate } : {})}
          onSubmit={handle}
          onCancel={() => setOpen(false)}
          submitting={submitting}
          submitLabel={props.mode === 'create' ? 'Create' : 'Save'}
        />
      </DialogContent>
    </Dialog>
  );
}

export function NewCandidateButton() {
  return <CandidateDialog mode="create" trigger={<Button>New candidate</Button>} />;
}
