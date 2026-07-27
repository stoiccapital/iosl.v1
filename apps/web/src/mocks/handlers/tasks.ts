import { http, HttpResponse } from 'msw';
import {
  CreateTaskInputSchema,
  UpdateTaskInputSchema,
  type Task,
} from '@factory/shared';
import { db } from '../db';

const iso = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const tasksHandlers = [
  http.get('/api/tasks', async () => {
    await delay(150);
    return HttpResponse.json(db.tasks);
  }),

  http.get('/api/tasks/:id', async ({ params }) => {
    await delay(100);
    const task = db.tasks.find((t) => t.id === params['id']);
    if (!task) return new HttpResponse('Not Found', { status: 404 });
    return HttpResponse.json(task);
  }),

  http.post('/api/tasks', async ({ request }) => {
    await delay(200);
    const raw = await request.json();
    const parsed = CreateTaskInputSchema.safeParse(raw);
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const task: Task = {
      id: uuid(),
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      createdAt: iso(),
      updatedAt: iso(),
    };
    db.tasks.unshift(task);
    return HttpResponse.json(task, { status: 201 });
  }),

  http.patch('/api/tasks/:id', async ({ params, request }) => {
    await delay(200);
    const idx = db.tasks.findIndex((t) => t.id === params['id']);
    if (idx === -1) return new HttpResponse('Not Found', { status: 404 });
    const raw = await request.json();
    const parsed = UpdateTaskInputSchema.safeParse(raw);
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const current = db.tasks[idx]!;
    const next: Task = {
      ...current,
      ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
      ...(parsed.data.description !== undefined
        ? { description: parsed.data.description }
        : {}),
      ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
      updatedAt: iso(),
    };
    db.tasks[idx] = next;
    return HttpResponse.json(next);
  }),

  http.delete('/api/tasks/:id', async ({ params }) => {
    await delay(150);
    const idx = db.tasks.findIndex((t) => t.id === params['id']);
    if (idx === -1) return new HttpResponse('Not Found', { status: 404 });
    db.tasks.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
