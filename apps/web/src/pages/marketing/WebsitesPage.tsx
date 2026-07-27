import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WebsitesTable } from '@/features/marketing/websites/components/WebsitesTable';

export function WebsitesPage() {
  return (
    <main className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Websites</h1>
          <p className="text-muted-foreground text-sm">
            Marketing landing pages that capture ride leads and driver applicants.
          </p>
        </div>
        <Button asChild>
          <Link to="/marketing/websites/new">New website</Link>
        </Button>
      </div>
      <WebsitesTable />
    </main>
  );
}
