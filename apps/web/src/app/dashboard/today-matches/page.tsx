'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@matchpulse/ui';
import { Badge } from '@matchpulse/ui';
import { Button } from '@matchpulse/ui';
import { Input } from '@matchpulse/ui';
import { Calendar, Clock, Search, X, Plus, Star, Share2, ChevronRight, Activity, Target, TrendingUp } from 'lucide-react';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Match {
  eventId: string;
  league: string;
  leagueName: string;
  homeTeam: {
    name: string;
    score: number;
    logo?: string;
  };
  awayTeam: {
    name: string;
    score: number;
    logo?: string;
  };
  clock: string;
  status: string;
  startTime: string;
  stadium?: string;
  referee?: string;
}

interface MatchStats {
  possession: {
    home: number;
    away: number;
  };
  shotsOnGoal: {
    home: number;
    away: number;
  };
  shots: {
    home: number;
    away: number;
  };
  corners: {
    home: number;
    away: number;
  };
  fouls: {
    home: number;
    away: number;
  };
  cards: {
    home: {
      yellow: number;
      red: number;
    };
    away: {
      yellow: number;
      red: number;
    };
  };
  offsides: {
    home: number;
    away: number;
  };
}

interface PlayerStats {
  goals: Array<{
    playerName: string;
    minute: number;
    team: 'home' | 'away';
  }>;
  shots: Array<{
    playerName: string;
    onTarget: number;
    total: number;
    team: 'home' | 'away';
  }>;
  cards: Array<{
    playerName: string;
    type: 'yellow' | 'red';
    minute: number;
    team: 'home' | 'away';
  }>;
  assists: Array<{
    playerName: string;
    minute: number;
    team: 'home' | 'away';
  }>;
}

interface TeamAverages {
  goalsPerGame: number;
  goalsConcededPerGame: number;
  recentForm: Array<{
    result: 'W' | 'D' | 'L';
    opponent: string;
  }>;
  homePerformance?: {
    wins: number;
    draws: number;
    losses: number;
  };
  awayPerformance?: {
    wins: number;
    draws: number;
    losses: number;
  };
}

interface PreGameContext {
  homeTeam: TeamAverages;
  awayTeam: TeamAverages;
  headToHead: Array<{
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
  }>;
  prediction: {
    homeWin: number;
    draw: number;
    awayWin: number;
    expectedGoals: number;
  };
}

export default function TodayMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [preGameContext, setPreGameContext] = useState<PreGameContext | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loadingDetails, setLoadingDetails] = useState(false);

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    filterMatches();
  }, [matches, searchQuery, selectedLeague, selectedStatus]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiClient.get<{success: boolean, data: Match[]}>('/today-matches');
      const matchesData = response.data || [];
      setMatches(matchesData);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Erro ao carregar jogos de hoje');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const filterMatches = () => {
    let filtered = [...matches];

    if (searchQuery) {
      filtered = filtered.filter(
        (match) =>
          match.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          match.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedLeague !== 'all') {
      filtered = filtered.filter((match) => match.league === selectedLeague);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((match) => match.status === selectedStatus);
    }

    setFilteredMatches(filtered);
  };

  const handleMatchClick = async (match: Match) => {
    setSelectedMatch(match);
    setLoadingDetails(true);
    
    try {
      const statsResponse = await apiClient.get<{success: boolean, data: MatchStats}>(`/matches/${match.eventId}/stats`);
      setMatchStats(statsResponse.data || null);

      const playerResponse = await apiClient.get<{success: boolean, data: PlayerStats}>(`/matches/${match.eventId}/players`);
      setPlayerStats(playerResponse.data || null);

      if (match.status === 'scheduled') {
        const preGameResponse = await apiClient.get<{success: boolean, data: PreGameContext}>(`/matches/${match.eventId}/pre-game`);
        setPreGameContext(preGameResponse.data || null);
      } else {
        setPreGameContext(null);
      }
    } catch (err) {
      console.error('Error fetching match details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDetails = () => {
    setSelectedMatch(null);
    setMatchStats(null);
    setPlayerStats(null);
    setPreGameContext(null);
  };

  const getStatusBadge = (status: string, clock?: string) => {
    switch (status) {
      case 'in_progress':
        return (
          <Badge variant="danger" className="text-xs font-bold px-2 py-0.5">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-1" />
            AO VIVO {clock}
          </Badge>
        );
      case 'halftime':
        return (
          <Badge variant="warning" className="text-xs font-bold px-2 py-0.5">
            Intervalo
          </Badge>
        );
      case 'final':
        return (
          <Badge variant="success" className="text-xs font-bold px-2 py-0.5">
            Finalizado
          </Badge>
        );
      default:
        return (
          <Badge variant="default" className="text-xs font-bold px-2 py-0.5">
            Agendado
          </Badge>
        );
    }
  };

  const leagues = Array.from(new Set(matches.map((m) => m.league)));

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-slate-100 mb-1 tracking-tight">Jogos de Hoje</h1>
            <p className="text-xs text-slate-400">Carregando jogos...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border border-slate-700 bg-slate-800">
              <CardContent className="p-3">
                <div className="h-24 bg-slate-700 animate-pulse rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-slate-100 mb-1 tracking-tight">Jogos de Hoje</h1>
            <p className="text-xs text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-sm font-semibold text-slate-100 mb-1 tracking-tight">Jogos de Hoje</h1>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {today}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs font-bold px-2 py-0.5">
            {filteredMatches.length} jogos
          </Badge>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-wrap items-center gap-2"
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <Input
            placeholder="Buscar time..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-slate-800 border-slate-700 text-slate-100 text-xs h-8"
          />
        </div>
        <select
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-100 text-xs px-2 py-1.5 rounded-sm"
        >
          <option value="all">Todas as ligas</option>
          {leagues.map((league) => (
            <option key={league} value={league}>
              {league}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-100 text-xs px-2 py-1.5 rounded-sm"
        >
          <option value="all">Todos os status</option>
          <option value="scheduled">Agendado</option>
          <option value="in_progress">Em andamento</option>
          <option value="halftime">Intervalo</option>
          <option value="final">Finalizado</option>
        </select>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
      >
        {filteredMatches.length === 0 ? (
          <Card className="col-span-full border border-slate-700 bg-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-slate-700 rounded-sm flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-100 mb-2">Nenhum jogo encontrado</h3>
              <p className="text-xs text-slate-400">
                {searchQuery || selectedLeague !== 'all' || selectedStatus !== 'all'
                  ? 'Tente ajustar os filtros'
                  : 'Não há jogos programados para hoje'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMatches.map((match, index) => (
            <motion.div
              key={match.eventId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ y: -2 }}
            >
              <Card className="border border-slate-700 bg-slate-800">
                <div 
                  className="p-3 cursor-pointer hover:bg-slate-700 transition-all duration-300"
                  onClick={() => handleMatchClick(match)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">{match.leagueName}</span>
                    {getStatusBadge(match.status, match.clock)}
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-center flex-1">
                      <div className="w-12 h-12 mx-auto mb-1 flex items-center justify-center rounded-lg overflow-hidden">
                        {match.homeTeam.logo ? (
                          <img 
                            src={match.homeTeam.logo} 
                            alt={match.homeTeam.name}
                            className="w-10 h-10 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                            <span className="text-xs text-slate-400 font-bold">{match.homeTeam.name.substring(0, 2).toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-100 mb-1 truncate">{match.homeTeam.name}</p>
                      {match.status !== 'scheduled' && (
                        <p className="text-lg font-bold text-slate-100">{match.homeTeam.score}</p>
                      )}
                    </div>
                    <div className="text-slate-400 text-xs px-2">vs</div>
                    <div className="text-center flex-1">
                      <div className="w-12 h-12 mx-auto mb-1 flex items-center justify-center rounded-lg overflow-hidden">
                        {match.awayTeam.logo ? (
                          <img 
                            src={match.awayTeam.logo} 
                            alt={match.awayTeam.name}
                            className="w-10 h-10 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                            <span className="text-xs text-slate-400 font-bold">{match.awayTeam.name.substring(0, 2).toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-100 mb-1 truncate">{match.awayTeam.name}</p>
                      {match.status !== 'scheduled' && (
                        <p className="text-lg font-bold text-slate-100">{match.awayTeam.score}</p>
                      )}
                    </div>
                  </div>
                  {match.status === 'scheduled' && (
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {new Date(match.startTime).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-xs text-slate-400 hover:text-slate-100 hover:bg-slate-700"
                  >
                    Ver Detalhes
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      <AnimatePresence>
        {selectedMatch && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDetails}
              className="fixed inset-0 bg-black/50 z-50"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-2xl bg-slate-800 border-l border-slate-700 z-50 overflow-y-auto"
            >
              <div className="p-3 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800 z-10">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Detalhes do Jogo</h3>
                  <p className="text-xs text-slate-400">{selectedMatch.leagueName}</p>
                </div>
                <button
                  onClick={closeDetails}
                  className="p-2 rounded-sm hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="p-3 space-y-4">
                {loadingDetails ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-slate-700 rounded-sm flex items-center justify-center mx-auto mb-3 animate-pulse">
                      <Activity className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-400">Carregando detalhes...</p>
                  </div>
                ) : (
                  <>
                    <Card className="border border-slate-700 bg-slate-800">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-center flex-1">
                            <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center rounded-lg overflow-hidden">
                              {selectedMatch.homeTeam.logo ? (
                                <img 
                                  src={selectedMatch.homeTeam.logo} 
                                  alt={selectedMatch.homeTeam.name}
                                  className="w-14 h-14 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                                  <span className="text-sm text-slate-400 font-bold">{selectedMatch.homeTeam.name.substring(0, 2).toUpperCase()}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-slate-100 mb-1">{selectedMatch.homeTeam.name}</p>
                            {selectedMatch.status !== 'scheduled' && (
                              <p className="text-2xl font-bold text-slate-100">{selectedMatch.homeTeam.score}</p>
                            )}
                          </div>
                          <div className="text-slate-400 text-sm px-4 font-medium">vs</div>
                          <div className="text-center flex-1">
                            <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center rounded-lg overflow-hidden">
                              {selectedMatch.awayTeam.logo ? (
                                <img 
                                  src={selectedMatch.awayTeam.logo} 
                                  alt={selectedMatch.awayTeam.name}
                                  className="w-14 h-14 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                                  <span className="text-sm text-slate-400 font-bold">{selectedMatch.awayTeam.name.substring(0, 2).toUpperCase()}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-slate-100 mb-1">{selectedMatch.awayTeam.name}</p>
                            {selectedMatch.status !== 'scheduled' && (
                              <p className="text-2xl font-bold text-slate-100">{selectedMatch.awayTeam.score}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                          {getStatusBadge(selectedMatch.status, selectedMatch.clock)}
                          {selectedMatch.stadium && (
                            <span>• {selectedMatch.stadium}</span>
                          )}
                          {selectedMatch.referee && (
                            <span>• Árbitro: {selectedMatch.referee}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {preGameContext && (
                      <Card className="border border-slate-700 bg-slate-800">
                        <CardHeader className="border-b border-slate-700 bg-slate-800">
                          <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Contexto Pré-Jogo
                          </h4>
                        </CardHeader>
                        <CardContent className="p-3 space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-slate-100 mb-2">{selectedMatch.homeTeam.name}</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-slate-900 p-2 rounded-sm">
                                <p className="text-slate-400">Gols/Jogo</p>
                                <p className="text-slate-100 font-semibold">{preGameContext.homeTeam.goalsPerGame}</p>
                              </div>
                              <div className="bg-slate-900 p-2 rounded-sm">
                                <p className="text-slate-400">Gols Sofridos/Jogo</p>
                                <p className="text-slate-100 font-semibold">{preGameContext.homeTeam.goalsConcededPerGame}</p>
                              </div>
                            </div>
                            {preGameContext.homeTeam.homePerformance && (
                              <div className="mt-2 bg-slate-900 p-2 rounded-sm">
                                <p className="text-slate-400 mb-1">Performance em Casa</p>
                                <div className="flex gap-2">
                                  <span className="text-green-400 font-semibold">V: {preGameContext.homeTeam.homePerformance.wins}</span>
                                  <span className="text-slate-400 font-semibold">E: {preGameContext.homeTeam.homePerformance.draws}</span>
                                  <span className="text-red-400 font-semibold">D: {preGameContext.homeTeam.homePerformance.losses}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-slate-100 mb-2">{selectedMatch.awayTeam.name}</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-slate-900 p-2 rounded-sm">
                                <p className="text-slate-400">Gols/Jogo</p>
                                <p className="text-slate-100 font-semibold">{preGameContext.awayTeam.goalsPerGame}</p>
                              </div>
                              <div className="bg-slate-900 p-2 rounded-sm">
                                <p className="text-slate-400">Gols Sofridos/Jogo</p>
                                <p className="text-slate-100 font-semibold">{preGameContext.awayTeam.goalsConcededPerGame}</p>
                              </div>
                            </div>
                            {preGameContext.awayTeam.awayPerformance && (
                              <div className="mt-2 bg-slate-900 p-2 rounded-sm">
                                <p className="text-slate-400 mb-1">Performance Fora</p>
                                <div className="flex gap-2">
                                  <span className="text-green-400 font-semibold">V: {preGameContext.awayTeam.awayPerformance.wins}</span>
                                  <span className="text-slate-400 font-semibold">E: {preGameContext.awayTeam.awayPerformance.draws}</span>
                                  <span className="text-red-400 font-semibold">D: {preGameContext.awayTeam.awayPerformance.losses}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="bg-slate-900 p-3 rounded-sm">
                            <p className="text-xs font-semibold text-slate-100 mb-2">Previsão</p>
                            <div className="grid grid-cols-3 gap-2 text-xs text-center">
                              <div>
                                <p className="text-slate-400">Casa</p>
                                <p className="text-slate-100 font-semibold">{preGameContext.prediction.homeWin}%</p>
                              </div>
                              <div>
                                <p className="text-slate-400">Empate</p>
                                <p className="text-slate-100 font-semibold">{preGameContext.prediction.draw}%</p>
                              </div>
                              <div>
                                <p className="text-slate-400">Fora</p>
                                <p className="text-slate-100 font-semibold">{preGameContext.prediction.awayWin}%</p>
                              </div>
                            </div>
                            <div className="mt-2 text-center">
                              <p className="text-slate-400">Gols Esperados</p>
                              <p className="text-slate-100 font-semibold">{preGameContext.prediction.expectedGoals}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {matchStats && selectedMatch.status !== 'scheduled' && (
                      <Card className="border border-slate-700 bg-slate-800">
                        <CardHeader className="border-b border-slate-700 bg-slate-800">
                          <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Estatísticas em Tempo Real
                          </h4>
                        </CardHeader>
                        <CardContent className="p-3 space-y-4">
                          {/* Comparison Bar Chart */}
                          <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={[
                                { name: 'Posse', casa: matchStats.possession.home, fora: matchStats.possession.away },
                                { name: 'Chutes a Gol', casa: matchStats.shotsOnGoal.home, fora: matchStats.shotsOnGoal.away },
                                { name: 'Escanteios', casa: matchStats.corners.home, fora: matchStats.corners.away },
                                { name: 'Faltas', casa: matchStats.fouls.home, fora: matchStats.fouls.away },
                              ]}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-700" />
                                <XAxis dataKey="name" className="text-slate-400 text-xs" />
                                <YAxis className="text-slate-400 text-xs" />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '4px',
                                  }}
                                  itemStyle={{ color: '#f1f5f9' }}
                                />
                                <Bar dataKey="casa" fill="#475569" radius={[4, 4, 0, 0]} name={selectedMatch.homeTeam.name} />
                                <Bar dataKey="fora" fill="#64748b" radius={[4, 4, 0, 0]} name={selectedMatch.awayTeam.name} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Detailed Stats */}
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <p className="text-slate-100 font-semibold">{matchStats.possession.home}%</p>
                              <p className="text-slate-400">Posse</p>
                            </div>
                            <div className="text-center">
                              <div className="w-full bg-slate-700 rounded-full h-1.5 mt-3">
                                <div
                                  className="bg-slate-400 h-1.5 rounded-full"
                                  style={{ width: `${matchStats.possession.home}%` }}
                                />
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-slate-100 font-semibold">{matchStats.possession.away}%</p>
                              <p className="text-slate-400">Posse</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <p className="text-slate-100 font-semibold">{matchStats.shotsOnGoal.home}</p>
                              <p className="text-slate-400">Chutes a Gol</p>
                            </div>
                            <div className="text-center text-slate-400">-</div>
                            <div className="text-center">
                              <p className="text-slate-100 font-semibold">{matchStats.shotsOnGoal.away}</p>
                              <p className="text-slate-400">Chutes a Gol</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <p className="text-slate-100 font-semibold">{matchStats.corners.home}</p>
                              <p className="text-slate-400">Escanteios</p>
                            </div>
                            <div className="text-center text-slate-400">-</div>
                            <div className="text-center">
                              <p className="text-slate-100 font-semibold">{matchStats.corners.away}</p>
                              <p className="text-slate-400">Escanteios</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <p className="text-slate-100 font-semibold">{matchStats.fouls.home}</p>
                              <p className="text-slate-400">Faltas</p>
                            </div>
                            <div className="text-center text-slate-400">-</div>
                            <div className="text-center">
                              <p className="text-slate-100 font-semibold">{matchStats.fouls.away}</p>
                              <p className="text-slate-400">Faltas</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {playerStats && (
                      <Card className="border border-slate-700 bg-slate-800">
                        <CardHeader className="border-b border-slate-700 bg-slate-800">
                          <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Estatísticas de Jogadores
                          </h4>
                        </CardHeader>
                        <CardContent className="p-3 space-y-3">
                          {playerStats.goals.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-slate-100 mb-2">Gols</p>
                              <div className="space-y-1">
                                {playerStats.goals.map((goal, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-slate-900 p-2 rounded-sm text-xs">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="success" className="text-xs px-1 py-0.5">GOL</Badge>
                                      <span className="text-slate-100">{goal.playerName}</span>
                                    </div>
                                    <span className="text-slate-400">{goal.minute}&apos;</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {playerStats.shots.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-slate-100 mb-2">Top Chutes</p>
                              <div className="space-y-1">
                                {playerStats.shots.slice(0, 5).map((shot, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-slate-900 p-2 rounded-sm text-xs">
                                    <span className="text-slate-100">{shot.playerName}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-400">{shot.onTarget} a gol</span>
                                      <span className="text-slate-400">{shot.total} total</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {playerStats.cards.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-slate-100 mb-2">Cartões</p>
                              <div className="space-y-1">
                                {playerStats.cards.map((card, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-slate-900 p-2 rounded-sm text-xs">
                                    <div className="flex items-center gap-2">
                                      <Badge 
                                        variant={card.type === 'yellow' ? 'warning' : 'danger'} 
                                        className="text-xs px-1 py-0.5"
                                      >
                                        {card.type === 'yellow' ? 'AM' : 'VM'}
                                      </Badge>
                                      <span className="text-slate-100">{card.playerName}</span>
                                    </div>
                                    <span className="text-slate-400">{card.minute}&apos;</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {playerStats.assists.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-slate-100 mb-2">Assistências</p>
                              <div className="space-y-1">
                                {playerStats.assists.map((assist, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-slate-900 p-2 rounded-sm text-xs">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="info" className="text-xs px-1 py-0.5">AST</Badge>
                                      <span className="text-slate-100">{assist.playerName}</span>
                                    </div>
                                    <span className="text-slate-400">{assist.minute}&apos;</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {playerStats.goals.length === 0 && playerStats.shots.length === 0 && playerStats.cards.length === 0 && playerStats.assists.length === 0 && (
                            <p className="text-xs text-slate-400 text-center py-4">Nenhuma estatística de jogador disponível</p>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/create-strategy?matchId=${selectedMatch.eventId}`}
                        className="flex-1"
                      >
                        <Button className="w-full bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs">
                          <Plus className="w-3 h-3 mr-1" />
                          Criar Estratégia para este Jogo
                        </Button>
                      </Link>
                      <Button variant="outline" className="bg-slate-800 border-slate-700 text-slate-100 text-xs">
                        <Star className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" className="bg-slate-800 border-slate-700 text-slate-100 text-xs">
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
