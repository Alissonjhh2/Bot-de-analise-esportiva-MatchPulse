'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Tutorial } from '@/components/Tutorial';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <Topbar />
      <main className="pt-20 pl-72 pr-6 pb-6">
        {children}
      </main>
      <Tutorial />
    </div>
  );
}
