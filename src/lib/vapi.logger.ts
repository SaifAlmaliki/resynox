/**
 * VAPI Logger - Enhanced logging utilities for VAPI integration
 * This provides more detailed logging for debugging VAPI-related issues
 */

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// Logger configuration
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  logToStorage: boolean;
  maxStorageLogs: number;
}

// Default configuration
const defaultConfig: LoggerConfig = {
  minLevel: LogLevel.INFO,
  enableConsole: true,
  logToStorage: true,
  maxStorageLogs: 100
};

// Current configuration
let config: LoggerConfig = { ...defaultConfig };

// Storage key for logs
const STORAGE_KEY = 'vapi_debug_logs';

/**
 * Configure the logger
 */
export function configureLogger(newConfig: Partial<LoggerConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Get the current logger configuration
 */
export function getLoggerConfig(): LoggerConfig {
  return { ...config };
}

/**
 * Format a log message with timestamp and metadata
 */
function formatLogMessage(level: LogLevel, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';
  return `[${timestamp}] [VAPI] [${level}] ${message}${dataStr}`;
}

/**
 * Log a message at the specified level
 */
function log(level: LogLevel, message: string, data?: unknown): void {
  // Check if we should log at this level
  const levelPriority = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3
  };

  if (levelPriority[level] < levelPriority[config.minLevel]) {
    return;
  }

  const formattedMessage = formatLogMessage(level, message, data);

  // Log to console if enabled
  if (config.enableConsole) {
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
    }
  }

  // Store in localStorage if enabled and in browser environment
  if (config.logToStorage && typeof window !== 'undefined') {
    try {
      const storedLogs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const newLog = {
        timestamp: new Date().toISOString(),
        level,
        message,
        data
      };

      // Add new log and trim if needed
      storedLogs.push(newLog);
      if (storedLogs.length > config.maxStorageLogs) {
        storedLogs.splice(0, storedLogs.length - config.maxStorageLogs);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedLogs));
    } catch (error) {
      console.error('Failed to store log in localStorage:', error);
    }
  }
}

/**
 * Get all stored logs
 */
// Define a type for log entries
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

export function getStoredLogs(): LogEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (error) {
    console.error('Failed to retrieve logs from localStorage:', error);
    return [];
  }
}

/**
 * Clear all stored logs
 */
export function clearStoredLogs(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear logs from localStorage:', error);
  }
}

// Export log functions
export const vapiLogger = {
  debug: (message: string, data?: unknown) => log(LogLevel.DEBUG, message, data),
  info: (message: string, data?: unknown) => log(LogLevel.INFO, message, data),
  warn: (message: string, data?: unknown) => log(LogLevel.WARN, message, data),
  error: (message: string, data?: unknown) => log(LogLevel.ERROR, message, data),
  getStoredLogs,
  clearStoredLogs,
  configure: configureLogger,
  getConfig: getLoggerConfig
};

export default vapiLogger;
