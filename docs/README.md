# MatchPulse

Plataforma SaaS para criação de estratégias de futebol e envio de alertas personalizados pelo Telegram, com integração oficial com ESPN para dados em tempo real.

## 🏗️ Arquitetura

Este projeto utiliza uma arquitetura de monorepo com **Turborepo** para gerenciar múltiplos pacotes e aplicações de forma eficiente.

### Estrutura do Projeto

```
matchpulse/
├── apps/
│   ├── web/                 # Next.js 15 Frontend
│   │   ├── src/
│   │   │   ├── app/        # App Router
│   │   │   │   ├── (auth)/ # Login, Signup
│   │   │   │   └── dashboard/ # Dashboard pages
│   │   │   ├── components/ # React Components
│   │   │   └── contexts/   # React Contexts
│   │   └── package.json
│   ├── api/                 # Express Backend
│   │   ├── src/
│   │   │   ├── index.ts    # API Entry Point
│   │   │   └── modules/    # API Modules (auth, strategies, telegram, live-matches)
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   └── worker/              # Background Worker
│       ├── src/
│       │   ├── index.ts    # Worker Entry Point
│       │   └── lib/        # Prisma Client
│       └── package.json
├── packages/
│   ├── ui/                 # Shared UI Components
│   ├── services/           # Shared Services (ESPNProvider, Rule Engine, API Client)
│   ├── types/              # Shared TypeScript Types
│   ├── validators/         # Zod Validators
│   ├── constants/          # League Mappings, Constants
│   ├── utils/              # Shared Utility Functions
│   ├── config/             # Shared Configuration
│   └── logger/             # Shared Logger
├── turbo.json              # Turborepo Configuration
└── package.json            # Root Package
```

### Tecnologias

#### Frontend (apps/web)
- **Framework**: Next.js 15 com App Router
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes**: Componentes customizados (shadcn/ui style)
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **Gráficos**: Recharts
- **Fonte**: Inter (Google Fonts)

#### Backend (apps/api)
- **Framework**: Express.js
- **Linguagem**: TypeScript
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Autenticação**: Firebase Admin SDK
- **Data Provider**: ESPN API (integração oficial)

#### Worker (apps/worker)
- **Framework**: Node.js com TypeScript
- **ESPNProvider**: Provider oficial para dados de futebol em tempo real
- **Rule Engine**: Motor de regras para avaliação de estratégias
- **Telegram Bot**: Bot oficial para envio de notificações
- **Prisma**: Cliente para acesso ao banco de dados
- **Cache**: Sistema de cache com TTLs diferentes (30s a 10min)
- **Retry**: Retry automático com exponential backoff

#### Shared Packages
- **@matchpulse/ui**: Componentes React reutilizáveis
- **@matchpulse/services**: Serviços compartilhados (ESPNProvider, Rule Engine, API Client)
- **@matchpulse/types**: Interfaces TypeScript compartilhadas (FootballProvider, MatchStats)
- **@matchpulse/validators**: Validadores Zod para schemas
- **@matchpulse/constants**: Mapeamento de ligas (32 campeonatos), constantes
- **@matchpulse/utils**: Funções utilitárias compartilhadas
- **@matchpulse/config**: Configurações e constantes compartilhadas
- **@matchpulse/logger**: Sistema de logging compartilhado

### Design System

O design system foi inspirado em plataformas modernas como Vercel, Stripe, Linear, Clerk e Supabase. Recentemente atualizado com o **Clean Premium Redesign** para uma interface mais profissional e de alta performance.

#### Clean Premium Design Principles

**Filosofia de Design:**
- **Clean**: Interface limpa, sem distrações visuais desnecessárias
- **Professional**: Aparência corporativa e confiável
- **High-Performance**: Otimizado para velocidade e usabilidade
- **Zero Shadows**: Remoção completa de sombras para visual mais plano e moderno
- **Generous Spacing**: Espaçamento generoso (p-6 ou p-8) para melhor legibilidade
- **Strict Typography**: Hierarquia tipográfica rigorosamente aplicada

#### Cores (Clean Premium)

**Light Mode (Default):**
- **Background Principal**: `bg-slate-50` - Fundo claro neutro
- **Cards**: `bg-white` - Fundo branco puro
- **Borders**: `border-slate-200` - Bordas sutis
- **Títulos**: `text-slate-950` - Texto quase preto para máximo contraste
- **Texto Secundário**: `text-slate-600` - Texto cinza médio
- **Indicadores Positivos**: `emerald-600` - Verde esmeralda para sucesso
- **Indicadores Negativos**: `rose-600` - Rosa avermelhado para erro
- **Indicadores de Aviso**: `amber-600` - Âmbar para avisos
- **Ícones/Elementos Decorativos**: `bg-slate-200` - Cinza claro

**Dark Mode:**
- **Background Principal**: `bg-slate-950` - Fundo muito escuro
- **Cards**: `bg-slate-900` - Fundo escuro
- **Borders**: `border-slate-800` - Bordas sutis escuras
- **Títulos**: `text-slate-100` - Texto quase branco
- **Texto Secundário**: `text-slate-400` - Texto cinza claro
- **Indicadores Positivos**: `emerald-500` - Verde esmeralda claro
- **Indicadores Negativos**: `rose-500` - Rosa avermelhado claro
- **Indicadores de Aviso**: `amber-500` - Âmbar claro
- **Ícones/Elementos Decorativos**: `bg-slate-700` - Cinza escuro

**Cores da Marca (Preservadas):**
- **Navy**: `#122F5A` - Cor primária escura (brand)
- **Royal Blue**: `#2D69B3` - Cor primária (brand)
- **Sky Blue**: `#3DB8F5` - Cor secundária (brand)

#### Tipografia
- **Fonte Principal**: Inter (Google Fonts)
- **Hierarquia Rigorosa**:
  - Títulos H1: `text-2xl md:text-3xl lg:text-4xl font-bold`
  - Títulos H2: `text-xl md:text-2xl font-semibold`
  - Títulos H3: `text-lg font-semibold`
  - Subtítulos: `text-sm font-semibold`
  - Texto corpo: `text-xs md:text-sm`
  - Texto secundário: `text-xs text-slate-600 dark:text-slate-400`
- **Tracking**: `tracking-tight` para títulos principais

#### Componentes UI
- **Button**: Com variants (default, outline, ghost) e sizes (sm, md, lg)
- **Card**: Com Header, Content, Footer - bordas sutis, sem sombras
- **Input**: Com label, error e icon - bordas sutis, foco com ring
- **Badge**: Com variants (success, danger, warning, info, default)
- **Modal**: Com animações Framer Motion
- **LoadingSpinner**: Animações suaves
- **Toggle**: Switch para alternar configurações

#### Tema
- **Default**: Light mode (alterado de dark mode)
- **Persistência**: LocalStorage para preferência do usuário
- **System Support**: Opção de seguir preferência do sistema
- **Toggle**: Botão no Topbar para alternar entre light/dark mode

## 🚀 Getting Started

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- PostgreSQL (para desenvolvimento)
- Conta Firebase (para autenticação)

### Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd matchpulse
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:

**Frontend (apps/web/.env.local)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Backend (apps/api/.env)**:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/matchpulse
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
```

**Worker (apps/worker/.env)**:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/matchpulse
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
```

4. Execute o Prisma para configurar o banco de dados:
```bash
cd apps/api
npx prisma generate
npx prisma db push
```

### Desenvolvimento

Inicie o frontend, backend e worker em modo de desenvolvimento:

```bash
# Inicia todos (web, api e worker)
npm run dev

# Ou individualmente
npm run dev --filter=web
npm run dev --filter=api
npm run dev --filter=worker
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Worker: Executa em background

### Build

```bash
# Build de todos os pacotes
npm run build

# Build específico
npm run build --filter=web
npm run build --filter=api
```

## 📦 Deploy

### Frontend (Vercel)

O frontend está configurado para deploy no Vercel através do arquivo `vercel.json`.

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático ao fazer push

### Backend (Railway)

O backend está configurado para deploy no Railway através do arquivo `railway.json`.

1. Conecte o repositório ao Railway
2. Adicione um serviço PostgreSQL
3. Configure as variáveis de ambiente
4. Deploy automático ao fazer push

## 📁 Páginas Implementadas

### Públicas
- **Landing Page** (`/`): Hero, Como Funciona, Features, FAQ, CTA
- **Login** (`/login`): Formulário de autenticação com loading state
- **Signup** (`/signup`): Formulário de cadastro com loading state
- **Recuperar Senha** (`/forgot-password`): Recuperação de senha

### Dashboard (Protegidas)
- **Dashboard** (`/dashboard`): Visão geral com estatísticas, gráficos e jogos ao vivo em tempo real
- **Jogos de Hoje** (`/dashboard/today-matches`): Lista de jogos do dia com filtros de liga e status, detalhes em tempo real com estatísticas
- **Criar Estratégia** (`/dashboard/create-strategy`): Configuração de novas estratégias em 5 passos (Tipo, Básico, Ligas/Jogo/Data, Condições, Revisão)
- **Minhas Estratégias** (`/dashboard/my-strategies`): Gerenciamento de estratégias ativas com editar/deletar
- **Editar Estratégia** (`/dashboard/edit-strategy/[id]`): Edição de estratégias existentes
- **Telegram** (`/dashboard/telegram`): Conexão com Telegram bot (@Match2Pulsebot) com código de verificação - painel técnico
- **Configurações** (`/dashboard/settings`): Configurações do usuário (notificações, aparência, segurança, tutorial)
- **Histórico** (`/dashboard/history`): Histórico de match hits e alertas com detalhes de estratégias
- **Biblioteca de Estratégias Virais** (`/dashboard/strategy-library`): Biblioteca de estratégias populares da comunidade (5+ MatchHits)

## 🤖 Telegram Bot

O MatchPulse possui um bot oficial no Telegram para envio de alertas em tempo real.

### Funcionalidades
- **Conexão**: Usuários podem conectar suas contas através de um código de verificação
- **Alertas**: Notificações instantâneas quando estratégias são acionadas
- **Desconexão**: Botão para desconectar o Telegram (idempotente)
- **Formato da Mensagem**:
```
🎯 MATCHPULSE ALERT

📊 Alerta Estratégia: (Nome da estratégia)

🏆 Competição: (Nome da competição)

⚽ Jogo: (Time Casa X Time Visitante)

⏱️ Tempo: (Minuto do alerta)'

📈 Resultado: (Placar)

📐 Escanteios: (Casa - Visitante)

🔥 Detalhes: UM JOGO FOI ENCONTRADO COM SEU FILTRO!!!
```

### Limitação de Alertas
- **1 alerta por jogo por estratégia**: Cada estratégia envia apenas 1 notificação por jogo específico
- **Múltiplas estratégias**: Se o usuário tiver várias estratégias, cada uma pode notificar sobre o mesmo jogo
- **Anti-spam**: Sistema de rastreamento evita duplicação de mensagens

## 📺 ESPN Integration

O MatchPulse integra oficialmente com a ESPN API para fornecer dados de futebol em tempo real.

### Funcionalidades do ESPNProvider
- **11 Endpoints Validados**: Scoreboard, Summary, Standings, Teams, Players, Injuries, Calendar, etc.
- **Sistema de Cache**: TTLs diferentes para cada tipo de dado (30s a 10min)
- **Retry Automático**: Exponential backoff com 3 tentativas
- **Normalização de Dados**: Interface `FootballProvider` padronizada com modelo `MatchStats`
- **Mapeamento de Ligas**: 32 campeonatos mapeados com slugs (bra.1, eng.1, esp.1, etc.)

### Ligas Suportadas
- Brasil: Campeonato Brasileiro (bra.1)
- Inglaterra: Premier League (eng.1), Championship (eng.2)
- Espanha: La Liga (esp.1), La Liga 2 (esp.2)
- Itália: Serie A (ita.1), Serie B (ita.2)
- Alemanha: Bundesliga (ger.1), 2. Bundesliga (ger.2)
- França: Ligue 1 (fra.1), Ligue 2 (fra.2)
- Portugal: Primeira Liga (por.1)
- Holanda: Eredivisie (ned.1)
- Argentina: Liga Profesional (arg.1)
- México: Liga MX (mex.1)
- E mais 20 ligas internacionais

### Worker com ESPN
- **Verificação em Tempo Real**: Busca partidas ao vivo a cada 30 segundos
- **Filtragem por Ligas**: Apenas monitora ligas configuradas nas estratégias
- **Avaliação de Estratégias**: Rule Engine avalia condições contra dados normalizados da ESPN
- **Notificações**: Envio de alertas via Telegram quando estratégias são acionadas

### API Endpoints
- `GET /api/v1/live-matches`: Retorna jogos ao vivo da ESPN
- `GET /api/v1/live-matches?league=bra.1`: Filtra por liga específica

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia todos os apps em dev
npm run dev:web          # Inicia apenas o web
npm run dev:api          # Inicia apenas a api

# Build
npm run build            # Build de todos os apps
npm run build:web        # Build apenas do web
npm run build:api        # Build apenas da api

# Lint
npm run lint             # Lint de todos os pacotes
npm run lint:web         # Lint apenas do web
npm run lint:api         # Lint apenas da api

# Limpeza
npm run clean            # Remove node_modules e dist
```

## 🎯 Funcionalidades Implementadas

### ✅ Concluídas

**Autenticação & Segurança:**
1. **Firebase Authentication**: Autenticação completa com Firebase (login, signup, recuperação de senha)
2. **Protected Routes**: Middleware de proteção para rotas do dashboard
3. **Session Management**: Gerenciamento de sessão com Firebase Admin SDK

**Integração de Dados:**
4. **ESPN Integration**: Integração oficial com ESPN API para dados em tempo real
5. **11 Endpoints Validados**: Scoreboard, Summary, Standings, Teams, Players, Injuries, Calendar, etc.
6. **Cache System**: Sistema de cache com TTLs diferentes (30s a 10min)
7. **Retry Logic**: Retry automático com exponential backoff (3 tentativas)
8. **Data Normalization**: Interface `FootballProvider` padronizada com modelo `MatchStats`
9. **League Mapping**: 32 campeonatos mapeados com slugs (bra.1, eng.1, esp.1, etc.)

**Telegram & Alertas:**
10. **Telegram Bot**: Bot para envio de alertas com código de verificação
11. **Alerts System**: Sistema completo de alertas com anti-spam
12. **Idempotent Operations**: Operações idempotentes (desconectar Telegram)
13. **Alert Limitation**: 1 alerta por jogo por estratégia para evitar spam
14. **Rich Message Format**: Mensagens formatadas com emojis e detalhes completos

**Estratégias & Rule Engine:**
15. **Rule Engine**: Motor de regras para avaliação de estratégias
16. **Strategy Creation**: Criação de estratégias em 5 passos (Tipo, Básico, Ligas/Jogo/Data, Condições, Revisão)
17. **Strategy Management**: Gerenciamento completo de estratégias (criar, editar, deletar)
18. **League Filtering**: Filtragem de estratégias por 32 campeonatos diferentes
19. **Strategy Types**: Suporte a 3 tipos de estratégias (general, specific, daily)
20. **Condition Builder**: Builder visual para criar condições complexas
21. **Strategy Library**: Biblioteca de estratégias virais da comunidade (5+ MatchHits)

**Dashboard & UI:**
22. **Dashboard**: Dashboard com estatísticas, gráficos e jogos ao vivo
23. **Live Matches**: Monitoramento de jogos ao vivo em tempo real
24. **Today Matches**: Lista de jogos do dia com filtros e detalhes
25. **Auto-refresh**: Auto-refresh silencioso do dashboard (15s)
26. **Loading States**: Telas de carregamento bonitas para melhor UX
27. **Clean Premium Design**: Redesign completo com light mode default, zero shadows, bordas sutis
28. **Responsive Design**: Interface responsiva para desktop e mobile
29. **Dark Mode**: Suporte completo a dark mode com persistência
30. **Animations**: Animações suaves com Framer Motion
31. **Charts**: Gráficos interativos com Recharts

**Configurações & UX:**
32. **Settings Page**: Configurações do usuário (notificações, aparência, segurança, tutorial)
33. **Tutorial System**: Tutorial interativo com opção de reiniciar
34. **History Page**: Histórico de match hits e alertas
35. **Technical Panel**: Painel técnico para configuração do Telegram

### 🔜 Em Desenvolvimento
1. **Admin Dashboard**: Dashboard administrativo para gestão de usuários
2. **Advanced Analytics**: Análises avançadas de performance de estratégias
3. **Multi-language Support**: Suporte a múltiplos idiomas (i18n)
4. **Mobile App**: Aplicativo mobile nativo (React Native)
5. **Push Notifications**: Notificações push no navegador
6. **Email Notifications**: Sistema de notificações por email
7. **Strategy Sharing**: Compartilhamento de estratégias entre usuários
8. **Performance Metrics**: Métricas detalhadas de ROI e win rate

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.

## 👥 Suporte

Para suporte, entre em contato através do email: support@matchpulse.com
