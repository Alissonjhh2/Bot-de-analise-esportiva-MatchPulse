'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@matchpulse/ui';
import { Input } from '@matchpulse/ui';
import { Card, CardContent, CardHeader } from '@matchpulse/ui';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement Firebase password reset
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#122F5A] via-[#2D69B3] to-[#3DB8F5] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center pb-8">
            <Link
              href="/login"
              className="absolute left-4 top-4 text-gray-600 hover:text-[#2D69B3]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            {!isSent ? (
              <>
                <h1 className="text-3xl font-bold text-[#122F5A]">Recuperar senha</h1>
                <p className="text-gray-600 mt-2">
                  Enviaremos instruções para seu email
                </p>
              </>
            ) : (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-[#122F5A]">Email enviado!</h1>
                <p className="text-gray-600 mt-2">
                  Verifique sua caixa de entrada
                </p>
              </>
            )}
          </CardHeader>
          <CardContent>
            {!isSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  icon={<Mail className="w-5 h-5 text-gray-400" />}
                />
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={!email}
                >
                  Enviar instruções
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Enviamos um email para <strong>{email}</strong> com instruções
                  para redefinir sua senha.
                </p>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Voltar para o login
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
