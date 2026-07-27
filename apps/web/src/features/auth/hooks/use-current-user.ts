import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CurrentUserSchema, type CurrentUser, type Role } from '@factory/shared';
import { api } from '@/lib/api-client';

const key = ['auth', 'me'] as const;

async function fetchMe(): Promise<CurrentUser> {
  const raw = await api.get<unknown>('/me');
  return CurrentUserSchema.parse(raw);
}

export function useCurrentUser() {
  return useQuery({ queryKey: key, queryFn: fetchMe, staleTime: Infinity });
}

export function useSetRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (role: Role) => {
      const raw = await api.patch<unknown>('/me/role', { role });
      return CurrentUserSchema.parse(raw);
    },
    onSuccess: (user) => {
      qc.setQueryData(key, user);
    },
  });
}
