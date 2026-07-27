import { useQuery } from '@tanstack/react-query';
import { HealthStatusSchema, type HealthStatus } from '@factory/shared';
import { api } from '@/lib/api-client';

async function fetchHealth(): Promise<HealthStatus> {
  const raw = await api.get<unknown>('/health');
  return HealthStatusSchema.parse(raw);
}

export function useHealth() {
  return useQuery({
    queryKey: ['health', 'status'],
    queryFn: fetchHealth,
    refetchInterval: 30_000,
  });
}
