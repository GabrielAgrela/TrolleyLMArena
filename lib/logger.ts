/**
 * Lightweight structured logger for production debugging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogContext = Record<string, unknown>;

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};

// Set minimum log level based on environment
const MIN_LEVEL = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

function shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function formatLog(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();

    // JSON format in production for log aggregation
    if (process.env.NODE_ENV === 'production') {
        return JSON.stringify({
            timestamp,
            level,
            message,
            ...context
        });
    }

    // Pretty format for development
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
}

export const logger = {
    debug(message: string, context?: LogContext) {
        if (shouldLog('debug')) {
            console.debug(formatLog('debug', message, context));
        }
    },

    info(message: string, context?: LogContext) {
        if (shouldLog('info')) {
            console.info(formatLog('info', message, context));
        }
    },

    warn(message: string, context?: LogContext) {
        if (shouldLog('warn')) {
            console.warn(formatLog('warn', message, context));
        }
    },

    error(message: string, context?: LogContext) {
        if (shouldLog('error')) {
            console.error(formatLog('error', message, context));
        }
    },

    /**
     * Log an API request
     */
    request(method: string, path: string, context?: LogContext) {
        this.info(`${method} ${path}`, { type: 'request', ...context });
    },

    /**
     * Log a database operation
     */
    db(operation: string, model: string, context?: LogContext) {
        this.debug(`DB ${operation} on ${model}`, { type: 'database', ...context });
    },

    /**
     * Log an LLM operation
     */
    llm(operation: string, modelId: string, context?: LogContext) {
        this.info(`LLM ${operation}: ${modelId}`, { type: 'llm', ...context });
    }
};

export default logger;
