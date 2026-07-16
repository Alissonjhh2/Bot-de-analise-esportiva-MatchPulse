'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@matchpulse/ui';
import { Button } from '@matchpulse/ui';
import { Badge } from '@matchpulse/ui';
import { CheckCircle, XCircle, Copy, RefreshCw, Send } from 'lucide-react';
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
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-sm flex items-center justify-center">
            <Send className="w-4 h-4 text-slate-950 dark:text-slate-100" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-slate-950 dark:text-slate-100 tracking-tight">Telegram</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Carregando...</p>
          </div>
        </div>
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-slate-300 dark:border-slate-600 border-t-transparent rounded-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-sm flex items-center justify-center">
          <Send className="w-4 h-4 text-slate-950 dark:text-slate-100" />
        </div>
        <div>
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-slate-950 dark:text-slate-100 tracking-tight">Telegram</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Painel de Controle Técnico</p>
        </div>
      </div>

      {/* Connection Status Card */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-100 tracking-tight">Status da Conexão</h3>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-sm flex items-center justify-center ${
                isConnected ? 'bg-emerald-600' : 'bg-rose-600'
              }`}>
                {isConnected ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <XCircle className="w-4 h-4 text-white" />
                )}
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Status</p>
                <p className="text-lg font-semibold text-slate-950 dark:text-slate-100">
                  {isConnected ? 'Conectado' : 'Não Conectado'}
                </p>
                {isConnected && connection && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Desde {new Date(connection.connectedAt).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
            <Badge 
              className={`text-xs px-3 py-1 ${
                isConnected ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {isConnected ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>

          {/* Connection Details */}
          {isConnected && connection && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Chat ID</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-mono text-slate-950 dark:text-slate-100">{connection.chatId}</p>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(connection.chatId);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    variant="outline"
                    className="h-8 w-8 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-sm"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {connection.username && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Usuário</p>
                  <p className="text-lg text-slate-950 dark:text-slate-100">@{connection.username}</p>
                </div>
              )}
              <Button
                onClick={disconnect}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-sm py-2 text-sm"
              >
                Desconectar
              </Button>
            </div>
          )}

          {/* Connection Instructions */}
          {!isConnected && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Para conectar, abra o bot <span className="text-slate-950 dark:text-slate-100 font-semibold">@Match2Pulsebot</span> no Telegram e envie o comando <span className="text-slate-950 dark:text-slate-100 font-mono">/start</span>. Em seguida, use o código gerado abaixo.
                </p>
              </div>

              {linkCode ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Código de Conexão</p>
                      <p className="text-sm text-slate-500">Válido por 5 min</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm">
                        <p className="text-xl font-mono font-bold text-center text-slate-950 dark:text-slate-100 tracking-wider">
                          {linkCode}
                        </p>
                      </div>
                      <Button
                        onClick={copyCode}
                        variant="outline"
                        className="flex-shrink-0 h-12 w-12 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-sm"
                      >
                        <Copy className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  {copied && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <p className="text-sm text-emerald-600 dark:text-emerald-500">Código copiado</p>
                    </motion.div>
                  )}
                </div>
              ) : (
                <Button
                  onClick={generateLinkCode}
                  disabled={generatingCode}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm py-3 text-sm"
                >
                  {generatingCode ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    'Gerar Código de Conexão'
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
