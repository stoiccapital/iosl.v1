import { z } from 'zod';

export const RoleSchema = z.enum(['admin', 'manager', 'employee', 'viewer', 'finance', 'agent']);
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
  finance: ['dashboard', 'crm', 'billing', 'finance', 'suppliers', 'hr', 'bi', 'docs', 'settings'],
  /**
   * `agent` = automated / AI user. Read access to the modules an AI assistant
   * needs to reason about the business; write access is gated per-action in
   * ACTION_PERMISSIONS and by dry-run flags on state transitions.
   */
  agent: ['dashboard', 'crm', 'billing', 'finance', 'suppliers', 'hr', 'projects', 'bi', 'docs'],
};

export function canAccess(role: Role, moduleKey: ModuleKey): boolean {
  return MODULE_ACCESS[role].includes(moduleKey);
}

/* ---------- Action-level permissions ---------- */

export const ActionKeySchema = z.enum([
  'opportunity.close',
  'opportunity.markContractSigned',
  'subscription.create',
  'subscription.activate',
  'subscription.pause',
  'subscription.cancel',
  'subscription.viewAuditLog',
]);
export type ActionKey = z.infer<typeof ActionKeySchema>;

/**
 * Which roles are allowed to perform each action. Enforced on the BE;
 * mirrored on the FE for progressive disclosure (hide/disable controls).
 */
export const ACTION_PERMISSIONS: Record<ActionKey, Role[]> = {
  'opportunity.close': ['admin', 'manager', 'employee'],
  'opportunity.markContractSigned': ['admin', 'finance'],
  'subscription.create': ['admin', 'manager', 'employee'],
  'subscription.activate': ['admin', 'finance'],
  'subscription.pause': ['admin', 'finance'],
  'subscription.cancel': ['admin', 'finance'],
  'subscription.viewAuditLog': ['admin', 'finance', 'manager'],
};

export function canPerform(role: Role, action: ActionKey): boolean {
  return ACTION_PERMISSIONS[action].includes(role);
}
