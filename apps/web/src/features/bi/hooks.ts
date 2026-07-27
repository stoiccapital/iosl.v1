import { useQuery } from '@tanstack/react-query';
import {
  BiCostsViewSchema,
  BiCustomersViewSchema,
  BiOverviewViewSchema,
  BiRetentionViewSchema,
  BiRevenueViewSchema,
  BiSalesViewSchema,
  BiUsageViewSchema,
} from '@factory/shared';
import { api } from '@/lib/api-client';

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
