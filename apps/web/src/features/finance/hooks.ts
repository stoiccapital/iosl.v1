import { useQuery } from '@tanstack/react-query';
import { CostSummarySchema, PnlViewSchema, RevenueSummarySchema } from '@factory/shared';
import { api } from '@/lib/api-client';

export function useRevenueSummary() {
  return useQuery({
    queryKey: ['finance', 'revenue'],
    queryFn: async () => RevenueSummarySchema.parse(await api.get<unknown>('/finance/revenue')),
  });
}

export function useCostSummary() {
  return useQuery({
    queryKey: ['finance', 'costs'],
    queryFn: async () => CostSummarySchema.parse(await api.get<unknown>('/finance/costs')),
  });
}

export function usePnl(months = 6) {
  return useQuery({
    queryKey: ['finance', 'pnl', months],
    queryFn: async () =>
      PnlViewSchema.parse(await api.get<unknown>(`/finance/pnl?months=${months}`)),
  });
}
