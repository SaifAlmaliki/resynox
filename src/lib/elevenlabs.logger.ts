/**
 * ElevenLabs Logger - Centralized logging for ElevenLabs integration
 * Provides structured logging with context for debugging and monitoring
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

class ElevenLabsLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[ElevenLabs ${level.toUpperCase()}] ${timestamp}`;
    
    if (context) {
      return `${prefix} ${message} | Context: ${JSON.stringify(context, null, 2)}`;
    }
    
    return `${prefix} ${message}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage(level, message, context);
    
    switch (level) {
      case 'error':
        console.error(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formattedMessage);
        }
        break;
      default:
        console.log(formattedMessage);
    }
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  // ElevenLabs-specific logging methods
  conversationStart(context: LogContext): void {
    this.info('ElevenLabs conversation started', context);
  }

  conversationEnd(context: LogContext): void {
    this.info('ElevenLabs conversation ended', context);
  }

  conversationError(error: any, context?: LogContext): void {
    this.error('ElevenLabs conversation error', { 
      error: error?.message || error, 
      ...context 
    });
  }

  apiCall(endpoint: string, context?: LogContext): void {
    this.debug(`ElevenLabs API call: ${endpoint}`, context);
  }

  performance(metric: string, value: number, context?: LogContext): void {
    this.info(`ElevenLabs performance: ${metric} = ${value}ms`, context);
  }
}

// Export singleton instance
export const elevenLabsLogger = new ElevenLabsLogger(); 