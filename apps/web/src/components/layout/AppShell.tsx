import type { ReactNode } from 'react';
import { AppLauncher } from './AppLauncher';
import { ModuleSidebar } from './ModuleSidebar';
import { Topbar } from './Topbar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="flex w-12 shrink-0 flex-col items-center border-r bg-muted/20 py-3">
        <AppLauncher />
      </div>
      <ModuleSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
