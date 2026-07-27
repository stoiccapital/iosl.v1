import { z } from 'zod';

export const RoleSchema = z.enum(['admin', 'manager', 'employee', 'viewer']);
export type Role = z.infer<typeof RoleSchema>;

export const ModuleKeySchema = z.enum([
  'dashboard',
  'crm',
  'success',
  'support',
  'billing',
  'finance',
  'suppliers',
  'hr',
  'recruiting',
  'projects',
  'product',
  'marketing',
  'legal',
  'it',
  'okrs',
  'docs',
  'bi',
  'settings',
]);
export type ModuleKey = z.infer<typeof ModuleKeySchema>;

export const CurrentUserSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  role: RoleSchema,
});
export type CurrentUser = z.infer<typeof CurrentUserSchema>;

const ALL_MODULES: ModuleKey[] = [
  'dashboard',
  'crm',
  'success',
  'support',
  'billing',
  'finance',
  'suppliers',
  'hr',
  'recruiting',
  'projects',
  'product',
  'marketing',
  'legal',
  'it',
  'okrs',
  'docs',
  'bi',
  'settings',
];

/**
 * Module visibility by role. Admin sees everything;
 * everyone else sees a curated subset.
 */
export const MODULE_ACCESS: Record<Role, ModuleKey[]> = {
  admin: ALL_MODULES,
  manager: ALL_MODULES,
  employee: ['dashboard', 'crm', 'support', 'projects', 'product', 'okrs', 'docs', 'recruiting'],
  viewer: ['dashboard', 'bi', 'docs'],
};

export function canAccess(role: Role, moduleKey: ModuleKey): boolean {
  return MODULE_ACCESS[role].includes(moduleKey);
}
