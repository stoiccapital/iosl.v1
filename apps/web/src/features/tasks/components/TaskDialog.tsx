import { useState } from 'react';
import { toast } from 'sonner';
import type { CreateTaskInput, Task } from '@factory/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TaskForm } from './TaskForm';
import { useCreateTask, useUpdateTask } from '../hooks/use-tasks';

type CreateProps = {
  mode: 'create';
  trigger: React.ReactNode;
};

type EditProps = {
  mode: 'edit';
  task: Task;
  trigger: React.ReactNode;
};

type Props = CreateProps | EditProps;

export function TaskDialog(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent>
        {props.mode === 'create' ? (
          <CreateBody onDone={() => setOpen(false)} />
        ) : (
          <EditBody task={props.task} onDone={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CreateBody({ onDone }: { onDone: () => void }) {
  const create = useCreateTask();

  const handleSubmit = (values: CreateTaskInput) => {
    create.mutate(values, {
      onSuccess: (task) => {
        toast.success('Task created', { description: task.title });
        onDone();
      },
      onError: (err) => {
        toast.error('Could not create task', {
          description: err instanceof Error ? err.message : 'Unknown error',
        });
      },
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>New task</DialogTitle>
        <DialogDescription>Fill in the details and save.</DialogDescription>
      </DialogHeader>
      <TaskForm
        onSubmit={handleSubmit}
        onCancel={onDone}
        submitting={create.isPending}
        submitLabel="Create"
      />
    </>
  );
}

function EditBody({ task, onDone }: { task: Task; onDone: () => void }) {
  const update = useUpdateTask(task.id);

  const handleSubmit = (values: CreateTaskInput) => {
    update.mutate(values, {
      onSuccess: () => {
        toast.success('Task updated', { description: values.title });
        onDone();
      },
      onError: (err) => {
        toast.error('Could not update task', {
          description: err instanceof Error ? err.message : 'Unknown error',
        });
      },
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit task</DialogTitle>
        <DialogDescription>Update the details and save.</DialogDescription>
      </DialogHeader>
      <TaskForm
        defaultValues={task}
        onSubmit={handleSubmit}
        onCancel={onDone}
        submitting={update.isPending}
        submitLabel="Save"
      />
    </>
  );
}

export function CreateTaskButton() {
  return <TaskDialog mode="create" trigger={<Button>New task</Button>} />;
}
