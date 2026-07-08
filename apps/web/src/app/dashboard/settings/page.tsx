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
        <div className="w-12 h-12 bg-gradient-to-br from-[#3DB8F5] to-[#2D69B3] rounded-xl flex items-center justify-center shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Configurações</h1>
          <p className="text-gray-600 dark:text-gray-400">Personalize sua experiência</p>
        </div>
      </motion.div>

      <div className="grid gap-6">
        {/* Notifications Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Notificações</h3>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
              >
                <div>
                  <p className="font-bold text-gray-900 dark:text-white mb-1">Notificações por Email</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receba alertas por email</p>
                </div>
                <Toggle
                  checked={emailNotifications}
                  onChange={setEmailNotifications}
                  aria-label="Alternar notificações por email"
                  className="scale-110"
                />
              </motion.div>
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
              >
                <div>
                  <p className="font-bold text-gray-900 dark:text-white mb-1">Notificações Push</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receba notificações no navegador</p>
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
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Moon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Aparência</h3>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
              >
                <div>
                  <p className="font-bold text-gray-900 dark:text-white mb-1">Modo Escuro</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Use o tema escuro</p>
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
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Segurança</h3>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <p className="font-bold text-gray-900 dark:text-white mb-3">Alterar Senha</p>
                <Input 
                  type="password" 
                  placeholder="Nova senha" 
                  className="border-gray-200 dark:border-gray-700 focus:ring-[#2D69B3] focus:border-[#2D69B3] rounded-xl py-3"
                />
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="bg-gradient-to-r from-[#3DB8F5] to-[#2D69B3] hover:from-[#2D69B3] hover:to-[#122F5A] text-white rounded-xl px-6 py-3 shadow-lg shadow-[#2D69B3]/30">
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
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Tutorial</h3>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">
                Reabra o tutorial inicial para aprender novamente como usar o MatchPulse
              </p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  onClick={resetTutorial}
                  className="border-[#2D69B3] text-[#2D69B3] hover:bg-[#2D69B3] hover:text-white rounded-xl px-6 py-3"
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
