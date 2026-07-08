import { LogLevel, LogEntry } from './types';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private minLevel: LogLevel = 'info';

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.minLevel];
  }

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context } = entry;
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp.toISOString()}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
    };

    if (this.isDevelopment) {
      console.log(this.formatLog(entry));
    } else {
      // In production, send to logging service
      this.sendToRemote(entry);
    }
  }

  private sendToRemote(entry: LogEntry): void {
    // TODO: Implement remote logging (e.g., Sentry, LogRocket, Datadog)
    // For now, just console.log in production
    console.log(this.formatLog(entry));
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error | Record<string, unknown>): void {
    const context = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error;
    this.log('error', message, context);
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }
}

export const logger = new Logger();
