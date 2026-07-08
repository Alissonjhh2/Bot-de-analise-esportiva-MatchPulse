'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@matchpulse/ui';
import { ArrowRight, Zap, Shield, BarChart3, MessageSquare, CheckCircle, ChevronDown, TrendingUp, Globe, Clock, Sparkles, Play } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { mockFaqs } from '@matchpulse/constants';

export const LandingPage = () => {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -200]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#122F5A] to-[#1e3a5f]" />
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        {/* Floating Elements */}
        <motion.div style={{ y: y1 }} className="absolute top-20 left-10 w-72 h-72 bg-[#2D69B3]/20 rounded-full blur-3xl" />
        <motion.div style={{ y: y2 }} className="absolute bottom-20 right-10 w-96 h-96 bg-[#3DB8F5]/20 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-4 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8"
            >
              <Sparkles className="w-4 h-4 text-[#3DB8F5]" />
              <span className="text-sm text-white/90 font-medium">
                Integração Oficial com ESPN • Dados em Tempo Real
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Estratégias de Futebol
              <span className="block bg-gradient-to-r from-[#3DB8F5] to-[#2D69B3] bg-clip-text text-transparent">
                Inteligentes
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Crie alertas personalizados com dados reais da ESPN e receba notificações instantâneas no seu Telegram
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-[#3DB8F5] to-[#2D69B3] text-white hover:from-[#2D69B3] hover:to-[#122F5A] border-0 px-8 py-6 text-lg shadow-2xl shadow-[#2D69B3]/30 hover:shadow-[#2D69B3]/50 transition-all duration-300"
                >
                  Começar Gratuitamente
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white/5 backdrop-blur-sm border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg transition-all duration-300"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Ver Demo
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              {[
                { value: '32+', label: 'Ligas' },
                { value: '100%', label: 'Gratuito' },
                { value: '24/7', label: 'Monitoramento' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-white/50 rounded-full"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* How it Works */}
      <section className="py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Três passos simples para começar
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { 
                icon: Zap, 
                title: 'Crie Estratégias', 
                desc: 'Defina suas condições personalizadas para alertas com dados reais da ESPN',
                color: 'from-[#3DB8F5] to-[#2D69B3]'
              },
              { 
                icon: Globe, 
                title: 'Monitore Jogos', 
                desc: 'Acompanhe múltiplos jogos de 32 ligas em tempo real',
                color: 'from-[#2D69B3] to-[#122F5A]'
              },
              { 
                icon: MessageSquare, 
                title: 'Receba Alertas', 
                desc: 'Notificações instantâneas no seu Telegram quando estratégias são acionadas',
                color: 'from-[#122F5A] to-[#0a1628]'
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -8 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300" />
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800">
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                  <div className="absolute top-4 right-4 w-8 h-8 bg-[#2D69B3]/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-[#2D69B3]">{index + 1}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Recursos Poderosos
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Tudo que você precisa para estratégias vencedoras
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {[
              { icon: TrendingUp, title: 'Análise em Tempo Real', desc: 'Dados atualizados instantaneamente da ESPN', highlight: true },
              { icon: Shield, title: 'Estratégias Personalizadas', desc: 'Crie regras complexas facilmente' },
              { icon: MessageSquare, title: 'Integração Telegram', desc: 'Alertas direto no seu celular' },
              { icon: Clock, title: 'Notificações Instantâneas', desc: 'Nunca perca uma oportunidade' },
              { icon: CheckCircle, title: 'Histórico Completo', desc: 'Acompanhe todos os seus alertas' },
              { icon: BarChart3, title: 'Estatísticas Detalhadas', desc: 'Métricas para melhorar suas estratégias' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`relative group p-8 rounded-2xl border transition-all duration-300 ${
                  feature.highlight 
                    ? 'bg-gradient-to-br from-[#2D69B3] to-[#122F5A] border-transparent shadow-xl shadow-[#2D69B3]/20' 
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-[#2D69B3]/30 hover:shadow-lg'
                }`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                  feature.highlight 
                    ? 'bg-white/20' 
                    : 'bg-[#2D69B3]/10 group-hover:bg-[#2D69B3]/20'
                }`}>
                  <feature.icon className={`w-7 h-7 ${
                    feature.highlight ? 'text-white' : 'text-[#2D69B3]'
                  }`} />
                </div>
                <h3 className={`text-xl font-bold mb-3 ${
                  feature.highlight ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}>
                  {feature.title}
                </h3>
                <p className={`leading-relaxed ${
                  feature.highlight ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {feature.desc}
                </p>
                {feature.highlight && (
                  <div className="absolute top-4 right-4">
                    <Sparkles className="w-5 h-5 text-white/60" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Tire suas dúvidas sobre o MatchPulse
            </p>
          </motion.div>
          <div className="max-w-4xl mx-auto space-y-4">
            {mockFaqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-[#2D69B3]/30 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <span className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        faqOpen === index 
                          ? 'bg-[#2D69B3] text-white rotate-180' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-[#2D69B3]/10'
                      }`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: faqOpen === index ? 'auto' : 0,
                    opacity: faqOpen === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{faq.answer}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 overflow-hidden">
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
        
        <div className="relative container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8"
            >
              <Sparkles className="w-5 h-5 text-[#3DB8F5]" />
              <span className="text-base text-white/90 font-medium">
                Comece gratuitamente hoje
              </span>
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Pronto para Começar?
            </h2>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
              Crie sua conta gratuita e comece a criar estratégias inteligentes com dados reais da ESPN
            </p>
            <Link href="/signup">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-[#3DB8F5] to-[#2D69B3] text-white hover:from-[#2D69B3] hover:to-[#122F5A] border-0 px-10 py-7 text-xl shadow-2xl shadow-[#2D69B3]/30 hover:shadow-[#2D69B3]/50 transition-all duration-300 hover:scale-105"
              >
                Criar Conta Gratuita
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-12 flex flex-wrap justify-center gap-8 text-white/60"
            >
              {[
                'Sem cartão de crédito',
                'Cancelamento a qualquer momento',
                'Suporte 24/7'
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#3DB8F5]" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-400 text-sm">
            <p className="mb-2">© 2026 MatchPulse. Todos os direitos reservados.</p>
            <p className="text-xs">Dados fornecidos pela ESPN API</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
