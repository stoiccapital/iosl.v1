import type {
  CandidateSource,
  CandidateStage,
  EmploymentType,
  PositionStatus,
} from '@factory/shared';

export const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
};

export const POSITION_STATUS_LABEL: Record<PositionStatus, string> = {
  open: 'Open',
  paused: 'Paused',
  filled: 'Filled',
};

export const POSITION_STATUS_VARIANT: Record<
  PositionStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  open: 'default',
  paused: 'secondary',
  filled: 'outline',
};

export const CANDIDATE_STAGE_LABEL: Record<CandidateStage, string> = {
  applied: 'Applied',
  screen: 'Screen',
  interview: 'Interview',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
};

export const CANDIDATE_STAGE_VARIANT: Record<
  CandidateStage,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  applied: 'outline',
  screen: 'secondary',
  interview: 'secondary',
  offer: 'default',
  hired: 'default',
  rejected: 'destructive',
};

export const CANDIDATE_SOURCE_LABEL: Record<CandidateSource, string> = {
  inbound: 'Inbound',
  referral: 'Referral',
  outbound: 'Outbound',
  agency: 'Agency',
};
