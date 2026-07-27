import { CustomersTable } from '@/features/crm/customers/CustomersTable';
import { NewCustomerButton } from '@/features/crm/customers/CustomerDialog';

export function CustomersPage() {
  return (
    <main className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-muted-foreground text-sm">Closed-won accounts and their subscriptions.</p>
        </div>
        <NewCustomerButton />
      </div>
      <CustomersTable />
    </main>
  );
}
