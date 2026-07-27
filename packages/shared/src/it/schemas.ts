import { z } from 'zod';
import { MoneyCentsSchema } from '../common/money';

export const DeviceKindSchema = z.enum(['laptop', 'monitor', 'phone', 'tablet', 'other']);
export type DeviceKind = z.infer<typeof DeviceKindSchema>;

export const DeviceStatusSchema = z.enum(['in_use', 'spare', 'retired', 'lost']);
export type DeviceStatus = z.infer<typeof DeviceStatusSchema>;

export const DeviceSchema = z.object({
  id: z.string().uuid(),
  kind: DeviceKindSchema,
  model: z.string().min(1),
  serialNumber: z.string().min(1),
  assigneeId: z.string().uuid().nullable(),
  purchasedAt: z.string().datetime(),
  costCents: MoneyCentsSchema,
  status: DeviceStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Device = z.infer<typeof DeviceSchema>;

export const CreateDeviceInputSchema = DeviceSchema.pick({
  kind: true,
  model: true,
  serialNumber: true,
  assigneeId: true,
  purchasedAt: true,
  costCents: true,
  status: true,
});
export type CreateDeviceInput = z.infer<typeof CreateDeviceInputSchema>;

/* ---------- Software licenses (internal SaaS seats) ---------- */

export const SoftwareLicenseSchema = z.object({
  id: z.string().uuid(),
  tool: z.string().min(1),
  seatCount: z.number().int().nonnegative(),
  seatsUsed: z.number().int().nonnegative(),
  monthlyCostCents: MoneyCentsSchema,
  renewalAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type SoftwareLicense = z.infer<typeof SoftwareLicenseSchema>;

export const CreateSoftwareLicenseInputSchema = SoftwareLicenseSchema.pick({
  tool: true,
  seatCount: true,
  seatsUsed: true,
  monthlyCostCents: true,
  renewalAt: true,
});
export type CreateSoftwareLicenseInput = z.infer<typeof CreateSoftwareLicenseInputSchema>;
