class Logger {
    isDevelopment = process.env.NODE_ENV === 'development';
    minLevel = 'info';
    shouldLog(level) {
        const levels = { debug: 0, info: 1, warn: 2, error: 3 };
        return levels[level] >= levels[this.minLevel];
    }
    formatLog(entry) {
        const { level, message, timestamp, context } = entry;
        const contextStr = context ? ` ${JSON.stringify(context)}` : '';
        return `[${timestamp.toISOString()}] [${level.toUpperCase()}] ${message}${contextStr}`;
    }
    log(level, message, context) {
        if (!this.shouldLog(level))
            return;
        const entry = {
            level,
            message,
            timestamp: new Date(),
            context,
        };
        if (this.isDevelopment) {
            console.log(this.formatLog(entry));
        }
        else {
            // In production, send to logging service
            this.sendToRemote(entry);
        }
    }
    sendToRemote(entry) {
        // TODO: Implement remote logging (e.g., Sentry, LogRocket, Datadog)
        // For now, just console.log in production
        console.log(this.formatLog(entry));
    }
    debug(message, context) {
        this.log('debug', message, context);
    }
    info(message, context) {
        this.log('info', message, context);
    }
    warn(message, context) {
        this.log('warn', message, context);
    }
    error(message, error) {
        const context = error instanceof Error
            ? { message: error.message, stack: error.stack }
            : error;
        this.log('error', message, context);
    }
    setMinLevel(level) {
        this.minLevel = level;
    }
}
export const logger = new Logger();
