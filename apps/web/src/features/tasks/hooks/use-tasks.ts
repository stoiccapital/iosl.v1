import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  TaskListSchema,
  TaskSchema,
  type CreateTaskInput,
  type Task,
  type UpdateTaskInput,
} from '@factory/shared';
import { api } from '@/lib/api-client';

const listKey = () => ['tasks', 'list'] as const;
const detailKey = (id: string) => ['tasks', 'detail', id] as const;

async function fetchTasks(): Promise<Task[]> {
  const raw = await api.get<unknown>('/tasks');
  return TaskListSchema.parse(raw);
}

async function fetchTask(id: string): Promise<Task> {
  const raw = await api.get<unknown>(`/tasks/${id}`);
  return TaskSchema.parse(raw);
}

export function useTasks() {
  return useQuery({ queryKey: listKey(), queryFn: fetchTasks });
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
