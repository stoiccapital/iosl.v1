import { NewPositionButton } from '@/features/recruiting/PositionDialog';
import { PositionsTable } from '@/features/recruiting/PositionsTable';

export function PositionsPage() {
  return (
    <main className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Positions</h1>
          <p className="text-muted-foreground text-sm">Open roles being recruited for.</p>
        </div>
        <NewPositionButton />
      </div>
      <PositionsTable />
    </main>
  );
}
