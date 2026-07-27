import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { AuditEntrySchema, type AuditEntry } from '@factory/shared';
import { api } from '@/lib/api-client';

const listSchema = z.array(AuditEntrySchema);

export function useAuditLog() {
  return useQuery<AuditEntry[]>({
    queryKey: ['audit', 'list'],
    queryFn: async () => listSchema.parse(await api.get<unknown>('/audit')),
  });
}
