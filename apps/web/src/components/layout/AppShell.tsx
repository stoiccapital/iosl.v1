import type { ReactNode } from 'react';
import { AppRail } from './AppRail';
import { LayoutProvider } from './LayoutContext';
import { ModuleSidebar } from './ModuleSidebar';
import { Topbar } from './Topbar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <LayoutProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        <AppRail />
        <ModuleSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </LayoutProvider>
  );
}
