import type { ContractStatus, SupplierCategory } from '@factory/shared';

export const SUPPLIER_CATEGORY_LABEL: Record<SupplierCategory, string> = {
  saas: 'SaaS',
  infrastructure: 'Infrastructure',
  marketing: 'Marketing',
  legal: 'Legal',
  office: 'Office',
  other: 'Other',
};

export const CONTRACT_STATUS_LABEL: Record<ContractStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  ended: 'Ended',
};

export const CONTRACT_STATUS_VARIANT: Record<
  ContractStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  active: 'default',
  paused: 'secondary',
  ended: 'destructive',
};
