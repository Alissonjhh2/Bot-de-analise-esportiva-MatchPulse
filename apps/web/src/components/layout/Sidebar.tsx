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
  { href: '/dashboard/today-matches', icon: PlusCircle, label: 'Jogos de Hoje' },
  { href: '/dashboard/create-strategy', icon: AlertTriangle, label: 'Criar Estratégia' },
  { href: '/dashboard/my-strategies', icon: BookOpen, label: 'Minhas Estratégias' },
  { href: '/dashboard/strategy-library', icon: MessageSquare, label: 'Biblioteca' },
  { href: '/dashboard/telegram', icon: History, label: 'Telegram' },
  { href: '/dashboard/history', icon: Settings, label: 'Histórico' },
  { href: '/dashboard/settings', icon: User, label: 'Configurações' },
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
          'h-screen bg-slate-800 border-r border-slate-700 flex flex-col transition-transform duration-300 ease-in-out',
          'w-64',
          'fixed z-50 lg:static lg:z-auto',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
        role="navigation"
        aria-label="Navegação principal"
      >
        <div className="p-3 border-b border-slate-700 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
            aria-label="MatchPulse - Ir para Dashboard"
            onClick={closeSidebar}
          >
            <div className="w-8 h-8 bg-slate-700 rounded-sm flex items-center justify-center" aria-hidden="true">
              <LayoutDashboard className="w-4 h-4 text-slate-100" />
            </div>
            <span className="text-sm font-semibold text-slate-100 tracking-tight">MatchPulse</span>
          </Link>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 rounded-sm hover:bg-slate-700 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto" aria-label="Menu do dashboard">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={cn(
                  'flex items-center gap-2 px-2 py-2 rounded-sm transition-all duration-200 group',
                  isActive
                    ? 'bg-slate-700 text-slate-100'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-4 h-4 transition-colors duration-200" aria-hidden="true" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-700">
          <Link
            href="/login"
            className="flex items-center gap-2 px-2 py-2 rounded-sm text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition-all duration-200 group"
            aria-label="Sair da conta"
          >
            <LogOut className="w-4 h-4 transition-colors duration-200" aria-hidden="true" />
            <span className="text-xs font-medium">Sair</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
