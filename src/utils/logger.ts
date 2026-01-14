import { sanitizeLogData } from './sanitization.util';

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const logLevels = { error: 0, warn: 1, info: 2, debug: 3 };

const shouldLog = (level: keyof typeof logLevels): boolean => {
    const currentLevel = logLevels[LOG_LEVEL as keyof typeof logLevels] ?? logLevels.info;
    return logLevels[level] <= currentLevel;
};

export const logger = {
    info: (message: string, data?: any) => {
        if (shouldLog('info')) {
            const sanitizedData = data ? sanitizeLogData(data) : '';
            console.log(`[${new Date().toISOString()}] INFO - ${message}`, sanitizedData);
        }
    },
    warn: (message: string, data?: any) => {
        if (shouldLog('warn')) {
            const sanitizedData = data ? sanitizeLogData(data) : '';
            console.warn(`[${new Date().toISOString()}] WARN - ${message}`, sanitizedData);
        }
    },
    error: (message: string, data?: any) => {
        if (shouldLog('error')) {
            const sanitizedData = data ? sanitizeLogData(data) : '';
            console.error(`[${new Date().toISOString()}] ERROR - ${message}`, sanitizedData);
        }
    },
    debug: (message: string, data?: any) => {
        if (shouldLog('debug')) {
            const sanitizedData = data ? sanitizeLogData(data) : '';
            console.log(`[${new Date().toISOString()}] DEBUG - ${message}`, sanitizedData);
        }
    }
};
