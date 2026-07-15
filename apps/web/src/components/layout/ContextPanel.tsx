'use client';

import { Bell, Settings, TrendingUp } from 'lucide-react';

export function ContextPanel() {
  return (
    <div className="h-full bg-slate-800 p-3 flex flex-col gap-3">
      {/* Header */}
      <div className="border-b border-slate-700 pb-3">
        <h2 className="text-sm font-semibold text-slate-100">Contexto</h2>
      </div>

      {/* Quick Stats */}
      <div className="space-y-2">
        <div className="bg-slate-900 border border-slate-700 rounded-sm p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400">Performance</span>
          </div>
          <div className="text-sm text-slate-100 font-semibold">85%</div>
          <div className="text-xs text-slate-400">Estratégias ativas</div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="border-b border-slate-700 pb-2 mb-2">
          <h3 className="text-xs font-semibold text-slate-100">Alertas Recentes</h3>
        </div>
        <div className="space-y-2 overflow-y-auto flex-1">
          <div className="bg-slate-900 border border-slate-700 rounded-sm p-2">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-100">Flamengo vs Palmeiras</span>
            </div>
            <div className="text-xs text-slate-400">Pressão ofensiva alta</div>
            <div className="text-xs text-slate-500 mt-1">2 min atrás</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-slate-700 pt-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Settings className="w-4 h-4" />
          <span>Configurações</span>
        </div>
      </div>
    </div>
  );
}
