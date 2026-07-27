import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CompensationEventSchema,
  CompensationRuleSchema,
  type CompensationEvent,
  type CompensationRule,
  type CreateCompensationEventInput,
  type CreateCompensationRuleInput,
} from '@factory/shared';
import { api } from '@/lib/api-client';
import { makeResourceHooks } from '@/lib/crud-hooks';

export const compensationRuleHooks = makeResourceHooks<
  CompensationRule,
  CreateCompensationRuleInput,
  Partial<CreateCompensationRuleInput>
>({
  base: '/compensation/rules',
  domain: 'compensation-rules',
  itemSchema: CompensationRuleSchema,
  listSchema: z.array(CompensationRuleSchema),
});

export const compensationEventHooks = makeResourceHooks<
  CompensationEvent,
  CreateCompensationEventInput,
  Partial<CreateCompensationEventInput>
>({
  base: '/compensation/events',
  domain: 'compensation-events',
  itemSchema: CompensationEventSchema,
  listSchema: z.array(CompensationEventSchema),
});

function useTransition(action: 'approve' | 'pay' | 'void') {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      CompensationEventSchema.parse(
        await api.patch<unknown>(`/compensation/events/${id}/${action}`),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['compensation-events'] }),
  });
}

export function useApproveCompensationEvent() {
  return useTransition('approve');
}
export function usePayCompensationEvent() {
  return useTransition('pay');
}
export function useVoidCompensationEvent() {
  return useTransition('void');
}
