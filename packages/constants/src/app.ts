// Application Constants

// Strategy Limits
export const MAX_STRATEGIES_FREE = 1;
export const MAX_STRATEGIES_PREMIUM = 10;

// Telegram
export const TELEGRAM_CODE_EXPIRATION = 5 * 60 * 1000; // 5 minutes in milliseconds
export const TELEGRAM_CODE_LENGTH = 6;

// Time
export const DEFAULT_TIMEZONE = 'America/Sao_Paulo';
export const LIVE_MATCH_UPDATE_INTERVAL = 30 * 1000; // 30 seconds

// Rate Limiting
export const MAX_REQUESTS_PER_MINUTE = 60;
export const MAX_REQUESTS_PER_HOUR = 1000;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Session
export const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

// Notification
export const MAX_NOTIFICATION_HISTORY_DAYS = 30;

// Logs
export const LOG_RETENTION_DAYS = 90;
