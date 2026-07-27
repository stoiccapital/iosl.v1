import { z } from 'zod';

export const OkrPeriodSchema = z.string().regex(/^\d{4}-Q[1-4]$/);
export type OkrPeriod = z.infer<typeof OkrPeriodSchema>;

export const OkrStatusSchema = z.enum(['on_track', 'at_risk', 'off_track', 'done']);
export type OkrStatus = z.infer<typeof OkrStatusSchema>;

export const ObjectiveSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  period: OkrPeriodSchema,
  ownerId: z.string().uuid().nullable(),
  status: OkrStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Objective = z.infer<typeof ObjectiveSchema>;

export const CreateObjectiveInputSchema = ObjectiveSchema.pick({
  title: true,
  period: true,
  ownerId: true,
  status: true,
});
export type CreateObjectiveInput = z.infer<typeof CreateObjectiveInputSchema>;

/* ---------- Key results ---------- */

export const KeyResultSchema = z.object({
  id: z.string().uuid(),
  objectiveId: z.string().uuid(),
  title: z.string().min(1),
  target: z.number(),
  current: z.number(),
  unit: z.string(),
  status: OkrStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type KeyResult = z.infer<typeof KeyResultSchema>;

export const CreateKeyResultInputSchema = KeyResultSchema.pick({
  objectiveId: true,
  title: true,
  target: true,
  current: true,
  unit: true,
  status: true,
});
export type CreateKeyResultInput = z.infer<typeof CreateKeyResultInputSchema>;
