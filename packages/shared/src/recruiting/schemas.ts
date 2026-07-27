import { z } from 'zod';

export const EmploymentTypeSchema = z.enum(['full_time', 'part_time', 'contract']);
export type EmploymentType = z.infer<typeof EmploymentTypeSchema>;

export const PositionStatusSchema = z.enum(['open', 'paused', 'filled']);
export type PositionStatus = z.infer<typeof PositionStatusSchema>;

export const PositionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  department: z.string().min(1),
  location: z.string().min(1),
  employmentType: EmploymentTypeSchema,
  openings: z.number().int().nonnegative(),
  status: PositionStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Position = z.infer<typeof PositionSchema>;

export const CreatePositionInputSchema = PositionSchema.pick({
  title: true,
  department: true,
  location: true,
  employmentType: true,
  openings: true,
  status: true,
});
export type CreatePositionInput = z.infer<typeof CreatePositionInputSchema>;

/* ---------- Candidates ---------- */

export const CandidateStageSchema = z.enum([
  'applied',
  'screen',
  'interview',
  'offer',
  'hired',
  'rejected',
]);
export type CandidateStage = z.infer<typeof CandidateStageSchema>;

export const CANDIDATE_STAGE_ORDER: CandidateStage[] = [
  'applied',
  'screen',
  'interview',
  'offer',
  'hired',
  'rejected',
];

export const CandidateSourceSchema = z.enum(['inbound', 'referral', 'outbound', 'agency']);
export type CandidateSource = z.infer<typeof CandidateSourceSchema>;

export const CandidateSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  positionId: z.string().uuid(),
  stage: CandidateStageSchema,
  source: CandidateSourceSchema,
  notes: z.string(),
  appliedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Candidate = z.infer<typeof CandidateSchema>;

export const CreateCandidateInputSchema = CandidateSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  positionId: true,
  stage: true,
  source: true,
  notes: true,
  appliedAt: true,
});
export type CreateCandidateInput = z.infer<typeof CreateCandidateInputSchema>;
