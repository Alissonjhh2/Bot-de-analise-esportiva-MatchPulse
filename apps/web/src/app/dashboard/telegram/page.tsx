'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@matchpulse/ui';
import { Button } from '@matchpulse/ui';
import { Badge } from '@matchpulse/ui';
import { Link as LinkIcon, CheckCircle, XCircle, Copy, RefreshCw, Send, Sparkles, Shield, Zap } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface TelegramConnection {
  id: string;
  chatId: string;
  username?: string;
  firstName?: string;
  connectedAt: string;
}

export default function TelegramPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [connection, setConnection] = useState<TelegramConnection | null>(null);
  const [linkCode, setLinkCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchConnection = async () => {
    try {
      const response = await apiClient.get<{success: boolean, data: TelegramConnection | null}>('/telegram');
      const data = response.data;
      
      if (data) {
        setIsConnected(true);
        setConnection(data);
      } else {
        setIsConnected(false);
        setConnection(null);
      }
    } catch (error) {
      console.error('Error fetching Telegram connection:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const generateLinkCode = async () => {
    setGeneratingCode(true);
    try {
      const response = await apiClient.post<{success: boolean, data: { code: string; expiresAt: string }}>('/telegram/link-code');
      const data = response.data;
      setLinkCode(data.code);
    } catch (error) {
      console.error('Error generating link code:', error);
    } finally {
      setGeneratingCode(false);
    }
  };

  const disconnect = async () => {
    try {
      await apiClient.delete('/telegram');
      setIsConnected(false);
      setConnection(null);
      setLinkCode('');
    } catch (error) {
      console.error('Error disconnecting Telegram:', error);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(linkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    fetchConnection();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#3DB8F5] to-[#2D69B3] rounded-xl flex items-center justify-center shadow-lg">
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Telegram</h1>
              <p className="text-gray-600 dark:text-gray-400">Conecte seu Telegram para receber alertas</p>
            </div>
          </div>
        </motion.div>
        <Card className="border-0 shadow-xl">
          <CardContent className="p-12">
            <div className="flex items-center justify-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-[#2D69B3] border-t-transparent rounded-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-[#3DB8F5] to-[#2D69B3] rounded-xl flex items-center justify-center shadow-lg">
          <Send className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Telegram</h1>
          <p className="text-gray-600 dark:text-gray-400">Receba alertas em tempo real no seu Telegram</p>
        </div>
      </motion.div>

      {/* Connection Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Status da Conexão</h3>
          </CardHeader>
          <CardContent className="p-8">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`p-8 rounded-2xl border-2 transition-all duration-300 ${
                isConnected 
                  ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 border-green-200 dark:border-green-800' 
                  : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <motion.div
                    animate={isConnected ? { scale: [1, 1.1, 1] } : { scale: [1, 0.9, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                      isConnected ? 'bg-green-500' : 'bg-red-500'
                    } shadow-lg`}
                  >
                    {isConnected ? (
                      <CheckCircle className="w-10 h-10 text-white" />
                    ) : (
                      <XCircle className="w-10 h-10 text-white" />
                    )}
                  </motion.div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-2xl mb-2">
                      {isConnected ? 'Conectado' : 'Não Conectado'}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      {isConnected 
                        ? `Alertas sendo enviados para @${connection?.username || connection?.firstName || 'seu Telegram'}` 
                        : 'Conecte para receber alertas em tempo real'}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={isConnected ? 'success' : 'danger'} 
                  className={`px-6 py-2 text-sm font-bold ${
                    isConnected 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0' 
                      : 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0'
                  }`}
                >
                  {isConnected ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              {isConnected && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 flex justify-end"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      onClick={disconnect}
                      className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl px-6 py-3"
                    >
                      Desconectar
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Connection Instructions */}
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#3DB8F5] to-[#2D69B3] rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Como Conectar</h3>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-start gap-5"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 bg-gradient-to-br from-[#3DB8F5] to-[#2D69B3] rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-[#2D69B3]/30"
                  >
                    1
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white text-lg mb-2">Abra o Telegram</p>
                    <a 
                      href="https://t.me/Match2Pulsebot" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#2D69B3] hover:text-[#122F5A] font-medium transition-colors"
                    >
                      Clique aqui para abrir @Match2Pulsebot
                      <Send className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-start gap-5"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 bg-gradient-to-br from-[#3DB8F5] to-[#2D69B3] rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-[#2D69B3]/30"
                  >
                    2
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white text-lg mb-2">Inicie o bot</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Envie o comando <span className="font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg text-[#2D69B3] font-bold">/start</span>
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-start gap-5"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 bg-gradient-to-br from-[#3DB8F5] to-[#2D69B3] rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-[#2D69B3]/30"
                  >
                    3
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white text-lg mb-2">Conecte sua conta</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Use o código gerado abaixo
                    </p>
                  </div>
                </motion.div>
              </div>

              <AnimatePresence>
                {linkCode ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-8 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 border-2 border-green-200 dark:border-green-800 rounded-2xl"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <p className="font-bold text-gray-900 dark:text-white text-xl">Seu Código de Conexão</p>
                      <Badge variant="success" className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 px-4 py-1.5 text-sm font-bold">
                        Válido por 5 minutos
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-inner">
                        <p className="text-3xl font-mono font-bold text-center text-gray-900 dark:text-white tracking-widest">
                          {linkCode}
                        </p>
                      </div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          onClick={copyCode}
                          variant="outline"
                          className="flex-shrink-0 h-16 w-16 rounded-xl border-2 border-[#2D69B3] text-[#2D69B3] hover:bg-[#2D69B3] hover:text-white transition-all duration-300"
                        >
                          <Copy className="w-6 h-6" />
                        </Button>
                      </motion.div>
                    </div>
                    <AnimatePresence>
                      {copied && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-center mt-4"
                        >
                          <p className="text-green-600 dark:text-green-400 font-bold flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Código copiado!
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <p className="text-gray-600 dark:text-gray-400 mt-6 text-center font-medium">
                      Envie este código para o bot no Telegram
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={generateLinkCode}
                        disabled={generatingCode}
                        className="w-full bg-gradient-to-r from-[#3DB8F5] to-[#2D69B3] hover:from-[#2D69B3] hover:to-[#122F5A] text-white rounded-xl px-6 py-4 text-lg shadow-lg shadow-[#2D69B3]/30"
                      >
                        {generatingCode ? (
                          <>
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <LinkIcon className="w-5 h-5 mr-2" />
                            Gerar Código de Conexão
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Benefits Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3DB8F5] to-[#2D69B3] rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Benefícios</h3>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Alertas Instantâneos</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Receba notificações em tempo real quando suas estratégias derem match
                </p>
              </motion.div>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Sem Spam</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Sistema inteligente de cooldown evita notificações duplicadas
                </p>
              </motion.div>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Totalmente Gratuito</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Sem custos adicionais para receber alertas
                </p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
