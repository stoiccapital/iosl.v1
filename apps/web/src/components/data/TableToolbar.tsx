import type { ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ToolbarProps = {
  query: string;
  onQueryChange: (v: string) => void;
  placeholder?: string;
  onClear?: () => void;
  children?: ReactNode;
  right?: ReactNode;
};

/**
 * Uniform toolbar for list pages: left = search box + filter controls,
 * right = actions (e.g. "New opportunity"). Keeps every list feeling the same.
 */
export function TableToolbar({
  query,
  onQueryChange,
  placeholder = 'Filter…',
  onClear,
  children,
  right,
}: ToolbarProps) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <div className="relative min-w-[220px] flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="h-9 pl-8 pr-8"
        />
        {query && (
          <button
            type="button"
            onClick={() => (onClear ? onClear() : onQueryChange(''))}
            aria-label="Clear filter"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {children}
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  );
}

type ChipProps = {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
};

export function FilterChip({ active, onClick, children }: ChipProps) {
  return (
    <Button
      type="button"
      variant={active ? 'default' : 'outline'}
      size="sm"
      className={cn('h-8 text-xs', !active && 'text-muted-foreground')}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
