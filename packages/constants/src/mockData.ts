import { DashboardStats, PopularAlert, AlertHistory } from '@matchpulse/types';

export const mockDashboardStats: DashboardStats = {
  activeAlerts: 12,
  alertsSentToday: 47,
  botConnected: true,
  gamesMonitored: 23,
};

export const mockPopularAlerts: PopularAlert[] = [
  { strategyName: 'Over 2.5 Gols', alertCount: 234, trend: 'up' },
  { strategyName: 'Ambas Marcam', alertCount: 189, trend: 'up' },
  { strategyName: 'Handicap +1', alertCount: 156, trend: 'stable' },
  { strategyName: 'Under 3.5 Gols', alertCount: 143, trend: 'down' },
  { strategyName: 'Draw No Bet', alertCount: 98, trend: 'stable' },
];

export const mockWeeklyData = [
  { day: 'Seg', alerts: 45, success: 38 },
  { day: 'Ter', alerts: 52, success: 41 },
  { day: 'Qua', alerts: 38, success: 32 },
  { day: 'Qui', alerts: 61, success: 49 },
  { day: 'Sex', alerts: 55, success: 44 },
  { day: 'Sáb', alerts: 72, success: 58 },
  { day: 'Dom', alerts: 68, success: 55 },
];

export const mockMonthlyData = [
  { month: 'Jan', alerts: 320 },
  { month: 'Fev', alerts: 380 },
  { month: 'Mar', alerts: 450 },
  { month: 'Abr', alerts: 410 },
  { month: 'Mai', alerts: 520 },
  { month: 'Jun', alerts: 580 },
];

export const mockAlertHistory: AlertHistory[] = [
  {
    id: '1',
    alertId: 'alert-1',
    alertName: 'Over 2.5 Gols',
    strategyName: 'Over 2.5',
    sentAt: new Date('2024-01-15T10:30:00'),
    status: 'sent',
    gameInfo: {
      homeTeam: 'Flamengo',
      awayTeam: 'Vasco',
      league: 'Brasileirão',
    },
  },
  {
    id: '2',
    alertId: 'alert-2',
    alertName: 'Ambas Marcam',
    strategyName: 'BTTS',
    sentAt: new Date('2024-01-15T11:45:00'),
    status: 'failed',
    gameInfo: {
      homeTeam: 'Barcelona',
      awayTeam: 'Real Madrid',
      league: 'La Liga',
    },
  },
];

export const mockAlerts = [
  { id: '1', name: 'Over 2.5 Gols', strategy: 'Over 2.5', isActive: true, createdAt: '2024-01-15' },
  { id: '2', name: 'Ambas Marcam', strategy: 'BTTS', isActive: true, createdAt: '2024-01-18' },
  { id: '3', name: 'Handicap +1', strategy: 'Handicap', isActive: false, createdAt: '2024-01-20' },
];

export const mockStrategies = [
  { id: '1', name: 'Over 2.5 Gols', description: 'Apostar em mais de 2.5 gols no jogo', category: 'Gols', popularity: 95 },
  { id: '2', name: 'Ambas Marcam', description: 'Ambas equipes marcam no jogo', category: 'Gols', popularity: 88 },
  { id: '3', name: 'Handicap +1', description: 'Equipe vence ou empata com vantagem', category: 'Handicap', popularity: 72 },
  { id: '4', name: 'Under 3.5 Gols', description: 'Menos de 3.5 gols no jogo', category: 'Gols', popularity: 65 },
  { id: '5', name: 'Draw No Bet', description: 'Empate devolve aposta', category: 'Segurança', popularity: 45 },
];

export const mockFaqs = [
  {
    question: 'Como funciona o MatchPulse?',
    answer: 'O MatchPulse permite criar estratégias personalizadas de futebol e receber alertas em tempo real no seu Telegram quando as condições são atendidas.',
  },
  {
    question: 'Preciso pagar para usar?',
    answer: 'Oferecemos planos gratuitos e premium. O plano gratuito inclui alertas básicos, enquanto o premium oferece recursos avançados.',
  },
  {
    question: 'Como conecto meu Telegram?',
    answer: 'Após criar sua conta, você pode conectar seu Telegram através das configurações. É um processo simples que leva menos de 1 minuto.',
  },
  {
    question: 'Quais ligas são suportadas?',
    answer: 'Atualmente suportamos as principais ligas mundiais, incluindo Premier League, La Liga, Serie A, Bundesliga, Brasileirão e muitas outras.',
  },
];
