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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <Topbar />
        <main className="pt-20 pl-4 pr-4 pb-6 lg:pl-64 lg:pr-6">
          {children}
        </main>
        <Tutorial />
      </div>
    </SidebarProvider>
  );
}
