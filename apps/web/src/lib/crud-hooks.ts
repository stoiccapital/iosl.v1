import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import type { z } from 'zod';
import { api } from './api-client';

type Row = { id: string };

/**
 * Convenience: standard list + item + create/update/delete hooks for a resource,
 * with response Zod parsing and cache invalidation.
 */
export function makeResourceHooks<T extends Row, C, U>(opts: {
  base: string;
  domain: string;
  itemSchema: z.ZodType<T>;
  listSchema: z.ZodType<T[]>;
}) {
  const { base, domain, itemSchema, listSchema } = opts;

  const listKey = [domain, 'list'] as const;
  const detailKey = (id: string) => [domain, 'detail', id] as const;

  function useList() {
    return useQuery<T[]>({
      queryKey: listKey as unknown as QueryKey,
      queryFn: async () => listSchema.parse(await api.get<unknown>(base)),
    });
  }

  function useItem(id: string | undefined) {
    return useQuery<T>({
      queryKey: (id ? detailKey(id) : [domain, 'detail', 'noop']) as unknown as QueryKey,
      queryFn: async () => itemSchema.parse(await api.get<unknown>(`${base}/${id}`)),
      enabled: Boolean(id),
    });
  }

  function useCreate() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (input: C) =>
        itemSchema.parse(await api.post<unknown>(base, input as unknown)),
      onSuccess: () => qc.invalidateQueries({ queryKey: [domain] }),
    });
  }

  function useUpdate(id: string) {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (input: U) =>
        itemSchema.parse(await api.patch<unknown>(`${base}/${id}`, input as unknown)),
      onSuccess: () => qc.invalidateQueries({ queryKey: [domain] }),
    });
  }

  function useRemove() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => api.delete<void>(`${base}/${id}`),
      onSuccess: () => qc.invalidateQueries({ queryKey: [domain] }),
    });
  }

  return { useList, useItem, useCreate, useUpdate, useRemove };
}
