import { LeadsTable } from '@/features/crm/leads/LeadsTable';
import { NewLeadButton } from '@/features/crm/leads/LeadDialog';

export function LeadsPage() {
  return (
    <main className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-muted-foreground text-sm">Top-of-funnel prospects.</p>
        </div>
        <NewLeadButton />
      </div>
      <LeadsTable />
    </main>
  );
}
