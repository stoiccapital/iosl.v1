import type { OpportunityStage } from '@factory/shared';

export const STAGE_LABEL: Record<OpportunityStage, string> = {
  qualified: 'Qualified',
  trial: 'Trial',
  decision: 'Decision',
  proposal: 'Proposal',
  close_won: 'Close Won',
  close_lost: 'Close Lost',
};

export const STAGE_VARIANT: Record<
  OpportunityStage,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  qualified: 'outline',
  trial: 'secondary',
  decision: 'secondary',
  proposal: 'secondary',
  close_won: 'default',
  close_lost: 'destructive',
};
