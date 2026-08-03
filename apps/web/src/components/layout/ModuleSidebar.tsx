import { useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { NAV_GROUPS, type NavChild } from './nav-config';
import { anyDescendantMatches, findActiveGroup } from './nav-helpers';
import { canAccess } from '@factory/shared';

const STORAGE_KEY = 'iosl:module-sidebar-collapsed';

function readInitialCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

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

function ChildLink({
  child,
  collapsed,
  depth = 0,
}: {
  child: NavChild;
  collapsed: boolean;
  depth?: number;
}) {
  const location = useLocation();
  const hasChildren = Boolean(child.children?.length);
  const expanded = anyDescendantMatches(location.pathname, child);
  const Icon = child.icon;

  return (
    <li>
      <NavLink
        to={child.to}
        end
        title={collapsed ? child.label : undefined}
        className={({ isActive }) =>
          cn(
            'group flex items-center rounded-md text-sm transition-colors',
            collapsed ? 'h-9 w-9 justify-center' : 'gap-2 px-2 py-1.5',
            isActive
              ? 'bg-accent text-foreground font-medium'
              : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
          )
        }
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
        {!collapsed && <span className="truncate">{child.label}</span>}
        {!collapsed && hasChildren && <ExpandCaret expanded={expanded} />}
      </NavLink>
      {hasChildren && expanded && !collapsed && (
        <ul className="ml-3 mt-1 space-y-1 border-l pl-2">
          {child.children!.map((grandchild) => (
            <ChildLink
              key={grandchild.to}
              child={grandchild}
              collapsed={collapsed}
              depth={depth + 1}
            />
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

  const [collapsed, setCollapsed] = useState<boolean>(readInitialCollapsed);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
    } catch {
      // ignore
    }
  }, [collapsed]);

  const toggle = useCallback(() => setCollapsed((v) => !v), []);

  const group = findActiveGroup(location.pathname, NAV_GROUPS);
  if (!group || !group.children?.length || !canAccess(role, group.key)) {
    return null;
  }

  const Icon = group.icon;

  return (
    <aside
      className={cn(
        'relative hidden shrink-0 flex-col border-r bg-muted/20 md:flex',
        collapsed ? 'w-14' : 'w-56',
      )}
    >
      <div
        className={cn(
          'flex h-14 items-center gap-2',
          collapsed ? 'justify-center px-0' : 'px-4',
        )}
      >
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        {!collapsed && (
          <span className="truncate text-sm font-semibold tracking-tight">{group.label}</span>
        )}
      </div>
      <Separator />
      <nav
        className={cn(
          'flex-1 overflow-y-auto py-2',
          collapsed ? 'px-2' : 'p-2',
        )}
      >
        <ul className={cn(collapsed ? 'flex flex-col items-center space-y-1' : 'space-y-1')}>
          {group.children.map((child) => (
            <ChildLink key={child.to} child={child} collapsed={collapsed} />
          ))}
        </ul>
      </nav>

      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>
    </aside>
  );
}
