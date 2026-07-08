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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Viral Strategy Library</h1>
          <p className="text-gray-600 dark:text-gray-400">Estratégias mais populares da comunidade</p>
        </div>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Viral Strategy Library</h1>
        <p className="text-gray-600 dark:text-gray-400">Estratégias mais populares com alto índice de acertos</p>
      </div>

      {strategies.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhuma estratégia viral ainda
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Estratégias com 5+ MatchHits aparecerão aqui
            </p>
            <Button onClick={() => window.location.href = '/dashboard/create-strategy'} className="bg-[#2D69B3] hover:bg-[#1e4a7a]">
              Criar Primeira Estratégia
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {strategies.map((strategy) => (
            <Card key={strategy.id} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{strategy.name}</h3>
                      <Badge variant="success" className="mt-1">
                        {strategy.matchHits || 0} MatchHits
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{strategy.matchHits || 0}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  {strategy.description || 'Sem descrição'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>Alta performance</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyStrategy(strategy.id)}
                    className="border-[#2D69B3] text-[#2D69B3] hover:bg-[#2D69B3] hover:text-white"
                  >
                    <Copy className="w-4 h-4 mr-2" />
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
