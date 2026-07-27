import { ContractsTable } from '@/features/suppliers/ContractsTable';
import { NewContractButton } from '@/features/suppliers/ContractDialog';

export function ContractsPage() {
  return (
    <main className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contracts</h1>
          <p className="text-muted-foreground text-sm">Terms, amounts, and renewal dates per supplier.</p>
        </div>
        <NewContractButton />
      </div>
      <ContractsTable />
    </main>
  );
}
