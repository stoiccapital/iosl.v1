import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { useDeleteWebsite, useWebsites } from '@/features/marketing/websites/hooks';
import { getTemplate } from '@/features/marketing/websites/templates/registry';

export function WebsitesTable() {
  const query = useWebsites();
  const remove = useDeleteWebsite();

  return (
    <DataTableShell {...query} emptyMessage="No websites yet.">
      {(rows) => (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Languages</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Updated</TableHead>
                <TableHead className="w-[1%]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium">
                    <Link to={`/marketing/websites/${w.id}`} className="hover:underline">
                      {w.name}
                    </Link>
                  </TableCell>
                  <TableCell>{getTemplate(w.templateId).name}</TableCell>
                  <TableCell>
                    <Badge variant={w.status === 'published' ? 'default' : 'outline'}>
                      {w.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono tabular-nums text-xs uppercase">
                    {w.locales.join(' · ')}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums text-xs">/{w.slug}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatDate(w.updatedAt)}
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild title="Edit">
                      <Link to={`/marketing/websites/${w.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild title="Open public site">
                      <a
                        href={`/sites/${w.slug}/${w.defaultLocale}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete"
                      onClick={() => {
                        if (!confirm(`Delete "${w.name}"?`)) return;
                        remove.mutate(w.id, {
                          onSuccess: () => toast.success('Website deleted'),
                          onError: (e) =>
                            toast.error('Could not delete', {
                              description: e instanceof Error ? e.message : 'Unknown error',
                            }),
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DataTableShell>
  );
}
