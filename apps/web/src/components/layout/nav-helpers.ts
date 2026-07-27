import type { NavChild, NavGroup } from './nav-config';

export function pathMatches(pathname: string, target: string): boolean {
  return pathname === target || pathname.startsWith(`${target}/`);
}

export function anyDescendantMatches(pathname: string, node: NavChild): boolean {
  if (pathMatches(pathname, node.to)) return true;
  return node.children?.some((c) => anyDescendantMatches(pathname, c)) ?? false;
}

export function groupIsActive(pathname: string, group: NavGroup): boolean {
  if (group.to === '/') return pathname === '/';
  if (pathMatches(pathname, group.to)) return true;
  return group.children?.some((c) => anyDescendantMatches(pathname, c)) ?? false;
}

export function findActiveGroup(pathname: string, groups: NavGroup[]): NavGroup | null {
  // Prefer the most specific match (highest number of path segments matched).
  let best: NavGroup | null = null;
  let bestLen = -1;
  for (const g of groups) {
    if (!groupIsActive(pathname, g)) continue;
    const len = g.to === '/' ? 0 : g.to.length;
    if (len > bestLen) {
      best = g;
      bestLen = len;
    }
  }
  return best;
}
