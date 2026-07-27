import { OpportunitiesPipeline } from '@/features/crm/opportunities/OpportunitiesPipeline';
import { NewOpportunityButton } from '@/features/crm/opportunities/OpportunityDialog';

export function OpportunitiesPage() {
  return (
    <main className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Opportunities</h1>
          <p className="text-muted-foreground text-sm">
            Deals across Qualified · Trial · Decision · Close Won · Close Lost.
          </p>
        </div>
        <NewOpportunityButton />
      </div>
      <OpportunitiesPipeline />
    </main>
  );
}
