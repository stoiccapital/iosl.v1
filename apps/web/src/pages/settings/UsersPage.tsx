import { toast } from 'sonner';
import type { Role } from '@factory/shared';
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
import { NewUserButton, UserDialog } from '@/features/settings/UserDialog';
import { userHooks } from '@/features/settings/hooks';

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin',
  manager: 'Manager',
  employee: 'Employee',
  viewer: 'Viewer',
};

const ROLE_VARIANT: Record<Role, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  admin: 'default',
  manager: 'secondary',
  employee: 'outline',
  viewer: 'outline',
};

export function UsersPage() {
  const query = userHooks.useList();
  const remove = userHooks.useRemove();
  return (
    <main className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-muted-foreground text-sm">Team members with system access.</p>
        </div>
        <NewUserButton />
      </div>
      <DataTableShell {...query} emptyMessage="No users yet.">
        {(rows) => (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Since</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.firstName} {u.lastName}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={ROLE_VARIANT[u.role]}>{ROLE_LABEL[u.role]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.active ? 'default' : 'destructive'}>
                        {u.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{formatDate(u.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <UserDialog mode="edit" user={u} trigger={<Button size="sm" variant="ghost">Edit</Button>} />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          remove.mutate(u.id, {
                            onSuccess: () => toast.success('Deleted'),
                            onError: (err) => toast.error('Failed', { description: err instanceof Error ? err.message : '' }),
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
    </main>
  );
}
