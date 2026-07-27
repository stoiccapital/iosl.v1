import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import {
  CreateWebsiteInputSchema,
  SubmitWebsiteInputSchema,
  UpdateWebsiteInputSchema,
  WebsiteSchema,
  WebsiteSubmissionSchema,
  type CreateWebsiteInput,
  type SubmitWebsiteInput,
  type UpdateWebsiteInput,
  type Website,
  type WebsiteSubmission,
} from '@factory/shared';
import { api } from '@/lib/api-client';

const listKey = ['websites', 'list'] as const;
const detailKey = (id: string) => ['websites', 'detail', id] as const;
const publicKey = (slug: string) => ['websites', 'public', slug] as const;
const submissionsKey = (id: string) => ['websites', 'submissions', id] as const;

const listSchema = z.array(WebsiteSchema);
const submissionsSchema = z.array(WebsiteSubmissionSchema);

export function useWebsites() {
  return useQuery<Website[]>({
    queryKey: listKey,
    queryFn: async () => listSchema.parse(await api.get('/websites')),
  });
}

export function useWebsite(id: string | undefined) {
  return useQuery<Website>({
    queryKey: id ? detailKey(id) : ['websites', 'detail', 'noop'],
    queryFn: async () => WebsiteSchema.parse(await api.get(`/websites/${id}`)),
    enabled: Boolean(id),
  });
}

export function useCreateWebsite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateWebsiteInput) => {
      const parsed = CreateWebsiteInputSchema.parse(input);
      return WebsiteSchema.parse(await api.post('/websites', parsed));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['websites'] }),
  });
}

export function useUpdateWebsite(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateWebsiteInput) => {
      const parsed = UpdateWebsiteInputSchema.parse(input);
      return WebsiteSchema.parse(await api.patch(`/websites/${id}`, parsed));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['websites'] }),
  });
}

export function useDeleteWebsite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/websites/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['websites'] }),
  });
}

export function useWebsiteSubmissions(websiteId: string | undefined) {
  return useQuery<WebsiteSubmission[]>({
    queryKey: websiteId ? submissionsKey(websiteId) : ['websites', 'submissions', 'noop'],
    queryFn: async () =>
      submissionsSchema.parse(await api.get(`/websites/${websiteId}/submissions`)),
    enabled: Boolean(websiteId),
  });
}

export function usePublicSite(slug: string | undefined) {
  return useQuery<Website>({
    queryKey: slug ? publicKey(slug) : ['websites', 'public', 'noop'],
    queryFn: async () => WebsiteSchema.parse(await api.get(`/sites/${slug}`)),
    enabled: Boolean(slug),
  });
}

export function useSubmitToSite(slug: string) {
  return useMutation({
    mutationFn: async (input: SubmitWebsiteInput) => {
      const parsed = SubmitWebsiteInputSchema.parse(input);
      return WebsiteSubmissionSchema.parse(await api.post(`/sites/${slug}/submit`, parsed));
    },
  });
}
