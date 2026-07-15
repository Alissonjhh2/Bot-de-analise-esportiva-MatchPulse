'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Tutorial } from '@/components/Tutorial';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ContextPanel } from '@/components/layout/ContextPanel';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-slate-950 overflow-hidden">
        {/* Coluna 1: Navegação Lateral Fixa (w-64) */}
        <div className="w-64 flex-shrink-0 hidden lg:block border-r border-slate-700">
          <Sidebar />
        </div>

        {/* Mobile Drawer */}
        <div className="lg:hidden fixed inset-0 z-50">
          <Sidebar />
        </div>

        {/* Coluna 2: Conteúdo Central (flex-1) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-3">
            {children}
          </main>
          <Tutorial />
        </div>

        {/* Coluna 3: Contexto/Alerts (w-80) */}
        <div className="w-80 flex-shrink-0 hidden xl:block border-l border-slate-700">
          <ContextPanel />
        </div>
      </div>
    </SidebarProvider>
  );
}
