import { CreateTaskButton } from '@/features/tasks/components/TaskDialog';
import { TasksTable } from '@/features/tasks/components/TasksTable';

export function TasksPage() {
  return (
    <main className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground text-sm">Mocked backend — data resets on reload.</p>
        </div>
        <CreateTaskButton />
      </div>
      <TasksTable />
    </main>
  );
}
