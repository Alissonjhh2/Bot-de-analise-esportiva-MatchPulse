// Application Configuration
export const config = {
  app: {
    name: 'MatchPulse',
    description: 'Plataforma SaaS para criação de estratégias de futebol e alertas',
    version: '0.1.0',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://matchpulse-api-gc00.onrender.com/api/v1',
    timeout: 30000,
  },
  
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  },
  
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  },
  
  features: {
    tutorial: {
      enabled: true,
      steps: 4,
    },
    darkMode: {
      enabled: true,
      default: 'system',
    },
  },
};

// Color Palette
export const colors = {
  primary: {
    dark: '#122F5A',
    royal: '#2D69B3',
    sky: '#3DB8F5',
  },
  alert: {
    crimson: '#A11E2D',
    red: '#E6393F',
  },
  neutral: {
    white: '#FFFFFF',
    pale: '#F5F7FA',
  },
};

// Tutorial Steps
export const tutorialSteps = [
  {
    id: 1,
    title: 'Conhecer Dashboard',
    description: 'Explore o dashboard principal para ver suas estatísticas e estratégias ativas.',
    icon: 'LayoutDashboard',
  },
  {
    id: 2,
    title: 'Criar Primeira Estratégia',
    description: 'Aprenda a criar estratégias personalizadas baseadas em regras de futebol.',
    icon: 'PlusCircle',
  },
  {
    id: 3,
    title: 'Conectar Telegram',
    description: 'Conecte seu Telegram para receber alertas em tempo real.',
    icon: 'MessageSquare',
  },
  {
    id: 4,
    title: 'Receber Alertas',
    description: 'Comece a receber alertas personalizados diretamente no seu Telegram.',
    icon: 'Bell',
  },
];
