import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { CreateProjectInput, Project } from '@factory/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ProjectForm } from './ProjectForm';
import { projectHooks } from './hooks';

export function ProjectDialog(
  props:
    | { mode: 'create'; trigger: ReactNode }
    | { mode: 'edit'; project: Project; trigger: ReactNode },
) {
  const [open, setOpen] = useState(false);
  const create = projectHooks.useCreate();
  const update = projectHooks.useUpdate(props.mode === 'edit' ? props.project.id : 'noop');

  const handle = (v: CreateProjectInput) => {
    if (props.mode === 'create') {
      create.mutate(v, {
        onSuccess: () => { toast.success('Project created', { description: v.name }); setOpen(false); },
        onError: (err) => toast.error('Failed', { description: err instanceof Error ? err.message : '' }),
      });
    } else {
      update.mutate(v, {
        onSuccess: () => { toast.success('Project updated'); setOpen(false); },
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
          <DialogTitle>{props.mode === 'create' ? 'New project' : 'Edit project'}</DialogTitle>
          <DialogDescription>Work stream tracked internally.</DialogDescription>
        </DialogHeader>
        <ProjectForm
          {...(props.mode === 'edit' ? { defaultValues: props.project } : {})}
          onSubmit={handle}
          onCancel={() => setOpen(false)}
          submitting={submitting}
          submitLabel={props.mode === 'create' ? 'Create' : 'Save'}
        />
      </DialogContent>
    </Dialog>
  );
}

export function NewProjectButton() {
  return <ProjectDialog mode="create" trigger={<Button>New project</Button>} />;
}
