import { NavLink } from 'react-router-dom';
import { Settings as SettingsIcon } from 'lucide-react';
import { RoleSchema, type Role } from '@factory/shared';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useCurrentUser, useSetRole } from '@/features/auth/hooks/use-current-user';
import { Breadcrumbs } from './Breadcrumbs';
import { GlobalSearch } from './GlobalSearch';

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin',
  manager: 'Manager',
  employee: 'Employee',
  viewer: 'Viewer',
  finance: 'Finance',
  agent: 'Agent (AI)',
};

export function Topbar() {
  const { data: user } = useCurrentUser();
  const setRole = useSetRole();

  const initials = user ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}` : 'IO';

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
      <span className="text-sm font-semibold tracking-tight">
        IOSL <span className="text-muted-foreground text-xs font-normal">Internal OS</span>
      </span>
      <div className="mx-2 h-5 w-px bg-border" aria-hidden />
      <Breadcrumbs />
      <div className="ml-auto flex items-center gap-3">
        <GlobalSearch />
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
        <NavLink
          to="/settings"
          aria-label="Settings"
          title="Settings"
          className={({ isActive }) =>
            cn(
              'flex h-9 w-9 items-center justify-center rounded-md transition-colors',
              isActive
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )
          }
        >
          <SettingsIcon className="h-5 w-5" />
        </NavLink>
        <Avatar className="h-8 w-8">
          <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
