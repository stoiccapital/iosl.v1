import { toast } from 'sonner';
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
import { AccountDialog } from './AccountDialog';
import { accountHooks } from './hooks';

export function AccountsTable() {
  const query = accountHooks.useList();
  const remove = accountHooks.useRemove();

  return (
    <DataTableShell {...query} emptyMessage="No accounts yet.">
      {(rows) => (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Website</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell>{a.industry}</TableCell>
                  <TableCell className="font-mono tabular-nums">{a.size}</TableCell>
                  <TableCell>{a.country}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {a.website ?? '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <AccountDialog
                      mode="edit"
                      account={a}
                      trigger={
                        <Button size="sm" variant="ghost">
                          Edit
                        </Button>
                      }
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        remove.mutate(a.id, {
                          onSuccess: () => toast.success('Account deleted'),
                          onError: (err) =>
                            toast.error('Could not delete account', {
                              description: err instanceof Error ? err.message : 'Unknown error',
                            }),
                        })
                      }
                    >
                      Delete
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
