'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@matchpulse/ui';
import { Badge } from '@matchpulse/ui';
import { AlertTriangle, Power, PowerOff, Plus, Edit2, Trash2, Sparkles, Target, Zap, MoreVertical } from 'lucide-react';
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
  conditions: any[];
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
      const response = await apiClient.get<{success: boolean, data: {data: Strategy[], pagination: any}}>('/strategies');
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
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#3DB8F5] to-[#2D69B3] rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Minhas Estratégias
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie suas estratégias ativas
            </p>
          </div>
        </div>
        <Link href="/dashboard/create-strategy">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="bg-gradient-to-r from-[#3DB8F5] to-[#2D69B3] hover:from-[#2D69B3] hover:to-[#122F5A] text-white rounded-xl px-6 py-3 shadow-lg shadow-[#2D69B3]/30">
              <Plus className="w-5 h-5 mr-2" />
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
          <Card className="border-0 shadow-xl">
            <CardContent className="p-16">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-8"
                >
                  <Target className="w-12 h-12 text-gray-400" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Nenhuma estratégia criada ainda
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Crie sua primeira estratégia para começar a receber alertas em tempo real.
                </p>
                <Link href="/dashboard/create-strategy">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-gradient-to-r from-[#3DB8F5] to-[#2D69B3] hover:from-[#2D69B3] hover:to-[#122F5A] text-white rounded-xl px-8 py-4 shadow-lg shadow-[#2D69B3]/30">
                      <Plus className="w-5 h-5 mr-2" />
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
          className="grid gap-6"
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
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-14 h-14 bg-gradient-to-br from-[#3DB8F5] to-[#2D69B3] rounded-2xl flex items-center justify-center shadow-lg shadow-[#2D69B3]/30"
                        >
                          <Target className="w-7 h-7 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-1">{strategy.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                              <Zap className="w-4 h-4 text-[#2D69B3]" />
                              <span className="font-medium">{strategy.startMinute}' - {strategy.endMinute}'</span>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                              <AlertTriangle className="w-4 h-4 text-[#2D69B3]" />
                              <span className="font-medium">{strategy.conditions.length} condição(ões)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
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
