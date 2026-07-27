import { toast } from 'sonner';
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
import { supplierHooks } from './hooks';
import { SUPPLIER_CATEGORY_LABEL } from './labels';
import { SupplierDialog } from './SupplierDialog';

export function SuppliersTable() {
  const query = supplierHooks.useList();
  const remove = supplierHooks.useRemove();
  return (
    <DataTableShell {...query} emptyMessage="No suppliers yet.">
      {(rows) => (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{SUPPLIER_CATEGORY_LABEL[s.category]}</TableCell>
                  <TableCell>{s.country}</TableCell>
                  <TableCell>
                    <div className="text-sm">{s.contactName}</div>
                    <div className="text-muted-foreground text-xs">{s.contactEmail}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.active ? 'default' : 'destructive'}>
                      {s.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <SupplierDialog mode="edit" supplier={s} trigger={<Button size="sm" variant="ghost">Edit</Button>} />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        remove.mutate(s.id, {
                          onSuccess: () => toast.success('Supplier deleted'),
                          onError: (err) =>
                            toast.error('Delete failed', {
                              description: err instanceof Error ? err.message : '',
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
