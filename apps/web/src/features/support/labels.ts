import type { TicketPriority, TicketStatus } from '@factory/shared';

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Open',
  pending: 'Pending',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const TICKET_STATUS_VARIANT: Record<
  TicketStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  open: 'default',
  pending: 'secondary',
  resolved: 'outline',
  closed: 'outline',
};

export const TICKET_PRIORITY_LABEL: Record<TicketPriority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
};

export const TICKET_PRIORITY_VARIANT: Record<
  TicketPriority,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  low: 'outline',
  normal: 'outline',
  high: 'secondary',
  urgent: 'destructive',
};
