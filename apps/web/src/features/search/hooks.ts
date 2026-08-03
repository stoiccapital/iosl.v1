import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api-client';

const HitSchema = z.object({
  id: z.string(),
  entityType: z.enum(['account', 'contact', 'opportunity', 'account_note', 'contact_note']),
  primary: z.string(),
  secondary: z.string().optional(),
  snippet: z.string().optional(),
  href: z.string(),
});
export type SearchHit = z.infer<typeof HitSchema>;

const SearchResultSchema = z.object({
  accounts: z.array(HitSchema),
  contacts: z.array(HitSchema),
  opportunities: z.array(HitSchema),
  notes: z.array(HitSchema),
});
export type SearchResult = z.infer<typeof SearchResultSchema>;

function useDebounced<T>(value: T, delayMs = 150): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export function useGlobalSearch(query: string) {
  const debounced = useDebounced(query.trim(), 150);
  return useQuery<SearchResult>({
    queryKey: ['search', 'global', debounced],
    queryFn: async () =>
      SearchResultSchema.parse(
        await api.get<unknown>(`/search?q=${encodeURIComponent(debounced)}`),
      ),
    enabled: debounced.length >= 2,
    staleTime: 15_000,
  });
}
