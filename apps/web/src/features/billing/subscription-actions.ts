import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import {
  OpportunityCloseInputSchema,
  OpportunityCloseResultSchema,
  OpportunitySchema,
  SubscriptionSchema,
  SubscriptionTransitionSchema,
  type Opportunity,
  type OpportunityCloseInput,
  type OpportunityCloseResult,
  type Subscription,
  type SubscriptionTransition,
} from '@factory/shared';
import { api } from '@/lib/api-client';

const transitionsListSchema = z.array(SubscriptionTransitionSchema);

function invalidateBillingCaches(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['subscriptions'] });
  qc.invalidateQueries({ queryKey: ['opportunities'] });
  qc.invalidateQueries({ queryKey: ['customers'] });
  qc.invalidateQueries({ queryKey: ['subscription-transitions'] });
}

export function useCloseOpportunity(opportunityId: string) {
  const qc = useQueryClient();
  return useMutation<OpportunityCloseResult, Error, OpportunityCloseInput>({
    mutationFn: async (input) => {
      const parsed = OpportunityCloseInputSchema.parse(input);
      // One key per opp per browser tab session — retries share it, distinct
      // close attempts don't. Real BE will accept the same header.
      const idempotencyKey = `close-${opportunityId}-${sessionCloseKey(opportunityId)}`;
      const res = await api.post<unknown>(
        `/opportunities/${opportunityId}/close`,
        parsed,
        { idempotencyKey },
      );
      return OpportunityCloseResultSchema.parse(res);
    },
    onSuccess: () => invalidateBillingCaches(qc),
  });
}

const CLOSE_KEY_STORE = new Map<string, string>();
function sessionCloseKey(opportunityId: string): string {
  const existing = CLOSE_KEY_STORE.get(opportunityId);
  if (existing) return existing;
  const key = crypto.randomUUID();
  CLOSE_KEY_STORE.set(opportunityId, key);
  return key;
}

function useSubscriptionAction(action: 'activate' | 'pause' | 'cancel') {
  const qc = useQueryClient();
  return useMutation<Subscription, Error, string>({
    mutationFn: async (subscriptionId: string) => {
      const res = await api.post<unknown>(`/subscriptions/${subscriptionId}/${action}`);
      return SubscriptionSchema.parse(res);
    },
    onSuccess: () => invalidateBillingCaches(qc),
  });
}

export const useActivateSubscription = () => useSubscriptionAction('activate');
export const usePauseSubscription = () => useSubscriptionAction('pause');
export const useCancelSubscription = () => useSubscriptionAction('cancel');

export function useMarkContractSigned() {
  const qc = useQueryClient();
  return useMutation<Opportunity, Error, string>({
    mutationFn: async (opportunityId: string) => {
      const res = await api.post<unknown>(`/opportunities/${opportunityId}/mark-contract-signed`);
      return OpportunitySchema.parse(res);
    },
    onSuccess: () => invalidateBillingCaches(qc),
  });
}

export function useSimulateContractSigned() {
  const qc = useQueryClient();
  return useMutation<Opportunity, Error, string>({
    mutationFn: async (opportunityId: string) => {
      const res = await api.post<unknown>(`/dev/docusign/simulate-signed/${opportunityId}`);
      return OpportunitySchema.parse(res);
    },
    onSuccess: () => invalidateBillingCaches(qc),
  });
}

export function useSimulateStripePayment() {
  const qc = useQueryClient();
  return useMutation<Subscription, Error, string>({
    mutationFn: async (subscriptionId: string) => {
      const res = await api.post<unknown>(`/dev/stripe/simulate-payment/${subscriptionId}`);
      return SubscriptionSchema.parse(res);
    },
    onSuccess: () => invalidateBillingCaches(qc),
  });
}

export function useSubscriptionTransitions(subscriptionId: string | undefined) {
  return useQuery<SubscriptionTransition[]>({
    queryKey: ['subscription-transitions', 'list', subscriptionId ?? 'noop'],
    queryFn: async () =>
      transitionsListSchema.parse(
        await api.get<unknown>(`/subscriptions/${subscriptionId}/transitions`),
      ),
    enabled: Boolean(subscriptionId),
  });
}
