import { NewPayrollButton } from '@/features/hr/PayrollDialog';
import { PayrollTable } from '@/features/hr/PayrollTable';

export function PayrollPage() {
  return (
    <main className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payroll</h1>
          <p className="text-muted-foreground text-sm">Salaries and contractor pay — feeds Finance / Costs.</p>
        </div>
        <NewPayrollButton />
      </div>
      <PayrollTable />
    </main>
  );
}
