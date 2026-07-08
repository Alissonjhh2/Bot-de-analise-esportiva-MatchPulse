export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  CREATE_ALERT: '/dashboard/create-alert',
  MY_ALERTS: '/dashboard/my-alerts',
  STRATEGY_LIBRARY: '/dashboard/strategy-library',
  TELEGRAM: '/dashboard/telegram',
  HISTORY: '/dashboard/history',
  SETTINGS: '/dashboard/settings',
  PROFILE: '/dashboard/profile',
} as const;

export type Route = typeof ROUTES[keyof typeof ROUTES];
