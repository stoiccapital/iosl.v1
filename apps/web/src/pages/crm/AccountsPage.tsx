import { AccountsTable } from '@/features/crm/accounts/AccountsTable';
import { NewAccountButton } from '@/features/crm/accounts/AccountDialog';

export function AccountsPage() {
  return (
    <main className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground text-sm">Companies you sell to.</p>
        </div>
        <NewAccountButton />
      </div>
      <AccountsTable />
    </main>
  );
}
