'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@matchpulse/ui';
import { Button } from '@matchpulse/ui';
import { Input } from '@matchpulse/ui';
import { Toggle } from '@matchpulse/ui';
import { Bell, Moon, Shield, HelpCircle, Sparkles } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useTutorial } from '@matchpulse/hooks';

export default function SettingsPage() {
  const { setTheme, actualTheme } = useTheme();
  const { resetTutorial } = useTutorial();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3"
      >
        <div className="w-8 h-8 bg-slate-700 rounded-sm flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-slate-100" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-100 tracking-tight">Configurações</h1>
          <p className="text-xs text-slate-400 mt-1">Personalize sua experiência</p>
        </div>
      </motion.div>

      <div className="grid gap-6">
        {/* Notifications Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="border border-slate-700 bg-slate-800">
            <CardHeader className="border-b border-slate-700 bg-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-700 rounded-sm flex items-center justify-center">
                  <Bell className="w-3 h-3 text-slate-100" />
                </div>
                <h3 className="text-sm font-semibold text-slate-100 tracking-tight">Notificações</h3>
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between p-2 bg-slate-900 rounded-sm"
              >
                <div>
                  <p className="font-semibold text-slate-100 mb-1 text-xs">Notificações por Email</p>
                  <p className="text-xs text-slate-400">Receba alertas por email</p>
                </div>
                <Toggle
                  checked={emailNotifications}
                  onChange={setEmailNotifications}
                  aria-label="Alternar notificações por email"
                  className="scale-110"
                />
              </motion.div>
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between p-2 bg-slate-900 rounded-sm"
              >
                <div>
                  <p className="font-semibold text-slate-100 mb-1 text-xs">Notificações Push</p>
                  <p className="text-xs text-slate-400">Receba notificações no navegador</p>
                </div>
                <Toggle
                  checked={pushNotifications}
                  onChange={setPushNotifications}
                  aria-label="Alternar notificações push"
                  className="scale-110"
                />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border border-slate-700 bg-slate-800">
            <CardHeader className="border-b border-slate-700 bg-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-700 rounded-sm flex items-center justify-center">
                  <Moon className="w-3 h-3 text-slate-100" />
                </div>
                <h3 className="text-sm font-semibold text-slate-100 tracking-tight">Aparência</h3>
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between p-2 bg-slate-900 rounded-sm"
              >
                <div>
                  <p className="font-semibold text-slate-100 mb-1 text-xs">Modo Escuro</p>
                  <p className="text-xs text-slate-400">Use o tema escuro</p>
                </div>
                <Toggle
                  checked={actualTheme === 'dark'}
                  onChange={(checked: boolean) => setTheme(checked ? 'dark' : 'light')}
                  aria-label="Alternar modo escuro"
                  className="scale-110"
                />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="border border-slate-700 bg-slate-800">
            <CardHeader className="border-b border-slate-700 bg-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-700 rounded-sm flex items-center justify-center">
                  <Shield className="w-3 h-3 text-slate-100" />
                </div>
                <h3 className="text-sm font-semibold text-slate-100 tracking-tight">Segurança</h3>
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div>
                <p className="font-semibold text-slate-100 mb-2 text-xs">Alterar Senha</p>
                <Input 
                  type="password" 
                  placeholder="Nova senha" 
                  className="border-slate-700 focus:ring-slate-600 focus:border-slate-600 rounded-sm py-2 text-xs"
                />
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-sm px-3 py-2 text-xs">
                  Atualizar Senha
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tutorial Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="border border-slate-700 bg-slate-800">
            <CardHeader className="border-b border-slate-700 bg-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-700 rounded-sm flex items-center justify-center">
                  <HelpCircle className="w-3 h-3 text-slate-100" />
                </div>
                <h3 className="text-sm font-semibold text-slate-100 tracking-tight">Tutorial</h3>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <p className="text-slate-400 mb-3 font-medium text-xs">
                Reabra o tutorial inicial para aprender novamente como usar o MatchPulse
              </p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  onClick={resetTutorial}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 rounded-sm text-xs px-3 py-2"
                >
                  Reiniciar Tutorial
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
