import { NewPersonButton } from '@/features/hr/PersonDialog';
import { PeopleTable } from '@/features/hr/PeopleTable';

export function EmployeesPage() {
  return (
    <main className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          <p className="text-muted-foreground text-sm">Headcount, roles, locations.</p>
        </div>
        <NewPersonButton type="employee" />
      </div>
      <PeopleTable type="employee" />
    </main>
  );
}
