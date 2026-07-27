import { NewPersonButton } from '@/features/hr/PersonDialog';
import { PeopleTable } from '@/features/hr/PeopleTable';

export function FreelancersPage() {
  return (
    <main className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Freelancers</h1>
          <p className="text-muted-foreground text-sm">Contractors and their engagements.</p>
        </div>
        <NewPersonButton type="freelancer" />
      </div>
      <PeopleTable type="freelancer" />
    </main>
  );
}
