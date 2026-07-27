import { z } from 'zod';

export const HealthStatusSchema = z.object({
  status: z.enum(['ok', 'degraded', 'down']),
  version: z.string(),
  uptimeSeconds: z.number().nonnegative(),
  checkedAt: z.string().datetime(),
});

export type HealthStatus = z.infer<typeof HealthStatusSchema>;
