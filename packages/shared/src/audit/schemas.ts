import { z } from 'zod';

export const AuditActionSchema = z.enum(['create', 'update', 'delete', 'login', 'logout', 'role_change']);
export type AuditAction = z.infer<typeof AuditActionSchema>;

export const AuditEntrySchema = z.object({
  id: z.string().uuid(),
  actorId: z.string().uuid(),
  actorEmail: z.string().email(),
  action: AuditActionSchema,
  resource: z.string(),
  resourceId: z.string().nullable(),
  detail: z.string(),
  at: z.string().datetime(),
});
export type AuditEntry = z.infer<typeof AuditEntrySchema>;

/* ---------- Notification preferences ---------- */

export const NotificationChannelSchema = z.enum(['email', 'in_app', 'slack']);
export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;

export const NotificationTopicSchema = z.enum([
  'ticket_assigned',
  'invoice_due',
  'invoice_paid',
  'opportunity_stage_change',
  'candidate_stage_change',
  'incident_opened',
  'mention',
]);
export type NotificationTopic = z.infer<typeof NotificationTopicSchema>;

export const NotificationPreferenceSchema = z.object({
  topic: NotificationTopicSchema,
  channels: z.array(NotificationChannelSchema),
});
export type NotificationPreference = z.infer<typeof NotificationPreferenceSchema>;
