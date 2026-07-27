import { useQuery } from '@tanstack/react-query';
import { ChurnViewSchema } from '@factory/shared';
import { api } from '@/lib/api-client';

export function useChurn() {
  return useQuery({
    queryKey: ['crm', 'churn'],
    queryFn: async () => ChurnViewSchema.parse(await api.get<unknown>('/crm/churn')),
  });
}
