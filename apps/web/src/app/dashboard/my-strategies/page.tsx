'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@matchpulse/ui';
import { Badge } from '@matchpulse/ui';
import { AlertTriangle, Power, PowerOff, Plus, Edit2, Trash2, Sparkles, Target, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@matchpulse/ui';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Strategy {
  id: string;
  name: string;
  startMinute: number;
  endMinute: number;
  status: 'ACTIVE' | 'INACTIVE';
  conditions: unknown[];
}

export default function MyStrategiesPage() {
  const router = useRouter();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [strategyToDelete, setStrategyToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{success: boolean, data: {data: Strategy[], pagination: {page: number, pageSize: number, total: number, totalPages: number}}}>('/strategies');
      console.log('[MyStrategies] Response:', response);
      console.log('[MyStrategies] Response.data:', response.data);
      console.log('[MyStrategies] Response.data.data:', response.data.data);
      setStrategies(response.data.data || []);
    } catch (err) {
      console.error('Error fetching strategies:', err);
      setError('Erro ao carregar estratégias. Tente novamente.');
      setStrategies([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await apiClient.patch(`/strategies/${id}/status`, { status: newStatus });
      // Refresh strategies
      fetchStrategies();
    } catch (err) {
      console.error('Error updating strategy status:', err);
      setError('Erro ao atualizar status da estratégia.');
    }
  };

  const deleteStrategy = async (id: string) => {
    setStrategyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!strategyToDelete) return;

    try {
      await apiClient.delete(`/strategies/${strategyToDelete}`);
      setDeleteDialogOpen(false);
      setStrategyToDelete(null);
      // Refresh strategies
      fetchStrategies();
    } catch (err) {
      console.error('Error deleting strategy:', err);
      setError('Erro ao deletar estratégia.');
      setDeleteDialogOpen(false);
    }
  };

  const editStrategy = (id: string) => {
    router.push(`/dashboard/edit-strategy/${id}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-sm flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-slate-950 dark:text-slate-100" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-slate-950 dark:text-slate-100 tracking-tight">
              Minhas Estratégias
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Gerencie suas estratégias ativas
            </p>
          </div>
        </div>
        <Link href="/dashboard/create-strategy">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-600 text-slate-950 dark:text-slate-100 rounded-sm px-3 py-2 text-xs">
              <Plus className="w-3 h-3 mr-1" />
              Criar Estratégia
            </Button>
          </motion.div>
        </Link>
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

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block w-16 h-16 border-4 border-[#2D69B3] border-t-transparent rounded-full mb-6"
          />
          <p className="text-gray-600 dark:text-gray-400">Carregando estratégias...</p>
        </motion.div>
      ) : strategies.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-sm flex items-center justify-center mx-auto mb-3"
                >
                  <Target className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </motion.div>
                <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-100 mb-2">
                  Nenhuma estratégia criada ainda
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto">
                  Crie sua primeira estratégia para começar a receber alertas em tempo real.
                </p>
                <Link href="/dashboard/create-strategy">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-600 text-slate-950 dark:text-slate-100 rounded-sm px-3 py-2 text-xs">
                      <Plus className="w-3 h-3 mr-1" />
                      Criar Primeira Estratégia
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid gap-3 md:gap-4 lg:gap-6"
        >
          <AnimatePresence>
            {strategies.map((strategy, index) => (
              <motion.div
                key={strategy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <motion.div
                          whileHover={{ scale: 1.05, rotate: 3 }}
                          className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-sm flex items-center justify-center"
                        >
                          <Target className="w-4 h-4 text-slate-950 dark:text-slate-100" />
                        </motion.div>
                        <div>
                          <h3 className="font-semibold text-slate-950 dark:text-slate-100 text-sm mb-1">{strategy.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-sm">
                              <Zap className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                              <span className="font-medium">{strategy.startMinute}&apos; - {strategy.endMinute}&apos;</span>
                            </div>
                            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-sm">
                              <AlertTriangle className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                              <span className="font-medium">{strategy.conditions.length} condição(ões)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={strategy.status === 'ACTIVE' ? 'success' : 'default'}
                          className={`px-2 py-0.5 text-xs font-semibold ${
                            strategy.status === 'ACTIVE' 
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-950 dark:text-slate-100 border-slate-600' 
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-600'
                          }`}
                        >
                          {strategy.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                          onClick={() => editStrategy(strategy.id)}
                          title="Editar"
                        >
                          <Edit2 className="w-5 h-5 text-blue-600" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                          onClick={() => deleteStrategy(strategy.id)}
                          title="Deletar"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                          onClick={() => toggleStatus(strategy.id, strategy.status)}
                          title={strategy.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                        >
                          {strategy.status === 'ACTIVE' ? (
                            <Power className="w-5 h-5 text-green-600" />
                          ) : (
                            <PowerOff className="w-5 h-5 text-gray-400" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setStrategyToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Deletar Estratégia"
        message="Tem certeza que deseja deletar esta estratégia? Esta ação não pode ser desfeita."
        confirmText="Deletar"
        cancelText="Cancelar"
      />
    </div>
  );
}
