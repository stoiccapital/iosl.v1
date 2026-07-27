import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useWebsite } from '@/features/marketing/websites/hooks';
import { SubmissionsTable } from '@/features/marketing/websites/components/SubmissionsTable';

export function WebsiteSubmissionsPage() {
  const { id } = useParams<{ id: string }>();
  const query = useWebsite(id);

  if (query.isLoading) {
    return (
      <main className="container py-8">
        <Skeleton className="mb-6 h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </main>
    );
  }

  if (query.isError || !query.data || !id) {
    return (
      <main className="container py-8">
        <Alert variant="destructive">
          <AlertTitle>Could not load website</AlertTitle>
          <AlertDescription>
            {query.error instanceof Error ? query.error.message : 'Not found'}
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="container py-8">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/marketing/websites/${id}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{query.data.name} — submissions</h1>
          <p className="text-muted-foreground text-sm">
            Ride interests are routed to CRM leads. Driver applications become recruiting
            candidates.
          </p>
        </div>
      </div>
      <SubmissionsTable websiteId={id} />
    </main>
  );
}
