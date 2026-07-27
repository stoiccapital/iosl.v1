import { Check, X } from 'lucide-react';
import { MODULE_ACCESS, ModuleKeySchema, RoleSchema } from '@factory/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const MODULE_LABEL: Record<string, string> = {
  dashboard: 'Dashboard',
  crm: 'CRM',
  finance: 'Finance',
  suppliers: 'Suppliers',
  hr: 'HR',
  recruiting: 'Recruiting',
  projects: 'Projects',
  bi: 'Insights',
  settings: 'Settings',
};

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  manager: 'Manager',
  employee: 'Employee',
  viewer: 'Viewer',
};

export function RolesPage() {
  const modules = ModuleKeySchema.options;
  const roles = RoleSchema.options;

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Roles</h1>
        <p className="text-muted-foreground text-sm">Per-role module access.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Access matrix</CardTitle>
          <CardDescription>
            Green check means the role can open the module from the sidebar. Roles are edited in code
            (<code className="font-mono text-xs">@factory/shared/common/auth</code>) — this view is read-only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  {roles.map((r) => (
                    <TableHead key={r} className="text-center">{ROLE_LABEL[r]}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((m) => (
                  <TableRow key={m}>
                    <TableCell className="font-medium">{MODULE_LABEL[m] ?? m}</TableCell>
                    {roles.map((r) => (
                      <TableCell key={r} className="text-center">
                        {MODULE_ACCESS[r].includes(m) ? (
                          <Check className="text-primary mx-auto h-4 w-4" />
                        ) : (
                          <X className="text-muted-foreground mx-auto h-4 w-4" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
