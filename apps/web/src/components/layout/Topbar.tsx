'use client';

import { useState } from 'react';
import { Search, Bell, Moon, Sun, User as UserIcon, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { useRouter } from 'next/navigation';

export function Topbar() {
  const { setTheme, actualTheme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
    setShowProfileMenu(false);
  };

  return (
    <header className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="h-full flex items-center justify-between">
        {/* Mobile layout */}
        <div className="p-3 flex items-center gap-2 lg:hidden flex-1">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:flex items-center justify-between w-full p-3">
          {/* Search bar - aligned with main content */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                placeholder="Pesquisar..."
                className="w-full pl-9 pr-3 py-2 rounded-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600 focus:border-transparent"
                aria-label="Pesquisar"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(actualTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label={actualTheme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {actualTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              )}
            </button>
            <button
              className="p-2 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative"
              aria-label="Notificações"
              onClick={() => alert('Notificações em breve!')}
            >
              <Bell className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-slate-400 rounded-full" aria-hidden="true" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Perfil"
              >
                <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <UserIcon className="w-3 h-3 text-slate-950 dark:text-slate-100" />
                </div>
                <ChevronDown className="w-3 h-3 text-slate-600 dark:text-slate-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-sm border border-slate-200 dark:border-slate-700 py-2">
                  <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-medium text-slate-950 dark:text-slate-100">
                      {user?.displayName || user?.email || 'Usuário'}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 text-left text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-950 dark:hover:text-slate-100 flex items-center gap-2"
                  >
                    <LogOut className="w-3 h-3" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
