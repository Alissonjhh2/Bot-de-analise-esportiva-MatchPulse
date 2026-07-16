'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Tutorial } from '@/components/Tutorial';
import { SidebarProvider } from '@/contexts/SidebarContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-slate-950 overflow-hidden">
        {/* Sidebar - handles both desktop and mobile positioning internally */}
        <Sidebar />

        {/* Coluna 2: Conteúdo Central (flex-1) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-3">
            {children}
          </main>
          <Tutorial />
        </div>
      </div>
    </SidebarProvider>
  );
}
