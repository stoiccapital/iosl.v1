import type {
  CompensationKind,
  CompensationStatus,
  CompensationTrigger,
} from '@factory/shared';

export const COMPENSATION_KIND_LABEL: Record<CompensationKind, string> = {
  sales_commission: 'Sales commission',
  expansion_commission: 'Expansion commission',
  retention_bonus: 'Retention bonus',
  referral_bonus: 'Referral bonus',
  signing_bonus: 'Signing bonus',
  spot_bonus: 'Spot bonus',
};

export const COMPENSATION_TRIGGER_LABEL: Record<CompensationTrigger, string> = {
  opportunity_won: 'Opportunity won',
  customer_created: 'Customer created',
  customer_expansion: 'Customer expansion',
  referral_hire: 'Referral hire',
  manual: 'Manual',
};

export const COMPENSATION_STATUS_LABEL: Record<CompensationStatus, string> = {
  earned: 'Earned',
  approved: 'Approved',
  paid: 'Paid',
  void: 'Void',
};

export const COMPENSATION_STATUS_VARIANT: Record<
  CompensationStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  earned: 'secondary',
  approved: 'default',
  paid: 'outline',
  void: 'destructive',
};
