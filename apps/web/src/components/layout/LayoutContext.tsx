import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { LayoutContext } from './layout-context';

const STORAGE_KEY = 'iosl:rail-expanded';

function readInitial(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState<boolean>(readInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, expanded ? '1' : '0');
    } catch {
      // ignore quota / privacy errors
    }
  }, [expanded]);

  const toggleRail = useCallback(() => setExpanded((v) => !v), []);

  return (
    <LayoutContext.Provider value={{ railExpanded: expanded, toggleRail }}>
      {children}
    </LayoutContext.Provider>
  );
}
