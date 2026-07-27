import { useMemo } from 'react';
import type { ContentStatus, ContentType } from '@factory/shared';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTableShell } from '@/components/data/DataTableShell';
import { formatDate } from '@/lib/format';
import { usePeople } from '@/features/directory/hooks';
import { contentHooks } from '@/features/marketing/hooks';

const TYPE_LABEL: Record<ContentType, string> = {
  blog: 'Blog post',
  video: 'Video',
  whitepaper: 'Whitepaper',
  case_study: 'Case study',
  guide: 'Guide',
};

const STATUS_LABEL: Record<ContentStatus, string> = {
  idea: 'Idea',
  drafting: 'Drafting',
  review: 'Review',
  published: 'Published',
  archived: 'Archived',
};
const STATUS_VARIANT: Record<ContentStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  idea: 'outline',
  drafting: 'secondary',
  review: 'secondary',
  published: 'default',
  archived: 'outline',
};

export function ContentPage() {
  const query = contentHooks.useList();
  const people = usePeople();
  const authorName = useMemo(() => {
    const map = new Map((people.data ?? []).map((p) => [p.id, `${p.firstName} ${p.lastName}`] as const));
    return (id: string | null) => (id ? (map.get(id) ?? '—') : 'Unassigned');
  }, [people.data]);

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Content</h1>
        <p className="text-muted-foreground text-sm">Content pipeline across formats.</p>
      </header>
      <DataTableShell {...query} emptyMessage="No content pieces yet.">
        {(rows) => (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead className="text-right">Published</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell>{TYPE_LABEL[c.type]}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[c.status]}>{STATUS_LABEL[c.status]}</Badge>
                    </TableCell>
                    <TableCell>{authorName(c.authorId)}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {c.publishedAt ? formatDate(c.publishedAt) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DataTableShell>
    </main>
  );
}
