// User Types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  user: User;
  token: string;
}

// Alert Types
export interface Alert {
  id: string;
  userId: string;
  name: string;
  strategyId: string;
  conditions: AlertCondition[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';
  value: string | number | boolean;
}

// Strategy Types
export interface Strategy {
  id: string;
  name: string;
  description: string;
  category: string;
  popularity: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  leagues: string[]; // Array of league slugs
}

// Telegram Types
export interface TelegramConnection {
  id: string;
  userId: string;
  chatId: string;
  username?: string;
  isConnected: boolean;
  connectedAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Dashboard Types
export interface DashboardStats {
  activeAlerts: number;
  alertsSentToday: number;
  botConnected: boolean;
  gamesMonitored: number;
}

export interface PopularAlert {
  strategyName: string;
  alertCount: number;
  trend: 'up' | 'down' | 'stable';
}

// History Types
export interface AlertHistory {
  id: string;
  alertId: string;
  alertName: string;
  strategyName: string;
  sentAt: Date;
  status: 'sent' | 'failed';
  gameInfo?: {
    homeTeam: string;
    awayTeam: string;
    league: string;
  };
}

// Export provider types
export * from './provider';
