import { NavLink, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { NAV_GROUPS, type NavChild } from './nav-config';
import { anyDescendantMatches, findActiveGroup } from './nav-helpers';
import { canAccess } from '@factory/shared';

function ExpandCaret({ expanded }: { expanded: boolean }) {
  return (
    <ChevronRight
      className={cn(
        'ml-auto h-3.5 w-3.5 shrink-0 opacity-60 transition-transform',
        expanded && 'rotate-90',
      )}
      aria-hidden
    />
  );
}

function ChildLink({ child, depth = 0 }: { child: NavChild; depth?: number }) {
  const location = useLocation();
  const hasChildren = Boolean(child.children?.length);
  const expanded = anyDescendantMatches(location.pathname, child);

  return (
    <li>
      <NavLink
        to={child.to}
        end
        className={({ isActive }) =>
          cn(
            'flex items-center rounded-md px-2 py-1.5 text-sm transition-colors',
            isActive
              ? 'bg-accent text-foreground font-medium'
              : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
          )
        }
      >
        <span>{child.label}</span>
        {hasChildren && <ExpandCaret expanded={expanded} />}
      </NavLink>
      {hasChildren && expanded && (
        <ul className="ml-3 mt-1 space-y-1 border-l pl-2">
          {child.children!.map((grandchild) => (
            <ChildLink key={grandchild.to} child={grandchild} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function ModuleSidebar() {
  const location = useLocation();
  const { data: user } = useCurrentUser();
  const role = user?.role ?? 'admin';

  const group = findActiveGroup(location.pathname, NAV_GROUPS);
  if (!group || !group.children?.length || !canAccess(role, group.key)) {
    return null;
  }

  const Icon = group.icon;

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r bg-muted/20 md:flex">
      <div className="flex h-14 items-center gap-2 px-4">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold tracking-tight">{group.label}</span>
      </div>
      <Separator />
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {group.children.map((child) => (
            <ChildLink key={child.to} child={child} />
          ))}
        </ul>
      </nav>
    </aside>
  );
}
