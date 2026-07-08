'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@matchpulse/ui';
import { Badge } from '@matchpulse/ui';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface MatchHit {
  id: string;
  matchId: string;
  strategyId: string;
  minute: number;
  result: boolean;
  createdAt: string;
  snapshot?: any;
  strategy?: {
    name: string;
  };
}

export default function HistoryPage() {
  const [matchHits, setMatchHits] = useState<MatchHit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchHits();
  }, []);

  const fetchMatchHits = async () => {
    try {
      const response = await apiClient.get<{success: boolean, data: MatchHit[]}>('/match-hits');
      setMatchHits(response.data || []);
    } catch (error) {
      console.error('Error fetching match hits:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Histórico</h1>
          <p className="text-gray-600 dark:text-gray-400">Histórico de MatchHits das suas estratégias</p>
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Histórico</h1>
        <p className="text-gray-600 dark:text-gray-400">Histórico de MatchHits das suas estratégias</p>
      </div>

      {matchHits.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum MatchHit ainda
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Quando suas estratégias derem match, aparecerão aqui
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
              Últimos MatchHits
            </h3>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {matchHits.map((matchHit) => (
                <div
                  key={matchHit.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      matchHit.result
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {matchHit.result ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {matchHit.strategy?.name || 'Estratégia Desconhecida'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Partida: {matchHit.snapshot?.homeTeam && matchHit.snapshot?.awayTeam 
                          ? `${matchHit.snapshot.homeTeam} X ${matchHit.snapshot.awayTeam}`
                          : matchHit.matchId}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={matchHit.result ? 'success' : 'danger'}>
                      {matchHit.result ? 'Match' : 'Falhou'}
                    </Badge>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Minuto {matchHit.minute}'
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(matchHit.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
