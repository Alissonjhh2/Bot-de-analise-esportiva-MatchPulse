'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@matchpulse/ui';
import { Button } from '@matchpulse/ui';
import { Input } from '@matchpulse/ui';
import { Label } from '@matchpulse/ui';
import { Plus, Trash2, ArrowRight, ArrowLeft, Check, Search, X, Sparkles, Target, Zap, Globe, Calendar, MapPin } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useSearchParams } from 'next/navigation';

const LEAGUE_MAPPINGS = [
  { name: 'Campeonato Brasileiro', slug: 'bra.1' },
  { name: 'Campeonato Brasileiro Série B', slug: 'bra.2' },
  { name: 'Série C do Brasil', slug: 'bra.3' },
  { name: 'Copa do Brasil', slug: 'bra.4' },
  { name: 'Liga dos Campeões da UEFA', slug: 'uefa.champions' },
  { name: 'Liga Europa da UEFA', slug: 'uefa.europa' },
  { name: 'Copa do Mundo', slug: 'fifa.world' },
  { name: 'Premier League', slug: 'eng.1' },
  { name: 'LALIGA', slug: 'esp.1' },
  { name: 'Ligue 1', slug: 'fra.1' },
  { name: 'Bundesliga', slug: 'ger.1' },
  { name: 'Série A', slug: 'ita.1' },
  { name: 'Campeonato Português', slug: 'por.1' },
  { name: 'CONMEBOL Libertadores', slug: 'conmebol.libertadores' },
  { name: 'CONMEBOL Sul-Americana', slug: 'conmebol.sudamericana' },
  { name: 'Copa América', slug: 'conmebol.america' },
  { name: 'Copa das Nações da África', slug: 'caf.champions' },
  { name: 'Campeonato Chinês', slug: 'chn.1' },
  { name: 'Liga Argentina', slug: 'arg.1' },
  { name: 'Liga Mexicana', slug: 'mex.1' },
  { name: 'Liga Colombiana', slug: 'col.1' },
  { name: 'Liga Uruguaia', slug: 'uru.1' },
  { name: 'Liga Paraguaia', slug: 'par.1' },
  { name: 'Liga Chilena', slug: 'chi.1' },
  { name: 'Liga Equatoriana', slug: 'ecu.1' },
  { name: 'Liga Turca', slug: 'tur.1' },
  { name: 'MLS (EUA)', slug: 'usa.1' },
  { name: 'Liga Japonesa', slug: 'jpn.1' },
  { name: 'Eredivisie (Holanda)', slug: 'ned.1' },
  { name: 'Liga Belga', slug: 'bel.1' },
  { name: 'Liga Russa', slug: 'rus.1' },
  { name: 'Liga Austríaca', slug: 'aut.1' },
  { name: 'Liga Escocesa', slug: 'sco.1' },
];

const DEFAULT_LEAGUE = 'bra.1';

interface StrategyCondition {
  indicator: string;
  team: string;
  quantity: number;
  operator: string;
}

const INDICATORS = [
  { value: 'GOALS', label: 'Gols' },
  { value: 'CORNERS', label: 'Escanteios' },
  { value: 'OFFENSIVE_PRESSURE', label: 'Pressão Ofensiva' },
  { value: 'SHOTS_ON_GOAL', label: 'Chutes a Gol' },
  { value: 'CARDS', label: 'Cartões' },
  { value: 'FOULS', label: 'Faltas' },
  { value: 'OFFSIDES', label: 'Impedimentos' },
  { value: 'BALL_POSSESSION', label: 'Posse de Bola' },
];

const TEAMS = [
  { value: 'HOME', label: 'Time da Casa' },
  { value: 'AWAY', label: 'Time Visitante' },
  { value: 'MATCH', label: 'Ambos os Times' },
];

const OPERATORS = [
  { value: 'MORE', label: 'Mais que' },
  { value: 'LESS', label: 'Menos que' },
  { value: 'ANY', label: 'Qualquer' },
];

const STRATEGY_TYPES = [
  { value: 'general', label: 'Estratégia Geral', description: 'Aplicada a todos os jogos das ligas selecionadas', icon: Globe },
  { value: 'specific', label: 'Estratégia Específica', description: 'Criada para um jogo específico', icon: MapPin },
  { value: 'daily', label: 'Estratégia Diária', description: 'Aplicada a todos os jogos de um dia específico', icon: Calendar },
];

export default function CreateStrategyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchIdParam = searchParams.get('matchId');
  
  const [step, setStep] = useState(1);
  const [strategyType, setStrategyType] = useState<'general' | 'specific' | 'daily'>(matchIdParam ? 'specific' : 'general');
  const [name, setName] = useState('');
  const [startMinute, setStartMinute] = useState(1);
  const [endMinute, setEndMinute] = useState(90);
  const [conditions, setConditions] = useState<StrategyCondition[]>([]);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([DEFAULT_LEAGUE]);
  const [selectedMatchId, setSelectedMatchId] = useState(matchIdParam || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [availableMatches, setAvailableMatches] = useState<any[]>([]);

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        indicator: 'GOALS',
        team: 'MATCH',
        quantity: 1,
        operator: 'MORE',
      },
    ]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: keyof StrategyCondition, value: string | number) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  };

  const toggleLeague = (slug: string) => {
    setSelectedLeagues(prev =>
      prev.includes(slug)
        ? prev.filter(l => l !== slug)
        : [...prev, slug]
    );
  };

  const selectAllLeagues = () => {
    setSelectedLeagues(LEAGUE_MAPPINGS.map(l => l.slug));
  };

  const clearAllLeagues = () => {
    setSelectedLeagues([]);
  };

  const filteredLeagues = LEAGUE_MAPPINGS.filter(league =>
    league.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch available matches for specific strategy
  useEffect(() => {
    if (strategyType === 'specific') {
      fetchTodayMatches();
    }
  }, [strategyType]);

  const fetchTodayMatches = async () => {
    try {
      const response = await apiClient.get<{success: boolean, data: any[]}>('/today-matches');
      setAvailableMatches(response.data || []);
    } catch (err) {
      console.error('Error fetching matches:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Calculate final step based on strategy type
    const finalStep = strategyType === 'general' ? 4 : 3;
    if (step !== finalStep) {
      return;
    }
    
    // Prevent submission if conditions are not met
    if (strategyType === 'general' && selectedLeagues.length === 0) {
      setError('Selecione pelo menos um campeonato');
      return;
    }
    
    if (strategyType === 'specific' && !selectedMatchId) {
      setError('Selecione um jogo');
      return;
    }
    
    if (conditions.length === 0) {
      setError('Adicione pelo menos uma condição');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const payload: any = {
        name,
        startMinute,
        endMinute,
        conditions,
        type: strategyType,
      };

      if (strategyType === 'general') {
        payload.leagues = selectedLeagues;
      } else if (strategyType === 'specific') {
        payload.matchId = selectedMatchId;
      } else if (strategyType === 'daily') {
        payload.date = selectedDate;
        if (selectedLeagues.length > 0) {
          payload.leagues = selectedLeagues;
        }
      }

      await apiClient.post('/strategies', payload);

      // Success - redirect to my strategies
      router.push('/dashboard/my-strategies');
    } catch (err: unknown) {
      console.error('Error creating strategy:', err);
      
      const error = err as { message?: string };
      // Check if it's a strategy limit error
      if (error.message && error.message.includes('Limite de estratégias atingido')) {
        setError(error.message);
      } else {
        setError('Erro ao criar estratégia. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !strategyType) {
      setError('Por favor, selecione o tipo de estratégia');
      return;
    }
    if (step === 2 && !name.trim()) {
      setError('Por favor, insira um nome para a estratégia');
      return;
    }
    if (step === 2 && (startMinute < 1 || endMinute > 90 || startMinute >= endMinute)) {
      setError('Por favor, insira um intervalo de minutos válido (1-90)');
      return;
    }
    if (step === 3 && strategyType === 'general' && selectedLeagues.length === 0) {
      setError('Por favor, selecione pelo menos um campeonato');
      return;
    }
    if (step === 3 && strategyType === 'specific' && !selectedMatchId) {
      setError('Por favor, selecione um jogo');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-slate-700 rounded-sm flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-slate-100" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Criar Estratégia
            </h1>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 ml-15">
          Configure uma nova estratégia personalizada
        </p>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative"
      >
        <div className="flex items-center justify-center gap-2 md:gap-4">
          {(() => {
            const stepsStrategy = strategyType === 'general' 
              ? [
                  { step: 1, label: 'Tipo', icon: Sparkles },
                  { step: 2, label: 'Básico', icon: Target },
                  { step: 3, label: 'Ligas', icon: Globe },
                  { step: 4, label: 'Condições', icon: Zap },
                  { step: 5, label: 'Revisão', icon: Check },
                ]
              : [
                  { step: 1, label: 'Tipo', icon: Sparkles },
                  { step: 2, label: 'Básico', icon: Target },
                  { step: 3, label: strategyType === 'specific' ? 'Jogo' : 'Data', icon: strategyType === 'specific' ? MapPin : Calendar },
                  { step: 4, label: 'Condições', icon: Zap },
                  { step: 5, label: 'Revisão', icon: Check },
                ];
            
            return stepsStrategy.map((item, index) => (
              <div key={item.step} className="flex items-center flex-1">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative group"
                >
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-sm flex items-center justify-center font-bold transition-all duration-300 ${
                      step >= item.step
                        ? 'bg-slate-700 text-slate-100'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {step > item.step ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <item.icon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-gray-600 dark:text-gray-400">
                    {item.label}
                  </div>
                </motion.div>
                {index < 4 && (
                  <div className="flex-1 h-1 mx-2 md:mx-4 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: step > item.step ? '100%' : '0%' }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`h-full ${step > item.step ? 'bg-slate-700' : 'bg-slate-800'}`}
                    />
                  </div>
                )}
              </div>
            ));
          })()}
        </div>
        <div className="h-8" /> {/* Spacer for labels */}
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl"
        >
          {error}
        </motion.div>
      )}

      <div>
        <AnimatePresence mode="wait">
          {/* Step 1: Strategy Type Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border border-slate-700 bg-slate-800">
                <CardHeader className="border-b border-slate-700 bg-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-700 rounded-sm flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-slate-100" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Passo 1: Tipo de Estratégia
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Escolha o tipo de estratégia que deseja criar
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {STRATEGY_TYPES.map((type) => (
                      <motion.button
                        key={type.value}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setStrategyType(type.value as any)}
                        className={`p-6 rounded-sm border transition-all duration-300 text-left ${
                          strategyType === type.value
                            ? 'border-slate-600 bg-slate-700 text-slate-100'
                            : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className="w-10 h-10 bg-slate-800 rounded-sm flex items-center justify-center mb-3">
                          <type.icon className="w-5 h-5" />
                        </div>
                        <h4 className="font-semibold text-sm mb-2">{type.label}</h4>
                        <p className="text-xs opacity-80">{type.description}</p>
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Basic Info */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border border-slate-700 bg-slate-800">
                <CardHeader className="border-b border-slate-700 bg-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-700 rounded-sm flex items-center justify-center">
                      <Target className="w-3 h-3 text-slate-100" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Passo 2: Informações Básicas
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Defina o nome e o intervalo de tempo da estratégia
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                      Nome da Estratégia
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ex: Pressão Inicial"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="border-gray-200 dark:border-gray-700 focus:ring-[#2D69B3] focus:border-[#2D69B3] rounded-xl py-3"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Um nome descritivo para identificar sua estratégia
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="startMinute" className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                        Minuto Inicial
                      </Label>
                      <Input
                        id="startMinute"
                        type="number"
                        min="1"
                        max="90"
                        value={startMinute}
                        onChange={(e) => setStartMinute(parseInt(e.target.value))}
                        required
                        disabled={isSubmitting}
                        className="border-gray-200 dark:border-gray-700 focus:ring-[#2D69B3] focus:border-[#2D69B3] rounded-xl py-3"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endMinute" className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                        Minuto Final
                      </Label>
                      <Input
                        id="endMinute"
                        type="number"
                        min="1"
                        max="90"
                        value={endMinute}
                        onChange={(e) => setEndMinute(parseInt(e.target.value))}
                        required
                        disabled={isSubmitting}
                        className="border-gray-200 dark:border-gray-700 focus:ring-[#2D69B3] focus:border-[#2D69B3] rounded-xl py-3"
                      />
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      A estratégia será ativa apenas durante este intervalo de minutos da partida
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

        {/* Step 3: Leagues (for general strategy) */}
        {step === 3 && strategyType === 'general' && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-slate-700 bg-slate-800">
              <CardHeader className="border-b border-slate-700 bg-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-700 rounded-sm flex items-center justify-center">
                      <Globe className="w-3 h-3 text-slate-100" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Passo 2: Campeonatos Monitorados
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Selecione em quais campeonatos esta estratégia será aplicada
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={selectAllLeagues}
                      variant="outline"
                      size="sm"
                      disabled={isSubmitting}
                      className="border-[#2D69B3] text-[#2D69B3] hover:bg-[#2D69B3] hover:text-white rounded-xl"
                    >
                      Selecionar Todos
                    </Button>
                    <Button
                      type="button"
                      onClick={clearAllLeagues}
                      variant="outline"
                      size="sm"
                      disabled={isSubmitting}
                      className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"
                    >
                      Limpar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Pesquisar campeonato..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isSubmitting}
                    className="pl-12 border-gray-200 dark:border-gray-700 focus:ring-[#2D69B3] focus:border-[#2D69B3] rounded-xl py-3"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredLeagues.map((league) => (
                    <motion.button
                      key={league.slug}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleLeague(league.slug)}
                      disabled={isSubmitting}
                      className={`p-2 rounded-sm border transition-all duration-300 text-xs font-medium text-center ${
                        selectedLeagues.includes(league.slug)
                          ? 'border-slate-600 bg-slate-700 text-slate-100'
                          : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {league.name}
                    </motion.button>
                  ))}
                </div>

                {selectedLeagues.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-4 border-t border-gray-200 dark:border-gray-700"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#2D69B3]" />
                      {selectedLeagues.length} campeonato{selectedLeagues.length !== 1 ? 's' : ''} selecionado{selectedLeagues.length !== 1 ? 's' : ''}
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Match Selection (for specific strategy) */}
        {step === 3 && strategyType === 'specific' && (
          <motion.div
            key="step3-specific"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-slate-700 bg-slate-800">
              <CardHeader className="border-b border-slate-700 bg-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-700 rounded-sm flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-slate-100" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                      Passo 3: Selecionar Jogo
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Escolha o jogo específico para esta estratégia
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  {availableMatches.length === 0 ? (
                    <p className="text-sm text-slate-400">Nenhum jogo disponível hoje</p>
                  ) : (
                    availableMatches.map((match) => (
                      <motion.button
                        key={match.eventId}
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedMatchId(match.eventId)}
                        className={`w-full p-4 rounded-sm border transition-all duration-300 text-left ${
                          selectedMatchId === match.eventId
                            ? 'border-slate-600 bg-slate-700 text-slate-100'
                            : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">{match.homeTeam.name} vs {match.awayTeam.name}</p>
                            <p className="text-xs opacity-80 mt-1">{match.leagueName}</p>
                          </div>
                          <div className="text-xs">
                            {new Date(match.startTime).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Date Selection (for daily strategy) */}
        {step === 3 && strategyType === 'daily' && (
          <motion.div
            key="step3-daily"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-slate-700 bg-slate-800">
              <CardHeader className="border-b border-slate-700 bg-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-700 rounded-sm flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-slate-100" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                      Passo 3: Selecionar Data
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Escolha a data para esta estratégia diária
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div>
                  <Label htmlFor="date" className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                    Data
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="border-gray-200 dark:border-gray-700 focus:ring-[#2D69B3] focus:border-[#2D69B3] rounded-xl py-3"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Conditions */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-slate-700 bg-slate-800">
              <CardHeader className="border-b border-slate-700 bg-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-700 rounded-sm flex items-center justify-center">
                      <Zap className="w-3 h-3 text-slate-100" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Passo 4: Condições
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Defina as regras que acionarão a estratégia
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={addCondition}
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    className="border-[#2D69B3] text-[#2D69B3] hover:bg-[#2D69B3] hover:text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Condição
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {conditions.length === 0 ? (
                  <div className="text-center py-16">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-12 h-12 bg-slate-700 rounded-sm flex items-center justify-center mx-auto mb-3"
                    >
                      <Plus className="w-5 h-5 text-slate-400" />
                    </motion.div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      Nenhuma condição adicionada
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                      Adicione pelo menos uma condição para que a estratégia funcione.
                    </p>
                    <Button
                      type="button"
                      onClick={addCondition}
                      disabled={isSubmitting}
                      className="bg-slate-700 hover:bg-slate-600 rounded-sm px-3 py-2 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Adicionar Primeira Condição
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conditions.map((condition, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-[#2D69B3] hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-slate-700 rounded-sm flex items-center justify-center">
                              <Zap className="w-3 h-3 text-slate-100" />
                            </div>
                            <h4 className="font-semibold text-slate-100 text-xs">Condição {index + 1}</h4>
                          </div>
                          <Button
                            type="button"
                            onClick={() => removeCondition(index)}
                            variant="ghost"
                            size="sm"
                            disabled={isSubmitting}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Indicador</Label>
                            <select
                              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2D69B3] disabled:opacity-50 transition-colors duration-200"
                              value={condition.indicator}
                              onChange={(e) => updateCondition(index, 'indicator', e.target.value)}
                              disabled={isSubmitting}
                            >
                              {INDICATORS.map((ind) => (
                                <option key={ind.value} value={ind.value}>
                                  {ind.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Equipe</Label>
                            <select
                              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2D69B3] disabled:opacity-50 transition-colors duration-200"
                              value={condition.team}
                              onChange={(e) => updateCondition(index, 'team', e.target.value)}
                              disabled={isSubmitting}
                            >
                              {TEAMS.map((team) => (
                                <option key={team.value} value={team.value}>
                                  {team.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Operador</Label>
                            <select
                              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2D69B3] disabled:opacity-50 transition-colors duration-200"
                              value={condition.operator}
                              onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                              disabled={isSubmitting}
                            >
                              {OPERATORS.map((op) => (
                                <option key={op.value} value={op.value}>
                                  {op.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Quantidade</Label>
                            <Input
                              type="number"
                              min="0"
                              value={condition.quantity}
                              onChange={(e) => updateCondition(index, 'quantity', parseInt(e.target.value))}
                              disabled={isSubmitting}
                              className="border-gray-200 dark:border-gray-700 focus:ring-[#2D69B3] focus:border-[#2D69B3] rounded-xl py-3"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-slate-700 bg-slate-800">
              <CardHeader className="border-b border-slate-700 bg-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-700 rounded-sm flex items-center justify-center">
                    <Check className="w-3 h-3 text-slate-100" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                      Passo 5: Revisão
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Revise sua estratégia antes de criar
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-3 bg-slate-900 border border-slate-700 rounded-sm"
                >
                  <h4 className="font-semibold text-slate-100 mb-2 flex items-center gap-2 text-xs">
                    <Sparkles className="w-3 h-3 text-slate-400" />
                    Tipo de Estratégia
                  </h4>
                  <p className="text-xs text-slate-300">
                    {STRATEGY_TYPES.find((t) => t.value === strategyType)?.label}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="p-3 bg-slate-900 border border-slate-700 rounded-sm"
                >
                  <h4 className="font-semibold text-slate-100 mb-2 flex items-center gap-2 text-xs">
                    <Target className="w-3 h-3 text-slate-400" />
                    Informações Básicas
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400 mb-1">Nome</p>
                      <p className="font-semibold text-slate-100">{name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">Intervalo</p>
                      <p className="font-semibold text-slate-100">
                        {startMinute}&apos; - {endMinute}&apos;
                      </p>
                    </div>
                  </div>
                </motion.div>

                {strategyType === 'general' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-3 bg-slate-900 border border-slate-700 rounded-sm"
                  >
                    <h4 className="font-semibold text-slate-100 mb-2 flex items-center gap-2 text-xs">
                      <Globe className="w-3 h-3 text-slate-400" />
                      Campeonatos Monitorados ({selectedLeagues.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedLeagues.map(slug => {
                        const league = LEAGUE_MAPPINGS.find(l => l.slug === slug);
                        return (
                          <div key={slug} className="text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded-sm">
                            {league?.name || slug}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {strategyType === 'specific' && selectedMatchId && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-3 bg-slate-900 border border-slate-700 rounded-sm"
                  >
                    <h4 className="font-semibold text-slate-100 mb-2 flex items-center gap-2 text-xs">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      Jogo Selecionado
                    </h4>
                    {(() => {
                      const match = availableMatches.find(m => m.eventId === selectedMatchId);
                      return match ? (
                        <p className="text-xs text-slate-300">
                          {match.homeTeam.name} vs {match.awayTeam.name} - {match.leagueName}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400">Jogo não encontrado</p>
                      );
                    })()}
                  </motion.div>
                )}

                {strategyType === 'daily' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-3 bg-slate-900 border border-slate-700 rounded-sm"
                  >
                    <h4 className="font-semibold text-slate-100 mb-2 flex items-center gap-2 text-xs">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Data Selecionada
                    </h4>
                    <p className="text-xs text-slate-300">
                      {new Date(selectedDate).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-3 bg-slate-900 border border-slate-700 rounded-sm"
                >
                  <h4 className="font-semibold text-slate-100 mb-2 flex items-center gap-2 text-xs">
                    <Zap className="w-3 h-3 text-slate-400" />
                    Condições ({conditions.length})
                  </h4>
                  {conditions.map((condition, index) => (
                    <div key={index} className="mb-2 last:mb-0 pb-2 last:pb-0 border-b border-slate-700 last:border-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-semibold text-slate-100 bg-slate-800 px-2 py-1 rounded-sm">
                          {INDICATORS.find((i) => i.value === condition.indicator)?.label}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-400">
                          {TEAMS.find((t) => t.value === condition.team)?.label}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-400">
                          {OPERATORS.find((o) => o.value === condition.operator)?.label}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-semibold text-slate-100 bg-slate-800 px-2 py-1 rounded-sm">{condition.quantity}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-between items-center"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              variant="outline"
              disabled={step === 1 || isSubmitting}
              onClick={prevStep}
              className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl px-6 py-3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
          </motion.div>

          {step === 4 ? (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={conditions.length === 0 || selectedLeagues.length === 0 || isSubmitting}
                className="bg-gradient-to-r from-[#3DB8F5] to-[#2D69B3] hover:from-[#2D69B3] hover:to-[#122F5A] text-white rounded-xl px-6 py-3 shadow-lg shadow-[#2D69B3]/30"
              >
                {isSubmitting ? 'Criando...' : 'Criar Estratégia'}
                {!isSubmitting && <Check className="w-4 h-4 ml-2" />}
              </Button>
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                onClick={nextStep}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#3DB8F5] to-[#2D69B3] hover:from-[#2D69B3] hover:to-[#122F5A] text-white rounded-xl px-6 py-3 shadow-lg shadow-[#2D69B3]/30"
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4"
            >
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-[#2D69B3] border-t-transparent rounded-full mb-6"
                />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Criando estratégia...
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Por favor, aguarde enquanto configuramos sua estratégia de monitoramento.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
