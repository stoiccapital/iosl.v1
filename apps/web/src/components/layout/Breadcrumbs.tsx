import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { NAV_GROUPS, type NavChild } from './nav-config';

function findChildLabel(children: NavChild[] | undefined, path: string): string | null {
  if (!children) return null;
  for (const c of children) {
    if (c.to === path) return c.label;
    const nested = findChildLabel(c.children, path);
    if (nested) return nested;
  }
  return null;
}

function labelFor(path: string): string {
  for (const g of NAV_GROUPS) {
    if (g.to === path) return g.label;
    const child = findChildLabel(g.children, path);
    if (child) return child;
  }
  const last = path.split('/').filter(Boolean).pop() ?? '';
  return last.charAt(0).toUpperCase() + last.slice(1);
}

export function Breadcrumbs() {
  const { pathname } = useLocation();
  if (pathname === '/') return null;

  const parts = pathname.split('/').filter(Boolean);
  const crumbs = parts.map((_, i) => '/' + parts.slice(0, i + 1).join('/'));

  return (
    <nav aria-label="Breadcrumb" className="text-muted-foreground flex items-center gap-1 text-sm">
      <Link to="/" className="hover:text-foreground">
        Home
      </Link>
      {crumbs.map((path, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <span key={path} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" />
            {isLast ? (
              <span className="text-foreground font-medium">{labelFor(path)}</span>
            ) : (
              <Link to={path} className="hover:text-foreground">
                {labelFor(path)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
