import { z } from 'zod';

export const FeatureStatusSchema = z.enum([
  'idea',
  'planned',
  'in_progress',
  'beta',
  'shipped',
  'archived',
]);
export type FeatureStatus = z.infer<typeof FeatureStatusSchema>;

export const FeatureAreaSchema = z.enum(['core', 'analytics', 'automation', 'platform', 'other']);
export type FeatureArea = z.infer<typeof FeatureAreaSchema>;

export const FeatureSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  area: FeatureAreaSchema,
  status: FeatureStatusSchema,
  effort: z.enum(['xs', 's', 'm', 'l', 'xl']),
  targetRelease: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Feature = z.infer<typeof FeatureSchema>;

export const CreateFeatureInputSchema = FeatureSchema.pick({
  title: true,
  description: true,
  area: true,
  status: true,
  effort: true,
  targetRelease: true,
});
export type CreateFeatureInput = z.infer<typeof CreateFeatureInputSchema>;

/* ---------- Releases ---------- */

export const ReleaseSchema = z.object({
  id: z.string().uuid(),
  version: z.string().min(1),
  releasedAt: z.string().datetime(),
  notes: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Release = z.infer<typeof ReleaseSchema>;

export const CreateReleaseInputSchema = ReleaseSchema.pick({
  version: true,
  releasedAt: true,
  notes: true,
});
export type CreateReleaseInput = z.infer<typeof CreateReleaseInputSchema>;

/* ---------- Incidents ---------- */

export const IncidentSeveritySchema = z.enum(['sev1', 'sev2', 'sev3', 'sev4']);
export type IncidentSeverity = z.infer<typeof IncidentSeveritySchema>;

export const IncidentStatusSchema = z.enum(['investigating', 'identified', 'monitoring', 'resolved']);
export type IncidentStatus = z.infer<typeof IncidentStatusSchema>;

export const IncidentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  severity: IncidentSeveritySchema,
  status: IncidentStatusSchema,
  summary: z.string(),
  startedAt: z.string().datetime(),
  resolvedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Incident = z.infer<typeof IncidentSchema>;

export const CreateIncidentInputSchema = IncidentSchema.pick({
  title: true,
  severity: true,
  status: true,
  summary: true,
  startedAt: true,
  resolvedAt: true,
});
export type CreateIncidentInput = z.infer<typeof CreateIncidentInputSchema>;
