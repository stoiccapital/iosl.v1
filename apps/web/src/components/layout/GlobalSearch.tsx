import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  FileText,
  Search as SearchIcon,
  User,
  UserRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useGlobalSearch, type SearchHit } from '@/features/search/hooks';

const ENTITY_ICON: Record<SearchHit['entityType'], typeof Building2> = {
  account: Building2,
  contact: UserRound,
  opportunity: Briefcase,
  account_note: FileText,
  contact_note: FileText,
};

const ENTITY_LABEL: Record<SearchHit['entityType'], string> = {
  account: 'Account',
  contact: 'Contact',
  opportunity: 'Opportunity',
  account_note: 'Note',
  contact_note: 'Note',
};

const GROUP_LABEL = {
  accounts: 'Accounts',
  contacts: 'Contacts',
  opportunities: 'Opportunities',
  notes: 'Notes',
} as const;

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useGlobalSearch(query);

  const flatHits: SearchHit[] = useMemo(() => {
    if (!search.data) return [];
    return [
      ...search.data.accounts,
      ...search.data.contacts,
      ...search.data.opportunities,
      ...search.data.notes,
    ];
  }, [search.data]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, search.data]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      if (modifier && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openHit = useCallback(
    (hit: SearchHit) => {
      setOpen(false);
      setQuery('');
      navigate(hit.href);
    },
    [navigate],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(flatHits.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      const hit = flatHits[activeIndex];
      if (hit) openHit(hit);
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery('');
  };

  const showEmptyPrompt = query.trim().length < 2;
  const showNoResults =
    !showEmptyPrompt && search.data && flatHits.length === 0 && !search.isFetching;

  return (
    <>
      <button
        type="button"
        aria-label="Search (⌘K)"
        title="Search (⌘K)"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-2.5 text-xs text-muted-foreground shadow-sm transition-colors hover:text-foreground"
      >
        <SearchIcon className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Search</span>
        <kbd className="ml-1 hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium md:inline">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="sm:max-w-2xl gap-0 p-0"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <DialogHeader className="border-b p-3">
            <DialogTitle className="sr-only">Search</DialogTitle>
            <div className="flex items-center gap-2">
              <SearchIcon className="h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search accounts, contacts, opportunities, notes…"
                className="h-9 border-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {showEmptyPrompt && (
              <p className="p-4 text-center text-xs text-muted-foreground">
                Type at least 2 characters to search.
              </p>
            )}
            {showNoResults && (
              <p className="p-4 text-center text-xs text-muted-foreground">
                No matches for “{query}”.
              </p>
            )}
            {search.isFetching && !search.data && (
              <p className="p-4 text-center text-xs text-muted-foreground">Searching…</p>
            )}
            {search.data && (
              <ResultGroups data={search.data} activeIndex={activeIndex} onPick={openHit} />
            )}
          </div>

          <div className="flex items-center justify-between border-t px-3 py-2 text-[11px] text-muted-foreground">
            <span>
              <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↑↓</kbd> navigate ·{' '}
              <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↵</kbd> open ·{' '}
              <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">esc</kbd> close
            </span>
            <span className="font-mono tabular-nums">
              {flatHits.length ? `${flatHits.length} result${flatHits.length === 1 ? '' : 's'}` : ''}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ResultGroups({
  data,
  activeIndex,
  onPick,
}: {
  data: NonNullable<ReturnType<typeof useGlobalSearch>['data']>;
  activeIndex: number;
  onPick: (hit: SearchHit) => void;
}) {
  const groups = [
    { key: 'accounts', label: GROUP_LABEL.accounts, hits: data.accounts },
    { key: 'contacts', label: GROUP_LABEL.contacts, hits: data.contacts },
    { key: 'opportunities', label: GROUP_LABEL.opportunities, hits: data.opportunities },
    { key: 'notes', label: GROUP_LABEL.notes, hits: data.notes },
  ] as const;

  let cursor = 0;
  return (
    <>
      {groups.map((g) => {
        if (g.hits.length === 0) return null;
        return (
          <div key={g.key} className="mb-2">
            <div className="mb-1 px-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {g.label}
            </div>
            <ul>
              {g.hits.map((hit) => {
                const idx = cursor++;
                const Icon = ENTITY_ICON[hit.entityType] ?? User;
                return (
                  <li key={`${hit.entityType}-${hit.id}`}>
                    <button
                      type="button"
                      onClick={() => onPick(hit)}
                      onMouseDown={(e) => e.preventDefault()}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-md px-2 py-2 text-left transition-colors',
                        idx === activeIndex ? 'bg-accent' : 'hover:bg-accent/60',
                      )}
                    >
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{hit.primary}</div>
                        {hit.secondary && (
                          <div className="truncate text-xs text-muted-foreground">
                            {hit.secondary}
                          </div>
                        )}
                        {hit.snippet && (
                          <div className="truncate text-xs text-muted-foreground">{hit.snippet}</div>
                        )}
                      </div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {ENTITY_LABEL[hit.entityType]}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </>
  );
}
