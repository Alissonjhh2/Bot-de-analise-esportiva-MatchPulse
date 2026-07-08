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

O design system foi inspirado em plataformas modernas como Vercel, Stripe, Linear, Clerk e Supabase.

#### Cores
- **Navy**: `#122F5A` - Cor primária escura
- **Royal Blue**: `#2D69B3` - Cor primária
- **Sky Blue**: `#3DB8F5` - Cor secundária
- **Crimson**: `#E6393F` - Cor de erro/atenção
- **Red**: `#DC2626` - Cor de perigo
- **White**: `#FFFFFF` - Cor de fundo clara
- **Pale Gray**: `#F3F4F6` - Cor de fundo secundária

#### Tipografia
- **Fonte Principal**: Inter
- **Tamanhos**: Escala tipográfica consistente

#### Componentes UI
- Button (com variants e sizes)
- Card (com Header, Content, Footer)
- Input (com label, error e icon)
- Badge (com variants)
- Modal (com animações)
- LoadingSpinner

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
- **Criar Estratégia** (`/dashboard/create-strategy`): Configuração de novas estratégias em 4 passos (Básico, Ligas, Condições, Revisão)
- **Minhas Estratégias** (`/dashboard/my-strategies`): Gerenciamento de estratégias ativas com editar/deletar
- **Editar Estratégia** (`/dashboard/edit-strategy/[id]`): Edição de estratégias existentes
- **Telegram** (`/dashboard/telegram`): Conexão com Telegram bot (@Match2Pulsebot) com código de verificação
- **Configurações** (`/dashboard/settings`): Configurações do usuário
- **Histórico** (`/dashboard/history`): Histórico de match hits e alertas
- **Biblioteca de Estratégias** (`/dashboard/strategy-library`): Biblioteca de estratégias predefinidas

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
1. **Firebase Authentication**: Autenticação completa com Firebase
2. **ESPN Integration**: Integração oficial com ESPN API para dados em tempo real
3. **Telegram Bot**: Bot para envio de alertas com código de verificação
4. **Rule Engine**: Motor de regras para avaliação de estratégias
5. **Alerts System**: Sistema completo de alertas com anti-spam
6. **Dashboard**: Dashboard com estatísticas, gráficos e jogos ao vivo
7. **Strategy Creation**: Criação de estratégias em 4 passos com seleção de ligas
8. **Strategy Management**: Gerenciamento completo de estratégias (criar, editar, deletar)
9. **League Filtering**: Filtragem de estratégias por 32 campeonatos diferentes
10. **Live Matches**: Monitoramento de jogos ao vivo em tempo real
11. **Auto-refresh**: Auto-refresh silencioso do dashboard (15s)
12. **Loading States**: Telas de carregamento bonitas para melhor UX
13. **Idempotent Operations**: Operações idempotentes (desconectar Telegram)
14. **Cache System**: Sistema de cache com TTLs diferentes
15. **Retry Logic**: Retry automático com exponential backoff

### 🔜 Em Desenvolvimento
1. **Tutorial Interativo**: Tutorial de 4 passos com modal de skip
2. **Admin Dashboard**: Dashboard administrativo
3. **Strategy Library**: Biblioteca completa de estratégias predefinidas
4. **Advanced Analytics**: Análises avançadas de performance de estratégias
5. **Multi-language Support**: Suporte a múltiplos idiomas
6. **Mobile App**: Aplicativo mobile nativo

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.

## 👥 Suporte

Para suporte, entre em contato através do email: support@matchpulse.com
