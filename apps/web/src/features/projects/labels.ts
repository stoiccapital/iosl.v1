import type { AssignmentStatus, ProjectStatus } from '@factory/shared';

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On hold',
  done: 'Done',
};

export const PROJECT_STATUS_VARIANT: Record<
  ProjectStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  planning: 'outline',
  active: 'default',
  on_hold: 'secondary',
  done: 'outline',
};

export const ASSIGNMENT_STATUS_LABEL: Record<AssignmentStatus, string> = {
  active: 'Active',
  ended: 'Ended',
};
