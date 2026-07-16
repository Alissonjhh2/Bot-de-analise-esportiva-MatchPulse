'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@matchpulse/ui';
import { Badge } from '@matchpulse/ui';
import { Button } from '@matchpulse/ui';
import { BookOpen, Star, TrendingUp, Copy, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Strategy {
  id: string;
  name: string;
  description?: string;
  startMinute: number;
  endMinute: number;
  status: string;
  matchHits?: number;
  conditions?: unknown[];
}

export default function StrategyLibraryPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchViralStrategies();
  }, []);

  const fetchViralStrategies = async () => {
    try {
      const response = await apiClient.get<{success: boolean, data: {data: Strategy[], pagination: {page: number, pageSize: number, total: number, totalPages: number}}}>('/strategies');
      const data = response.data.data;
      // Filter strategies with high match hit count (viral strategies)
      const viralStrategies = data
        .filter((s) => (s.matchHits || 0) >= 5)
        .sort((a, b) => (b.matchHits || 0) - (a.matchHits || 0))
        .slice(0, 10);
      setStrategies(viralStrategies);
    } catch (error) {
      console.error('Error fetching viral strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyStrategy = async (strategyId: string) => {
    try {
      const strategy = strategies.find((s) => s.id === strategyId);
      if (strategy) {
        await apiClient.post('/strategies', {
          name: `${strategy.name} (Cópia)`,
          description: strategy.description,
          startMinute: strategy.startMinute,
          endMinute: strategy.endMinute,
          conditions: strategy.conditions,
        });
        alert('Estratégia copiada com sucesso!');
      }
    } catch (error) {
      console.error('Error copying strategy:', error);
      alert('Erro ao copiar estratégia');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-950 dark:text-slate-100 mb-1 tracking-tight">Viral Strategy Library</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">Estratégias mais populares da comunidade</p>
        </div>
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="w-4 h-4 text-slate-600 dark:text-slate-400 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-950 dark:text-slate-100 mb-1 tracking-tight">Viral Strategy Library</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">Estratégias mais populares com alto índice de acertos</p>
      </div>

      {strategies.length === 0 ? (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-sm flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-100 mb-2">
              Nenhuma estratégia viral ainda
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Estratégias com 5+ MatchHits aparecerão aqui
            </p>
            <Button onClick={() => window.location.href = '/dashboard/create-strategy'} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-600 text-slate-950 dark:text-slate-100 rounded-sm text-xs px-3 py-2">
              Criar Primeira Estratégia
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {strategies.map((strategy) => (
            <Card key={strategy.id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardHeader className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-sm flex items-center justify-center">
                      <BookOpen className="w-3 h-3 text-slate-950 dark:text-slate-100" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-950 dark:text-slate-100 text-sm">{strategy.name}</h3>
                      <Badge variant="success" className="mt-1 px-2 py-0.5 text-xs bg-slate-200 dark:bg-slate-700 text-slate-950 dark:text-slate-100 border-slate-600">
                        {strategy.matchHits || 0} MatchHits
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                    <Star className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                    <span className="font-medium">{strategy.matchHits || 0}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-slate-600 dark:text-slate-400 mb-3 text-xs">
                  {strategy.description || 'Sem descrição'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>Alta performance</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyStrategy(strategy.id)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-200 dark:bg-slate-700 rounded-sm text-xs px-2 py-1"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
