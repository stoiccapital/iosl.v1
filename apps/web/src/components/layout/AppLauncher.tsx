import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { canAccess } from '@factory/shared';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { NAV_GROUPS } from './nav-config';
import { groupIsActive } from './nav-helpers';

function NineDotsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <circle cx="5" cy="5" r="1.8" />
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="19" cy="5" r="1.8" />
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
      <circle cx="5" cy="19" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
      <circle cx="19" cy="19" r="1.8" />
    </svg>
  );
}

export function AppLauncher() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { data: user } = useCurrentUser();
  const role = user?.role ?? 'admin';

  const modules = NAV_GROUPS.filter((g) => g.key !== 'settings' && canAccess(role, g.key));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="pointer-events-none fixed left-12 top-14 h-0 w-0" aria-hidden />
      </PopoverAnchor>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Open app launcher"
          className="flex h-auto w-full flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <NineDotsIcon className="h-5 w-5" />
          <span className="text-[10px] font-medium leading-none">All Apps</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={0}
        className="h-[calc(100vh-3.5rem)] w-72 rounded-none rounded-br-md border-l-0 border-t-0 p-3"
      >
        <div className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Apps
        </div>
        <div className="grid grid-cols-3 gap-1 overflow-y-auto">
          {modules.map((group) => {
            const Icon = group.icon;
            const active = groupIsActive(location.pathname, group);
            return (
              <NavLink
                key={group.key}
                to={group.to}
                end={group.to === '/'}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex aspect-square flex-col items-center justify-center gap-1.5 rounded-md border p-2 text-center transition-colors',
                  active
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-transparent hover:bg-accent',
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                />
                <span className="text-[11px] font-medium leading-tight">{group.label}</span>
              </NavLink>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
