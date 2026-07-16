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
  snapshot?: { homeTeam?: string; awayTeam?: string } | null;
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
          <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-slate-950 dark:text-slate-100 mb-1 tracking-tight">Histórico</h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">Histórico de MatchHits das suas estratégias</p>
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
        <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-slate-950 dark:text-slate-100 mb-1 tracking-tight">Histórico</h1>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">Histórico de MatchHits das suas estratégias</p>
      </div>

      {matchHits.length === 0 ? (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-sm flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-100 mb-2">
              Nenhum MatchHit ainda
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Quando suas estratégias derem match, aparecerão aqui
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-100 tracking-tight">
              Últimos MatchHits
            </h3>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2">
              {matchHits.map((matchHit) => (
                <div
                  key={matchHit.id}
                  className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-sm flex items-center justify-center ${
                      matchHit.result
                        ? 'bg-slate-200 dark:bg-slate-700'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}>
                      {matchHit.result ? (
                        <CheckCircle className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                      ) : (
                        <XCircle className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-950 dark:text-slate-100 text-xs">
                        {matchHit.strategy?.name || 'Estratégia Desconhecida'}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Partida: {matchHit.snapshot?.homeTeam && matchHit.snapshot?.awayTeam 
                          ? `${matchHit.snapshot.homeTeam} X ${matchHit.snapshot.awayTeam}`
                          : matchHit.matchId}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={matchHit.result ? 'success' : 'danger'} className="px-2 py-0.5 text-xs bg-slate-200 dark:bg-slate-700 text-slate-950 dark:text-slate-100 border-slate-600">
                      {matchHit.result ? 'Match' : 'Falhou'}
                    </Badge>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Minuto {matchHit.minute}&apos;
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
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
