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
      <div className="flex flex-row h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        {/* Sidebar - Fixed width, never shrinks */}
        <div className="w-64 flex-shrink-0 hidden lg:block">
          <Sidebar />
        </div>
        
        {/* Mobile Sidebar Overlay */}
        <div className="lg:hidden fixed inset-0 z-50">
          <Sidebar />
        </div>
        
        {/* Main Content Area - Flexible, takes remaining space */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0">
            <Topbar />
          </div>
          
          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto px-6 py-6">
            {children}
          </main>
          
          {/* Tutorial */}
          <Tutorial />
        </div>
      </div>
    </SidebarProvider>
  );
}
