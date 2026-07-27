import { Link, useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useWebsite } from '@/features/marketing/websites/hooks';
import { WebsiteEditorForm } from '@/features/marketing/websites/components/WebsiteEditorForm';
import { WebsitePreview } from '@/features/marketing/websites/components/WebsitePreview';

export function WebsiteEditPage() {
  const { id } = useParams<{ id: string }>();
  const query = useWebsite(id);

  if (query.isLoading) {
    return (
      <main className="container py-8">
        <Skeleton className="mb-6 h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Skeleton className="h-[600px] w-full" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </main>
    );
  }

  if (query.isError || !query.data) {
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

  const w = query.data;

  return (
    <main className="container py-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{w.name}</h1>
          <p className="text-xs text-muted-foreground font-mono tabular-nums">/sites/{w.slug}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/marketing/websites/${w.id}/submissions`}>Submissions</Link>
          </Button>
          <Button variant="outline" asChild>
            <a
              href={`/sites/${w.slug}/${w.defaultLocale}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2"
            >
              Open public
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="min-w-0">
          <WebsiteEditorForm site={w} />
        </div>
        <div className="min-w-0">
          <div className="sticky top-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Live preview</p>
            <div className="h-[calc(100vh-8rem)] overflow-hidden rounded-lg border">
              <WebsitePreview site={w} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
