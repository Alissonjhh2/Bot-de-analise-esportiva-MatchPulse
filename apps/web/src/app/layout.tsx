import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { I18nProvider } from '@matchpulse/i18n';
import PageTransition from '@/components/PageTransition';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'MatchPulse - Estratégias de Futebol e Alertas',
  description: 'Plataforma SaaS para criação de estratégias de futebol e envio de alertas personalizados pelo Telegram',
  icons: {
    icon: '/favicon.jpeg',
    apple: '/favicon.jpeg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-inter antialiased`}>
        <I18nProvider>
          <ThemeProvider>
            <AuthProvider>
              <PageTransition>
                {children}
              </PageTransition>
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
