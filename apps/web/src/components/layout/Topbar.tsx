import { RoleSchema, type Role } from '@factory/shared';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCurrentUser, useSetRole } from '@/features/auth/hooks/use-current-user';
import { Breadcrumbs } from './Breadcrumbs';

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin',
  manager: 'Manager',
  employee: 'Employee',
  viewer: 'Viewer',
};

export function Topbar() {
  const { data: user } = useCurrentUser();
  const setRole = useSetRole();

  const initials = user ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}` : 'IO';

  return (
    <header className="flex h-14 shrink-0 items-center border-b bg-background px-4">
      <Breadcrumbs />
      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Role</span>
          <Select
            value={user?.role ?? 'admin'}
            onValueChange={(value) => setRole.mutate(RoleSchema.parse(value))}
          >
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RoleSchema.options.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABEL[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
