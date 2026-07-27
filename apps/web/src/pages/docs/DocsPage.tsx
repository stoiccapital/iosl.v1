import { useMemo, useState } from 'react';
import type { DocCategory } from '@factory/shared';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/format';
import { docHooks } from '@/features/docs/hooks';

const CATEGORY_LABEL: Record<DocCategory, string> = {
  engineering: 'Engineering',
  product: 'Product',
  sales: 'Sales',
  ops: 'Ops',
  people: 'People',
  finance: 'Finance',
  general: 'General',
};

export function DocsPage() {
  const { data, isLoading } = docHooks.useList();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter(
      (d) => d.title.toLowerCase().includes(q) || d.body.toLowerCase().includes(q),
    );
  }, [data, query]);

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Docs</h1>
        <p className="text-muted-foreground text-sm">
          Internal knowledge base — SOPs, runbooks, playbooks.
        </p>
      </header>

      <Input
        placeholder="Search docs…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-6 max-w-md"
      />

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((d) => (
          <Card key={d.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{d.title}</CardTitle>
                <Badge variant="outline">{CATEGORY_LABEL[d.category]}</Badge>
              </div>
              <p className="text-muted-foreground text-xs font-mono tabular-nums">
                Updated {formatDate(d.updatedAt)}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">{d.body}</p>
            </CardContent>
          </Card>
        ))}
        {!isLoading && filtered.length === 0 && (
          <div className="text-muted-foreground rounded-lg border p-8 text-center text-sm">
            No docs match your search.
          </div>
        )}
      </div>
    </main>
  );
}
