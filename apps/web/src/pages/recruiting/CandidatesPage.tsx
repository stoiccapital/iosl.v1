import { NewCandidateButton } from '@/features/recruiting/CandidateDialog';
import { CandidatesPipeline } from '@/features/recruiting/CandidatesPipeline';

export function CandidatesPage() {
  return (
    <main className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground text-sm">
            Pipeline: Applied · Screen · Interview · Offer · Hired · Rejected.
          </p>
        </div>
        <NewCandidateButton />
      </div>
      <CandidatesPipeline />
    </main>
  );
}
