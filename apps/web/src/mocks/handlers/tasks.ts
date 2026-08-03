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
  http.get('/api/tasks', async ({ request }) => {
    await delay(120);
    const url = new URL(request.url);
    const assignee = url.searchParams.get('assigneeId');
    const status = url.searchParams.get('status');
    const relatedType = url.searchParams.get('relatedType');
    const relatedId = url.searchParams.get('relatedId');

    let rows = db.tasks.slice();
    if (assignee) rows = rows.filter((t) => t.assigneeId === assignee);
    if (status) rows = rows.filter((t) => t.status === status);
    if (relatedType && relatedId) {
      rows = rows.filter((t) => t.relatedType === relatedType && t.relatedId === relatedId);
    }
    // Newest first, but incomplete-before-complete
    rows.sort((a, b) => {
      if (a.status !== 'done' && b.status === 'done') return -1;
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.dueAt && b.dueAt) return a.dueAt < b.dueAt ? -1 : 1;
      if (a.dueAt) return -1;
      if (b.dueAt) return 1;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
    return HttpResponse.json(rows);
  }),

  http.get('/api/tasks/:id', async ({ params }) => {
    await delay(80);
    const task = db.tasks.find((t) => t.id === params['id']);
    if (!task) return new HttpResponse('Not Found', { status: 404 });
    return HttpResponse.json(task);
  }),

  http.post('/api/tasks', async ({ request }) => {
    await delay(150);
    const raw = await request.json();
    const parsed = CreateTaskInputSchema.safeParse(raw);
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const now = iso();
    const task: Task = {
      id: uuid(),
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      assigneeId: parsed.data.assigneeId,
      dueAt: parsed.data.dueAt,
      relatedType: parsed.data.relatedType,
      relatedId: parsed.data.relatedId,
      doneAt: parsed.data.status === 'done' ? now : null,
      doneById: parsed.data.status === 'done' ? db.currentUser.id : null,
      createdAt: now,
      updatedAt: now,
    };
    db.tasks.unshift(task);
    return HttpResponse.json(task, { status: 201 });
  }),

  http.patch('/api/tasks/:id', async ({ params, request }) => {
    await delay(150);
    const idx = db.tasks.findIndex((t) => t.id === params['id']);
    if (idx === -1) return new HttpResponse('Not Found', { status: 404 });
    const raw = await request.json();
    const parsed = UpdateTaskInputSchema.safeParse(raw);
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const current = db.tasks[idx]!;
    const now = iso();
    const patch = parsed.data;
    const nextStatus = patch.status ?? current.status;
    const transitioningToDone = nextStatus === 'done' && current.status !== 'done';
    const leavingDone = nextStatus !== 'done' && current.status === 'done';
    const next: Task = {
      ...current,
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.description !== undefined ? { description: patch.description } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.assigneeId !== undefined ? { assigneeId: patch.assigneeId } : {}),
      ...(patch.dueAt !== undefined ? { dueAt: patch.dueAt } : {}),
      ...(patch.relatedType !== undefined ? { relatedType: patch.relatedType } : {}),
      ...(patch.relatedId !== undefined ? { relatedId: patch.relatedId } : {}),
      doneAt: transitioningToDone ? now : leavingDone ? null : current.doneAt,
      doneById: transitioningToDone ? db.currentUser.id : leavingDone ? null : current.doneById,
      updatedAt: now,
    };
    db.tasks[idx] = next;
    return HttpResponse.json(next);
  }),

  http.delete('/api/tasks/:id', async ({ params }) => {
    await delay(100);
    const idx = db.tasks.findIndex((t) => t.id === params['id']);
    if (idx === -1) return new HttpResponse('Not Found', { status: 404 });
    db.tasks.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
