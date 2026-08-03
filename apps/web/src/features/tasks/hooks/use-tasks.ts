import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  TaskListSchema,
  TaskSchema,
  type CreateTaskInput,
  type Task,
  type TaskRelatedType,
  type UpdateTaskInput,
} from '@factory/shared';
import { api } from '@/lib/api-client';

export type TaskListFilters = {
  assigneeId?: string | null;
  status?: 'open' | 'in_progress' | 'done' | null;
  relatedType?: TaskRelatedType | null;
  relatedId?: string | null;
};

const listKey = (filters?: TaskListFilters) =>
  ['tasks', 'list', filters ?? {}] as const;
const detailKey = (id: string) => ['tasks', 'detail', id] as const;

async function fetchTasks(filters?: TaskListFilters): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters?.assigneeId) params.set('assigneeId', filters.assigneeId);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.relatedType && filters.relatedId) {
    params.set('relatedType', filters.relatedType);
    params.set('relatedId', filters.relatedId);
  }
  const qs = params.toString();
  const raw = await api.get<unknown>(qs ? `/tasks?${qs}` : '/tasks');
  return TaskListSchema.parse(raw);
}

async function fetchTask(id: string): Promise<Task> {
  const raw = await api.get<unknown>(`/tasks/${id}`);
  return TaskSchema.parse(raw);
}

export function useTasks(filters?: TaskListFilters) {
  return useQuery({
    queryKey: listKey(filters),
    queryFn: () => fetchTasks(filters),
  });
}

export function useRelatedTasks(relatedType: TaskRelatedType, relatedId: string | undefined) {
  return useQuery({
    queryKey: listKey({ relatedType, relatedId: relatedId ?? null }),
    queryFn: () => fetchTasks({ relatedType, relatedId: relatedId ?? null }),
    enabled: Boolean(relatedId),
  });
}

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: id ? detailKey(id) : ['tasks', 'detail', 'noop'],
    queryFn: () => fetchTask(id!),
    enabled: Boolean(id),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const raw = await api.post<unknown>('/tasks', input);
      return TaskSchema.parse(raw);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateTaskInput) => {
      const raw = await api.patch<unknown>(`/tasks/${id}`, input);
      return TaskSchema.parse(raw);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/tasks/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
