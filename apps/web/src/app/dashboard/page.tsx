'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@matchpulse/ui';
import { Badge } from '@matchpulse/ui';
import { AlertCircle, Bot, Activity, Clock, Target, Zap, CheckCircle, Plus, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

interface DashboardStats {
  activeStrategies: number;
  notificationsSentToday: number;
  botConnected: boolean;
  gamesMonitored: number;
}

interface LiveMatch {
  eventId: string;
  league: string;
  leagueName: string;
  homeTeam: {
    name: string;
    score: number;
  };
  awayTeam: {
    name: string;
    score: number;
  };
  clock: string;
  status: string;
  startTime: string;
}

interface MatchHit {
  id: string;
  matchId: string;
  strategyId: string;
  minute: number;
  result: boolean;
  snapshot: { homeTeam?: string; awayTeam?: string } | null;
  createdAt: string;
  strategy: {
    id: string;
    name: string;
  };
}

interface Strategy {
  id: string;
  name: string;
  status: string;
  conditions: unknown[];
  _count?: {
    matchHits: number;
  };
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    activeStrategies: 0,
    notificationsSentToday: 0,
    botConnected: false,
    gamesMonitored: 0,
  });
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [matchHits, setMatchHits] = useState<MatchHit[]>([]);
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [showLiveMatches, setShowLiveMatches] = useState(false);
  const [error, setError] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchData = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError('');

      // Fetch strategies
      const strategiesResponse = await apiClient.get<{success: boolean, data: {data: Strategy[], pagination: {page: number, pageSize: number, total: number, totalPages: number}}}>('/strategies');
      const strategiesData = strategiesResponse.data.data;
      setStrategies(strategiesData);

      // Fetch match hits
      const matchHitsResponse = await apiClient.get<{success: boolean, data: MatchHit[]}>('/match-hits?limit=10');
      const matchHitsData = matchHitsResponse.data || [];
      
      // Fetch Telegram connection status
      const telegramResponse = await apiClient.get<{success: boolean, data: {connected: boolean} | null}>('/telegram');
      const telegramConnected = telegramResponse.data !== null;

      // Fetch live matches from ESPN API
      let liveMatchesData: LiveMatch[] = [];
      try {
        // Use forceRefresh on every 4th refresh to ensure fresh data
        const shouldForceRefresh = refreshCount % 4 === 0;
        const liveMatchesResponse = await apiClient.get<{success: boolean, data: LiveMatch[]}>(`/live-matches?forceRefresh=${shouldForceRefresh}`);
        liveMatchesData = liveMatchesResponse.data || [];
        
        // Log for debugging
        console.log('[Dashboard] Live matches fetched:', liveMatchesData.length, 'matches');
        liveMatchesData.forEach(match => {
          console.log(`[Dashboard] Match: ${match.homeTeam.name} vs ${match.awayTeam.name}, Status: ${match.status}, Clock: ${match.clock}`);
        });
      } catch {
        // If endpoint doesn't exist yet, set to 0
        liveMatchesData = [];
      }

      // Deduplicate match hits by matchId and strategyId (1 per game per strategy)
      const uniqueHits = new Set<string>();
      const deduplicatedHits = matchHitsData.filter((hit) => {
        const key = `${hit.matchId}_${hit.strategyId}`;
        if (uniqueHits.has(key)) {
          return false;
        }
        uniqueHits.add(key);
        return true;
      });
      
      setMatchHits(deduplicatedHits);
      setLiveMatches(liveMatchesData);

      // Calculate stats
      const activeStrategies = strategiesData.filter((s) => s.status === 'ACTIVE').length;
      
      const todayHits = deduplicatedHits.filter((hit) => {
        const hitDate = new Date(hit.createdAt);
        const today = new Date();
        return hitDate.toDateString() === today.toDateString();
      }).length || 0;

      setStats({
        activeStrategies,
        notificationsSentToday: todayHits,
        botConnected: telegramConnected,
        gamesMonitored: liveMatchesData.length,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData(true); // Initial load with loading state
    // Auto-refresh every 15 seconds without loading state
    const interval = setInterval(() => {
      setRefreshCount(prev => prev + 1);
      fetchData(false);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Calculate weekly data from match hits
  const calculateWeeklyData = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date();
    const weekData = days.map((day, index) => {
      const dayDate = new Date(today);
      dayDate.setDate(today.getDate() - (today.getDay() - index));
      const dayHits = matchHits.filter((hit) => {
        const hitDate = new Date(hit.createdAt);
        return hitDate.toDateString() === dayDate.toDateString();
      }).length;
      return { day, alerts: dayHits };
    });
    return weekData;
  };

  // Calculate monthly data from match hits
  const calculateMonthlyData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthData = months.map((month, index) => {
      const monthHits = matchHits.filter((hit) => {
        const hitDate = new Date(hit.createdAt);
        return hitDate.getMonth() === index;
      }).length;
      return { month, alerts: monthHits };
    });
    return monthData;
  };

  const weeklyData = calculateWeeklyData();
  const monthlyData = calculateMonthlyData();

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Carregando dados...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Dashboard</h1>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-slate-100 mb-1 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Visão geral das suas estratégias e alertas em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1 text-xs text-slate-100 bg-slate-700 px-2 py-1 rounded-sm"
          >
            <div className="w-1.5 h-1.5 bg-slate-100 rounded-full animate-pulse" />
            <span className="font-medium">Live</span>
          </motion.div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4"
      >
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border border-slate-700 bg-slate-800">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Estratégias Ativas</p>
                  <p className="text-sm font-semibold text-slate-100">{stats.activeStrategies}</p>
                </div>
                <div className="w-6 h-6 bg-slate-700 rounded-sm flex items-center justify-center">
                  <AlertCircle className="w-3 h-3 text-slate-100" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border border-slate-700 bg-slate-800">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Match Hits Hoje</p>
                  <p className="text-sm font-semibold text-slate-100">{stats.notificationsSentToday}</p>
                </div>
                <div className="w-6 h-6 bg-slate-700 rounded-sm flex items-center justify-center">
                  <Zap className="w-3 h-3 text-slate-100" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border border-slate-700 bg-slate-800">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Bot Conectado</p>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-semibold text-slate-100">
                      {stats.botConnected ? 'Sim' : 'Não'}
                    </p>
                    {stats.botConnected && <CheckCircle className="w-3 h-3 text-slate-100" />}
                  </div>
                </div>
                <div className="w-6 h-6 bg-slate-700 rounded-sm flex items-center justify-center">
                  <Bot className="w-3 h-3 text-slate-100" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border border-slate-700 bg-slate-800">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Jogos Monitorados</p>
                  <p className="text-sm font-semibold text-slate-100">{stats.gamesMonitored}</p>
                </div>
                <div className="w-6 h-6 bg-slate-700 rounded-sm flex items-center justify-center">
                  <Activity className="w-3 h-3 text-slate-100" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Live Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="border border-slate-700 bg-slate-800">
          <CardHeader className="border-b border-slate-700 bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 tracking-tight">Atividade ao Vivo</h3>
                <p className="text-xs text-slate-400 mt-1">Match hits em tempo real do Rule Engine</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded-sm border border-slate-700">
                <Clock className="w-3 h-3" />
                <span className="font-medium">Auto-refresh: 15s</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            {matchHits.length === 0 ? (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 bg-slate-700 rounded-sm flex items-center justify-center mx-auto mb-3"
                >
                  <Target className="w-5 h-5 text-slate-400" />
                </motion.div>
                <h4 className="text-sm font-semibold text-slate-100 mb-2">Nenhuma atividade ainda</h4>
                <p className="text-xs text-slate-400 mb-4 max-w-md mx-auto">
                  Crie estratégias para começar a monitorar partidas e receber alertas em tempo real.
                </p>
                <Link href="/dashboard/create-strategy">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-sm text-xs font-medium transition-all duration-300"
                  >
                    <Plus className="w-3 h-3 mr-1 inline" />
                    Criar Primeira Estratégia
                  </motion.button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {matchHits.map((hit, index) => (
                  <motion.div
                    key={hit.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`relative pl-4 pb-2 ${index < matchHits.length - 1 ? 'border-l border-slate-700' : ''}`}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                      className="absolute left-0 top-0 w-2 h-2 bg-slate-600 rounded-full border-2 border-slate-950"
                    />
                    <div className="flex items-start justify-between p-2 bg-slate-900 border border-slate-700 rounded-sm hover:bg-slate-700 transition-all duration-300">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="success" className="text-xs font-bold px-1 py-0.5">MATCH</Badge>
                          <p className="font-semibold text-slate-100 text-xs">{hit.strategy.name}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded-sm">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="font-medium">Minuto {hit.minute}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded-sm">
                            <Activity className="w-3 h-3 text-slate-400" />
                            <span className="font-medium">Partida: {hit.snapshot?.homeTeam && hit.snapshot?.awayTeam 
                              ? `${hit.snapshot.homeTeam} X ${hit.snapshot.awayTeam}`
                              : hit.matchId.slice(-8)}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded-sm">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="font-medium">{new Date(hit.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-2">
                        <div className="w-6 h-6 bg-slate-700 rounded-sm flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-slate-100" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3 lg:gap-4"
      >
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border border-slate-700 bg-slate-800">
            <CardHeader className="border-b border-slate-700 bg-slate-800">
              <h3 className="text-sm font-semibold text-slate-100 tracking-tight">Alertas por Dia</h3>
            </CardHeader>
            <CardContent className="p-3">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-700" />
                  <XAxis dataKey="day" className="text-slate-400 text-xs" />
                  <YAxis className="text-slate-400 text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '4px',
                    }}
                    itemStyle={{ color: '#f1f5f9' }}
                  />
                  <Bar dataKey="alerts" fill="#475569" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border border-slate-700 bg-slate-800">
            <CardHeader className="border-b border-slate-700 bg-slate-800">
              <h3 className="text-sm font-semibold text-slate-100 tracking-tight">Tendência Mensal</h3>
            </CardHeader>
            <CardContent className="p-3">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-700" />
                  <XAxis dataKey="month" className="text-slate-400 text-xs" />
                  <YAxis className="text-slate-400 text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '4px',
                    }}
                    itemStyle={{ color: '#f1f5f9' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="alerts"
                    stroke="#475569"
                    strokeWidth={2}
                    dot={{ fill: '#475569', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 4, stroke: '#64748b', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Strategies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="border border-slate-700 bg-slate-800">
          <CardHeader className="border-b border-slate-700 bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 tracking-tight">Suas Estratégias</h3>
                <p className="text-xs text-slate-400 mt-1">Gerencie suas estratégias de monitoramento</p>
              </div>
              <Link href="/dashboard/create-strategy">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-sm text-xs font-medium transition-all duration-300 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Nova Estratégia
                </motion.button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            {strategies.length === 0 ? (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 bg-slate-700 rounded-sm flex items-center justify-center mx-auto mb-3"
                >
                  <AlertCircle className="w-5 h-5 text-slate-400" />
                </motion.div>
                <h4 className="text-sm font-semibold text-slate-100 mb-2">Nenhuma estratégia criada</h4>
                <p className="text-xs text-slate-400 mb-4 max-w-md mx-auto">
                  Comece criando sua primeira estratégia personalizada para monitorar partidas em tempo real.
                </p>
                <Link href="/dashboard/create-strategy">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-sm text-xs font-medium transition-all duration-300"
                  >
                    <Plus className="w-3 h-3 mr-1 inline" />
                    Criar Primeira Estratégia
                  </motion.button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {strategies.map((strategy, index) => (
                  <motion.div
                    key={strategy.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -1 }}
                    className="group relative overflow-hidden"
                  >
                    <div className="relative flex items-center justify-between p-3 bg-slate-900 border border-slate-700 rounded-sm hover:border-slate-600 transition-all duration-300">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 bg-slate-700 rounded-sm flex items-center justify-center">
                            <Target className="w-3 h-3 text-slate-100" />
                          </div>
                          <p className="font-semibold text-slate-100 text-xs">{strategy.name}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded-sm">
                            <Zap className="w-3 h-3 text-slate-400" />
                            <span className="font-medium">{strategy.conditions.length} condições</span>
                          </div>
                          <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded-sm">
                            <Activity className="w-3 h-3 text-slate-400" />
                            <span className="font-medium capitalize">{strategy.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-2">
                        <Badge
                          variant={strategy.status === 'ACTIVE' ? 'success' : 'default'}
                          className={`px-2 py-0.5 text-xs font-bold ${
                            strategy.status === 'ACTIVE' 
                              ? 'bg-slate-700 text-slate-100 border-slate-600' 
                              : 'bg-slate-700 text-slate-400 border-slate-600'
                          }`}
                        >
                          {strategy.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Live Matches Drawer */}
      <AnimatePresence>
        {showLiveMatches && liveMatches.length > 0 && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLiveMatches(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-800 border-l border-slate-700 z-50 overflow-y-auto"
            >
              <div className="p-3 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800 z-10">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Jogos Monitorados</h3>
                  <p className="text-xs text-slate-400">{liveMatches.length} jogos ao vivo</p>
                </div>
                <button
                  onClick={() => setShowLiveMatches(false)}
                  className="p-2 rounded-sm hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              
              <div className="p-3 space-y-2">
                {liveMatches.map((match) => {
                  const isLive = match.status === 'in_progress';
                  const isHalftime = match.status === 'halftime';
                  const isFinal = match.status === 'final';
                  const startTime = new Date(match.startTime);
                  const formattedTime = startTime.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    timeZone: 'America/Sao_Paulo'
                  });
                  
                  return (
                    <div key={match.eventId} className="p-3 bg-slate-900 border border-slate-700 rounded-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-100 text-xs">
                          {match.homeTeam.name} {match.homeTeam.score} - {match.awayTeam.score} {match.awayTeam.name}
                        </span>
                        {isLive ? (
                          <span className="flex items-center gap-1 text-slate-400 font-medium text-xs">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" />
                            {match.clock}
                          </span>
                        ) : isHalftime ? (
                          <span className="flex items-center gap-1 text-slate-400 font-medium text-xs">
                            <Clock className="w-3 h-3" />
                            Intervalo
                          </span>
                        ) : isFinal ? (
                          <span className="text-slate-400 font-medium text-xs">Finalizado</span>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400 text-sm">{formattedTime}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium">{match.leagueName}</span>
                        {isLive ? (
                          <span className="text-red-500 font-medium text-xs bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">AO VIVO</span>
                        ) : isHalftime ? (
                          <span className="text-orange-500 font-medium text-xs bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded">Intervalo</span>
                        ) : isFinal ? (
                          <span className="text-green-500 font-medium text-xs bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">Finalizado</span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 text-xs bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded">Vai começar</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
