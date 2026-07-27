import { NewSupplierButton } from '@/features/suppliers/SupplierDialog';
import { SuppliersTable } from '@/features/suppliers/SuppliersTable';

export function SuppliersPage() {
  return (
    <main className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground text-sm">Vendors and their master data.</p>
        </div>
        <NewSupplierButton />
      </div>
      <SuppliersTable />
    </main>
  );
}
