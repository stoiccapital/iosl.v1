import { useQuery } from '@tanstack/react-query';
import {
  BiCostsViewSchema,
  BiCustomersViewSchema,
  BiOverviewViewSchema,
  BiRetentionViewSchema,
  BiRevenueViewSchema,
  BiSalesViewSchema,
  BiUsageViewSchema,
  DashboardViewSchema,
} from '@factory/shared';
import { api } from '@/lib/api-client';

/**
 * Single call powering the executive dashboard. All 20 headline metrics come
 * back in one response, server-aggregated + 15-min cached, so the FE no longer
 * fans out 10 list requests and re-computes sums in the browser.
 */
export function useDashboard() {
  return useQuery({
    queryKey: ['bi', 'dashboard'],
    queryFn: async () => DashboardViewSchema.parse(await api.get<unknown>('/bi/dashboard')),
    staleTime: 60_000,
  });
}

export function useBiCustomers() {
  return useQuery({
    queryKey: ['bi', 'customers'],
    queryFn: async () => BiCustomersViewSchema.parse(await api.get<unknown>('/bi/customers')),
  });
}
export function useBiRevenue() {
  return useQuery({
    queryKey: ['bi', 'revenue'],
    queryFn: async () => BiRevenueViewSchema.parse(await api.get<unknown>('/bi/revenue')),
  });
}
export function useBiUsage() {
  return useQuery({
    queryKey: ['bi', 'usage'],
    queryFn: async () => BiUsageViewSchema.parse(await api.get<unknown>('/bi/usage')),
  });
}
export function useBiCosts() {
  return useQuery({
    queryKey: ['bi', 'costs'],
    queryFn: async () => BiCostsViewSchema.parse(await api.get<unknown>('/bi/costs')),
  });
}
export function useBiOverview() {
  return useQuery({
    queryKey: ['bi', 'overview'],
    queryFn: async () => BiOverviewViewSchema.parse(await api.get<unknown>('/bi/overview')),
  });
}
export function useBiRetention() {
  return useQuery({
    queryKey: ['bi', 'retention'],
    queryFn: async () => BiRetentionViewSchema.parse(await api.get<unknown>('/bi/retention')),
  });
}
export function useBiSales() {
  return useQuery({
    queryKey: ['bi', 'sales'],
    queryFn: async () => BiSalesViewSchema.parse(await api.get<unknown>('/bi/sales')),
  });
}
