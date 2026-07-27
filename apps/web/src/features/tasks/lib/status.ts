import type { TaskStatus } from '@factory/shared';

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  done: 'Done',
};

export const TASK_STATUS_VARIANT: Record<
  TaskStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  open: 'outline',
  in_progress: 'secondary',
  done: 'default',
};

export const TASK_STATUSES: TaskStatus[] = ['open', 'in_progress', 'done'];
