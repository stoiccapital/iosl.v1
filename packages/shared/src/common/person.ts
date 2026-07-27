import { z } from 'zod';

export const PersonTypeSchema = z.enum(['employee', 'freelancer', 'candidate']);
export type PersonType = z.infer<typeof PersonTypeSchema>;

export const PersonSchema = z.object({
  id: z.string().uuid(),
  type: PersonTypeSchema,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  role: z.string(),
  location: z.string(),
  startDate: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Person = z.infer<typeof PersonSchema>;
