'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@matchpulse/ui';
import { Card, CardContent, CardHeader } from '@matchpulse/ui';
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isConfigured } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!isConfigured) {
      setError('Firebase não está configurado. Configure as variáveis de ambiente.');
      setIsLoading(false);
      return;
    }

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Erro ao fazer login. Verifique suas credenciais.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#122F5A] to-[#1e3a5f]" />
      <div className="absolute inset-0 opacity-50" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      
      {/* Floating Elements */}
      <motion.div 
        animate={{ 
          y: [0, -30, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-20 left-20 w-64 h-64 bg-[#3DB8F5]/20 rounded-full blur-3xl" 
      />
      <motion.div 
        animate={{ 
          y: [0, 30, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-20 right-20 w-80 h-80 bg-[#2D69B3]/20 rounded-full blur-3xl" 
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <Card className="shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0">
          <CardHeader className="text-center pb-8 pt-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#3DB8F5] to-[#2D69B3] rounded-2xl mb-6 shadow-lg"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Bem-vindo de volta
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Entre na sua conta MatchPulse
            </p>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D69B3] focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D69B3] focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-[#2D69B3] focus:ring-[#2D69B3] transition-all"
                  />
                  <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    Lembrar-me
                  </span>
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-[#2D69B3] hover:text-[#122F5A] font-medium transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#3DB8F5] to-[#2D69B3] hover:from-[#2D69B3] hover:to-[#122F5A] text-white border-0 py-4 text-lg shadow-lg shadow-[#2D69B3]/30 hover:shadow-[#2D69B3]/50 transition-all duration-300"
                isLoading={isLoading}
                disabled={!email || !password}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
                {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Não tem uma conta?{' '}
                <Link 
                  href="/signup" 
                  className="text-[#2D69B3] hover:text-[#122F5A] font-semibold transition-colors"
                >
                  Criar conta
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-center"
        >
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Voltar para home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
