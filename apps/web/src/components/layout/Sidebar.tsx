'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@matchpulse/ui';
import { useSidebar } from '@/contexts/SidebarContext';
import { X } from 'lucide-react';
import {
  LayoutDashboard,
  PlusCircle,
  AlertTriangle,
  BookOpen,
  MessageSquare,
  History,
  Settings,
  User,
  LogOut,
} from 'lucide-react';

const menuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/create-strategy', icon: PlusCircle, label: 'Criar Estratégia' },
  { href: '/dashboard/my-strategies', icon: AlertTriangle, label: 'Minhas Estratégias' },
  { href: '/dashboard/strategy-library', icon: BookOpen, label: 'Viral Strategy Library' },
  { href: '/dashboard/telegram', icon: MessageSquare, label: 'Telegram' },
  { href: '/dashboard/history', icon: History, label: 'Histórico' },
  { href: '/dashboard/settings', icon: Settings, label: 'Configurações' },
  { href: '/dashboard/profile', icon: User, label: 'Perfil' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useSidebar();

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 flex flex-col transition-transform duration-300 ease-in-out',
          'w-64',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:z-40'
        )}
        role="navigation"
        aria-label="Navegação principal"
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
            aria-label="MatchPulse - Ir para Dashboard"
            onClick={closeSidebar}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#2D69B3] to-[#1e4a7a] rounded-xl flex items-center justify-center shadow-sm" aria-hidden="true">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[#122F5A] dark:text-white tracking-tight">MatchPulse</span>
          </Link>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Menu do dashboard">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-[#2D69B3] to-[#1e4a7a] text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-5 h-5 transition-colors duration-200 group-hover:scale-110" aria-hidden="true" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group"
            aria-label="Sair da conta"
          >
            <LogOut className="w-5 h-5 transition-colors duration-200 group-hover:scale-110" aria-hidden="true" />
            <span className="font-medium">Sair</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
