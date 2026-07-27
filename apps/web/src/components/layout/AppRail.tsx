import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { canAccess } from '@factory/shared';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { NAV_GROUPS } from './nav-config';
import { groupIsActive } from './nav-helpers';
import { useLayout } from './layout-context';

export function AppRail() {
  const location = useLocation();
  const { data: user } = useCurrentUser();
  const role = user?.role ?? 'admin';
  const { railExpanded, toggleRail } = useLayout();

  return (
    <aside
      className={cn(
        'relative hidden shrink-0 flex-col border-r bg-muted/40 md:flex',
        railExpanded ? 'w-52' : 'w-14',
      )}
    >
      <div className="flex h-14 items-center border-b px-3">
        {railExpanded ? (
          <span className="w-full text-sm font-semibold tracking-tight">
            IOSL <span className="text-muted-foreground text-xs font-normal">Internal OS</span>
          </span>
        ) : (
          <span className="mx-auto text-sm font-semibold tracking-tight">IO</span>
        )}
      </div>
      <nav
        className={cn(
          'flex flex-1 flex-col gap-1 overflow-y-auto py-2',
          railExpanded ? 'px-2' : 'items-center',
        )}
      >
        {NAV_GROUPS.filter((g) => canAccess(role, g.key)).map((group) => {
          const Icon = group.icon;
          const active = groupIsActive(location.pathname, group);
          return (
            <NavLink
              key={group.key}
              to={group.to}
              end={group.to === '/'}
              title={railExpanded ? undefined : group.label}
              className={cn(
                'group relative flex items-center rounded-md transition-colors',
                railExpanded ? 'w-full gap-2 px-3 py-2 text-sm' : 'h-10 w-10 justify-center',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
              aria-label={group.label}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {railExpanded ? (
                <span className="truncate">{group.label}</span>
              ) : (
                <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md ring-1 ring-border transition-opacity group-hover:opacity-100 z-50">
                  {group.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={toggleRail}
        aria-label={railExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        title={railExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        className="absolute -right-3 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground"
      >
        {railExpanded ? (
          <ChevronLeft className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
      </button>
    </aside>
  );
}
