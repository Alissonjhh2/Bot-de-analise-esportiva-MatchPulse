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
          <div className="w-6 h-6 bg-slate-700 rounded-sm flex items-center justify-center">
            <Send className="w-3 h-3 text-slate-100" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Telegram</h1>
          </div>
        </div>
        <Card className="border border-slate-700 bg-slate-800">
          <CardContent className="p-3">
            <div className="flex items-center justify-center py-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-slate-600 border-t-transparent rounded-full"
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
        <div className="w-6 h-6 bg-slate-700 rounded-sm flex items-center justify-center">
          <Send className="w-3 h-3 text-slate-100" />
        </div>
        <div>
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Telegram</h1>
        </div>
      </div>

      {/* Configuration Card */}
      <Card className="border border-slate-700 bg-slate-800">
        <CardHeader className="border-b border-slate-700 bg-slate-800">
          <h3 className="text-xs font-semibold text-slate-100 tracking-tight">Configuração</h3>
        </CardHeader>
        <CardContent className="p-3 space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-700 rounded-sm">
            <div className="flex items-center gap-3">
              <motion.div
                animate={isConnected ? { scale: [1, 1.05, 1] } : { scale: [1, 0.95, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className={`w-8 h-8 rounded-sm flex items-center justify-center ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {isConnected ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <XCircle className="w-4 h-4 text-white" />
                )}
              </motion.div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Status</p>
                <p className="text-sm font-semibold text-slate-100">
                  {isConnected ? 'Conectado' : 'Não Conectado'}
                </p>
              </div>
            </div>
            <Badge 
              variant={isConnected ? 'success' : 'danger'} 
              className="text-xs"
            >
              {isConnected ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>

          {/* Connection Details */}
          {isConnected && connection && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-900 border border-slate-700 rounded-sm">
                <p className="text-xs text-slate-400 mb-1">Chat ID</p>
                <p className="text-sm font-mono text-slate-100">{connection.chatId}</p>
              </div>
              {connection.username && (
                <div className="p-3 bg-slate-900 border border-slate-700 rounded-sm">
                  <p className="text-xs text-slate-400 mb-1">Usuário</p>
                  <p className="text-sm text-slate-100">@{connection.username}</p>
                </div>
              )}
              <div className="p-3 bg-slate-900 border border-slate-700 rounded-sm">
                <p className="text-xs text-slate-400 mb-1">Conectado em</p>
                <p className="text-sm text-slate-100">
                  {new Date(connection.connectedAt).toLocaleString('pt-BR')}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={disconnect}
                className="w-full border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-slate-100 rounded-sm py-2 text-xs"
              >
                Desconectar
              </Button>
            </div>
          )}

          {/* Connection Instructions */}
          {!isConnected && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-900 border border-slate-700 rounded-sm">
                <p className="text-xs text-slate-400 mb-2">
                  Para conectar, abra o bot <span className="text-slate-100 font-semibold">@Match2Pulsebot</span> no Telegram e envie o comando <span className="text-slate-100 font-mono">/start</span>. Em seguida, use o código gerado abaixo.
                </p>
              </div>

              {linkCode ? (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-900 border border-slate-700 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-400">Código de Conexão</p>
                      <p className="text-xs text-slate-500">Válido por 5 min</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-2 bg-slate-950 border border-slate-600 rounded-sm">
                        <p className="text-lg font-mono font-bold text-center text-slate-100 tracking-wider">
                          {linkCode}
                        </p>
                      </div>
                      <Button
                        onClick={copyCode}
                        variant="outline"
                        className="flex-shrink-0 h-10 w-10 border-slate-600 text-slate-400 hover:bg-slate-700 rounded-sm"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {copied && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <p className="text-xs text-green-400">Código copiado</p>
                    </motion.div>
                  )}
                </div>
              ) : (
                <Button
                  onClick={generateLinkCode}
                  disabled={generatingCode}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-sm py-2 text-xs"
                >
                  {generatingCode ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
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
