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
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visão geral das suas estratégias e alertas em tempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2 text-sm text-white bg-gradient-to-r from-[#3DB8F5] to-[#2D69B3] px-4 py-2 rounded-full shadow-lg shadow-[#2D69B3]/30"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="font-medium">Live</span>
          </motion.div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80 mb-1">Estratégias Ativas</p>
                  <p className="text-2xl font-bold tracking-tight">{stats.activeStrategies}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80 mb-1">Match Hits Hoje</p>
                  <p className="text-2xl font-bold tracking-tight">{stats.notificationsSentToday}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80 mb-1">Bot Conectado</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold tracking-tight">
                      {stats.botConnected ? 'Sim' : 'Não'}
                    </p>
                    {stats.botConnected && <CheckCircle className="w-5 h-5 text-white" />}
                  </div>
                </div>
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80 mb-1">Jogos Monitorados</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold tracking-tight">{stats.gamesMonitored}</p>
                    {stats.gamesMonitored > 0 && (
                      <button
                        onClick={() => setShowLiveMatches(!showLiveMatches)}
                        className="text-xs text-white/80 hover:text-white font-medium underline"
                      >
                        {showLiveMatches ? 'Ocultar' : 'Quais?'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
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
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Atividade ao Vivo</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Match hits em tempo real do Rule Engine</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Auto-refresh: 15s</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {matchHits.length === 0 ? (
              <div className="text-center py-16">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Target className="w-10 h-10 text-gray-400" />
                </motion.div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Nenhuma atividade ainda</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Crie estratégias para começar a monitorar partidas e receber alertas em tempo real.
                </p>
                <Link href="/dashboard/create-strategy">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-gradient-to-r from-[#3DB8F5] to-[#2D69B3] hover:from-[#2D69B3] hover:to-[#122F5A] text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-[#2D69B3]/30"
                  >
                    <Plus className="w-5 h-5 mr-2 inline" />
                    Criar Primeira Estratégia
                  </motion.button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {matchHits.map((hit, index) => (
                  <motion.div
                    key={hit.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`relative pl-6 pb-4 ${index < matchHits.length - 1 ? 'border-l-2 border-gray-100 dark:border-gray-800' : ''}`}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                      className="absolute left-0 top-0 w-3 h-3 bg-gradient-to-br from-[#3DB8F5] to-[#2D69B3] rounded-full border-4 border-white dark:border-gray-900 shadow-lg"
                    />
                    <div className="flex items-start justify-between p-3 bg-gradient-to-r from-green-50 to-white dark:from-green-900/10 dark:to-gray-900 border border-green-100 dark:border-green-900/30 rounded-lg hover:shadow-lg transition-all duration-300">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="success" className="text-xs font-bold px-2 py-0.5">MATCH</Badge>
                          <p className="font-bold text-gray-900 dark:text-white text-base">{hit.strategy.name}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg">
                            <Clock className="w-4 h-4 text-[#2D69B3]" />
                            <span className="font-medium">Minuto {hit.minute}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg">
                            <Activity className="w-4 h-4 text-[#2D69B3]" />
                            <span className="font-medium">Partida: {hit.snapshot?.homeTeam && hit.snapshot?.awayTeam 
                              ? `${hit.snapshot.homeTeam} X ${hit.snapshot.awayTeam}`
                              : hit.matchId.slice(-8)}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg">
                            <Clock className="w-4 h-4 text-[#2D69B3]" />
                            <span className="font-medium">{new Date(hit.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-5 h-5 text-white" />
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
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Alertas por Dia</h3>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="day" className="text-gray-600 dark:text-gray-400" />
                  <YAxis className="text-gray-600 dark:text-gray-400" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Bar dataKey="alerts" fill="url(#gradientBar)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3DB8F5" />
                      <stop offset="100%" stopColor="#2D69B3" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Tendência Mensal</h3>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="month" className="text-gray-600 dark:text-gray-400" />
                  <YAxis className="text-gray-600 dark:text-gray-400" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="alerts"
                    stroke="url(#gradientLine)"
                    strokeWidth={3}
                    dot={{ fill: '#3DB8F5', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#2D69B3', strokeWidth: 2 }}
                  />
                  <defs>
                    <linearGradient id="gradientLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3DB8F5" />
                      <stop offset="100%" stopColor="#2D69B3" />
                    </linearGradient>
                  </defs>
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
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Suas Estratégias</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Gerencie suas estratégias de monitoramento</p>
              </div>
              <Link href="/dashboard/create-strategy">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#3DB8F5] to-[#2D69B3] hover:from-[#2D69B3] hover:to-[#122F5A] text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-[#2D69B3]/30 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Nova Estratégia
                </motion.button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {strategies.length === 0 ? (
              <div className="text-center py-16">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <AlertCircle className="w-10 h-10 text-gray-400" />
                </motion.div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Nenhuma estratégia criada</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Comece criando sua primeira estratégia personalizada para monitorar partidas em tempo real.
                </p>
                <Link href="/dashboard/create-strategy">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-gradient-to-r from-[#3DB8F5] to-[#2D69B3] hover:from-[#2D69B3] hover:to-[#122F5A] text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-[#2D69B3]/30"
                  >
                    <Plus className="w-5 h-5 mr-2 inline" />
                    Criar Primeira Estratégia
                  </motion.button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {strategies.map((strategy, index) => (
                  <motion.div
                    key={strategy.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    className="group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3DB8F5]/5 to-[#2D69B3]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-between p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#2D69B3]/30 transition-all duration-300 shadow-sm hover:shadow-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#3DB8F5] to-[#2D69B3] rounded-xl flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                          </div>
                          <p className="font-bold text-gray-900 dark:text-white text-lg">{strategy.name}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                            <Zap className="w-4 h-4 text-[#2D69B3]" />
                            <span className="font-medium">{strategy.conditions.length} condições</span>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                            <Activity className="w-4 h-4 text-[#2D69B3]" />
                            <span className="font-medium capitalize">{strategy.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Badge
                          variant={strategy.status === 'ACTIVE' ? 'success' : 'default'}
                          className={`px-4 py-1.5 text-sm font-bold ${
                            strategy.status === 'ACTIVE' 
                              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0' 
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
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
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Jogos Monitorados</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{liveMatches.length} jogos ao vivo</p>
                </div>
                <button
                  onClick={() => setShowLiveMatches(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="p-4 space-y-3">
                {liveMatches.map((match) => {
                  const isLive = match.status === 'in_progress' || match.status === 'halftime';
                  const isFinal = match.status === 'final';
                  const startTime = new Date(match.startTime);
                  const formattedTime = startTime.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    timeZone: 'America/Sao_Paulo'
                  });
                  
                  return (
                    <div key={match.eventId} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white text-base">
                          {match.homeTeam.name} {match.homeTeam.score} - {match.awayTeam.score} {match.awayTeam.name}
                        </span>
                        {isLive ? (
                          <span className="flex items-center gap-1 text-red-500 font-medium text-sm">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            {match.clock}
                          </span>
                        ) : isFinal ? (
                          <span className="text-green-500 font-medium text-sm">Finalizado</span>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400 text-sm">{formattedTime}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium">{match.leagueName}</span>
                        {isLive ? (
                          <span className="text-red-500 font-medium text-xs bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">AO VIVO</span>
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
