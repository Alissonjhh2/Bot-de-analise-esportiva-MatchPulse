'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@matchpulse/ui';
import { Button } from '@matchpulse/ui';
import { Input } from '@matchpulse/ui';
import { Label } from '@matchpulse/ui';
import { Plus, Trash2, ArrowRight, ArrowLeft, Check, Search, X, Sparkles, Target, Zap, Globe } from 'lucide-react';
import { apiClient } from '@/lib/api';

const LEAGUE_MAPPINGS = [
  { name: 'Campeonato Brasileiro', slug: 'bra.1' },
  { name: 'Campeonato Brasileiro Série B', slug: 'bra.2' },
  { name: 'Série C do Brasil', slug: 'bra.3' },
  { name: 'Copa do Brasil', slug: 'bra.cup' },
  { name: 'Liga dos Campeões da UEFA', slug: 'uefa.champions' },
  { name: 'Liga Europa da UEFA', slug: 'uefa.europa' },
  { name: 'Copa do Mundo', slug: 'fifa.world' },
  { name: 'CONMEBOL Libertadores', slug: 'conmebol.libertadores' },
  { name: 'CONMEBOL Sul-Americana', slug: 'conmebol.sudamericana' },
  { name: 'Premier League', slug: 'eng.1' },
  { name: 'LALIGA', slug: 'esp.1' },
  { name: 'Ligue 1', slug: 'fra.1' },
  { name: 'Bundesliga', slug: 'ger.1' },
  { name: 'Série A', slug: 'ita.1' },
  { name: 'Copa das Nações da África', slug: 'caf.champions' },
  { name: 'Campeonato Chinês', slug: 'chn.1' },
  { name: 'Campeonato Português', slug: 'por.1' },
  { name: 'Mundial Feminino', slug: 'fifa.womens_world' },
  { name: 'Campeonato Paulista', slug: 'bra.paulista' },
  { name: 'Campeonato Carioca', slug: 'bra.carioca' },
  { name: 'Campeonato Gaúcho', slug: 'bra.gaucha' },
  { name: 'Campeonato Mineiro', slug: 'bra.mineiro' },
  { name: 'Copa do Nordeste', slug: 'bra.nordeste' },
  { name: 'Supercopa do Brasil', slug: 'bra.supercopa' },
  { name: 'Eliminatórias Eurocopa', slug: 'uefa.euro_qual' },
  { name: 'Copa São Paulo', slug: 'bra.copasp' },
  { name: 'Copa América', slug: 'conmebol.america' },
  { name: 'Amistoso', slug: 'friendly' },
  { name: 'Brasileiro - S20', slug: 'bra.s20' },
  { name: 'Copa do Brasil - S17', slug: 'bra.cup.s17' },
  { name: 'Copa do Brasil - S20', slug: 'bra.cup.s20' },
  { name: 'Pan-Americano - Futebol Feminino', slug: 'pan_american_womens' },
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
  { value: 'DANGEROUS_ATTACKS', label: 'Ataques Perigosos' },
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

export default function CreateStrategyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [startMinute, setStartMinute] = useState(1);
  const [endMinute, setEndMinute] = useState(90);
  const [conditions, setConditions] = useState<StrategyCondition[]>([]);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([DEFAULT_LEAGUE]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only allow submission if we're on step 4 (review step)
    if (step !== 4) {
      return;
    }
    
    // Prevent submission if conditions are not met
    if (conditions.length === 0 || selectedLeagues.length === 0) {
      setError('Por favor, adicione pelo menos uma condição e selecione pelo menos um campeonato');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      await apiClient.post('/strategies', {
        name,
        startMinute,
        endMinute,
        conditions,
        leagues: selectedLeagues,
      });

      // Success - redirect to my strategies
      router.push('/dashboard/my-strategies');
    } catch (err: any) {
      console.error('Error creating strategy:', err);
      
      // Check if it's a strategy limit error
      if (err.message && err.message.includes('Limite de estratégias atingido')) {
        setError(err.message);
      } else {
        setError('Erro ao criar estratégia. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !name.trim()) {
      setError('Por favor, insira um nome para a estratégia');
      return;
    }
    if (step === 1 && (startMinute < 1 || endMinute > 90 || startMinute >= endMinute)) {
      setError('Por favor, insira um intervalo de minutos válido (1-90)');
      return;
    }
    if (step === 2 && selectedLeagues.length === 0) {
      setError('Por favor, selecione pelo menos um campeonato');
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
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-[#3DB8F5] to-[#2D69B3] rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Criar Estratégia
            </h1>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 ml-15">
          Configure uma nova estratégia personalizada em 4 passos
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
          {[
            { step: 1, label: 'Básico', icon: Target },
            { step: 2, label: 'Ligas', icon: Globe },
            { step: 3, label: 'Condições', icon: Zap },
            { step: 4, label: 'Revisão', icon: Check },
          ].map((item, index) => (
            <div key={item.step} className="flex items-center flex-1">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative group"
              >
                <div
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 ${
                    step >= item.step
                      ? 'bg-gradient-to-br from-[#3DB8F5] to-[#2D69B3] text-white shadow-lg shadow-[#2D69B3]/30'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
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
              {index < 3 && (
                <div className="flex-1 h-1 mx-2 md:mx-4 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: step > item.step ? '100%' : '0%' }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`h-full ${step > item.step ? 'bg-gradient-to-r from-[#3DB8F5] to-[#2D69B3]' : 'bg-gray-200 dark:bg-gray-700'}`}
                  />
                </div>
              )}
            </div>
          ))}
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
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#3DB8F5] to-[#2D69B3] rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Passo 1: Informações Básicas
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

        {/* Step 2: Leagues */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#3DB8F5] to-[#2D69B3] rounded-xl flex items-center justify-center">
                      <Globe className="w-5 h-5 text-white" />
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
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-sm font-medium text-center ${
                        selectedLeagues.includes(league.slug)
                          ? 'border-[#2D69B3] bg-gradient-to-br from-[#3DB8F5]/10 to-[#2D69B3]/10 text-[#2D69B3] dark:bg-[#2D69B3]/20 dark:text-[#60a5fa] shadow-md'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
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

        {/* Step 3: Conditions */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#3DB8F5] to-[#2D69B3] rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Passo 3: Condições
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
                      className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <Plus className="w-10 h-10 text-gray-400" />
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
                      className="bg-gradient-to-r from-[#3DB8F5] to-[#2D69B3] hover:from-[#2D69B3] hover:to-[#122F5A] rounded-xl px-6 py-3 shadow-lg shadow-[#2D69B3]/30"
                    >
                      <Plus className="w-4 h-4 mr-2" />
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
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#3DB8F5] to-[#2D69B3] rounded-lg flex items-center justify-center">
                              <Zap className="w-4 h-4 text-white" />
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Condição {index + 1}</h4>
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

        {/* Step 4: Review */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#3DB8F5] to-[#2D69B3] rounded-xl flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                      Passo 4: Revisão
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
                  className="p-6 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-800 rounded-xl border border-blue-100 dark:border-blue-900/30"
                >
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#2D69B3]" />
                    Informações Básicas
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Nome</p>
                      <p className="font-bold text-gray-900 dark:text-white">{name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Intervalo</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {startMinute}' - {endMinute}'
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-gray-800 rounded-xl border border-purple-100 dark:border-purple-900/30"
                >
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-600" />
                    Campeonatos Monitorados ({selectedLeagues.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedLeagues.map(slug => {
                      const league = LEAGUE_MAPPINGS.find(l => l.slug === slug);
                      return (
                        <div key={slug} className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 px-3 py-2 rounded-lg">
                          {league?.name || slug}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-6 bg-gradient-to-br from-green-50 to-white dark:from-green-900/10 dark:to-gray-800 rounded-xl border border-green-100 dark:border-green-900/30"
                >
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-600" />
                    Condições ({conditions.length})
                  </h4>
                  {conditions.map((condition, index) => (
                    <div key={index} className="mb-3 last:mb-0 pb-3 last:pb-0 border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-700 px-3 py-1 rounded-lg">
                          {INDICATORS.find((i) => i.value === condition.indicator)?.label}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {TEAMS.find((t) => t.value === condition.team)?.label}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {OPERATORS.find((o) => o.value === condition.operator)?.label}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-700 px-3 py-1 rounded-lg">{condition.quantity}</span>
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
