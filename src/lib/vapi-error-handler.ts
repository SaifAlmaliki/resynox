import { VapiError } from "@/types/interview";

export enum VapiErrorType {
  NETWORK = "NETWORK",
  AUTHENTICATION = "AUTHENTICATION", 
  PERMISSION = "PERMISSION",
  RATE_LIMIT = "RATE_LIMIT",
  ASSISTANT_CONFIG = "ASSISTANT_CONFIG",
  AUDIO = "AUDIO",
  TIMEOUT = "TIMEOUT",
  UNKNOWN = "UNKNOWN"
}

export interface ErrorRecoveryStrategy {
  shouldRetry: boolean;
  retryDelay: number;
  maxRetries: number;
  userAction?: string;
  fallbackAction?: () => Promise<void>;
}

class VapiErrorHandler {
  private errorStrategies: Map<VapiErrorType, ErrorRecoveryStrategy> = new Map([
    [VapiErrorType.NETWORK, {
      shouldRetry: true,
      retryDelay: 2000,
      maxRetries: 3,
      userAction: "Check your internet connection and try again."
    }],
    [VapiErrorType.AUTHENTICATION, {
      shouldRetry: false,
      retryDelay: 0,
      maxRetries: 0,
      userAction: "Please refresh the page and try again. If the problem persists, contact support."
    }],
    [VapiErrorType.PERMISSION, {
      shouldRetry: false,
      retryDelay: 0,
      maxRetries: 0,
      userAction: "Please allow microphone access in your browser settings and refresh the page."
    }],
    [VapiErrorType.RATE_LIMIT, {
      shouldRetry: true,
      retryDelay: 5000,
      maxRetries: 2,
      userAction: "Please wait a moment before trying again."
    }],
    [VapiErrorType.ASSISTANT_CONFIG, {
      shouldRetry: false,
      retryDelay: 0,
      maxRetries: 0,
      userAction: "There's a configuration issue. Please contact support."
    }],
    [VapiErrorType.AUDIO, {
      shouldRetry: true,
      retryDelay: 1000,
      maxRetries: 2,
      userAction: "Check your microphone and audio settings."
    }],
    [VapiErrorType.TIMEOUT, {
      shouldRetry: true,
      retryDelay: 3000,
      maxRetries: 2,
      userAction: "The connection timed out. Please try again."
    }],
    [VapiErrorType.UNKNOWN, {
      shouldRetry: true,
      retryDelay: 2000,
      maxRetries: 1,
      userAction: "An unexpected error occurred. Please try again."
    }]
  ]);

  classifyError(error: any): VapiErrorType {
    if (!error) return VapiErrorType.UNKNOWN;

    const errorMessage = this.extractErrorMessage(error);
    const errorCode = this.extractErrorCode(error);

    // Network-related errors
    if (errorMessage.includes('network') || 
        errorMessage.includes('connection') ||
        errorMessage.includes('fetch') ||
        errorCode === 'NETWORK_ERROR') {
      return VapiErrorType.NETWORK;
    }

    // Authentication errors
    if (errorMessage.includes('unauthorized') ||
        errorMessage.includes('authentication') ||
        errorMessage.includes('token') ||
        errorCode === 'UNAUTHORIZED' ||
        error.status === 401) {
      return VapiErrorType.AUTHENTICATION;
    }

    // Permission errors
    if (errorMessage.includes('permission') ||
        errorMessage.includes('microphone') ||
        errorMessage.includes('media') ||
        errorCode === 'PERMISSION_DENIED') {
      return VapiErrorType.PERMISSION;
    }

    // Rate limit errors
    if (errorMessage.includes('rate limit') ||
        errorMessage.includes('too many requests') ||
        error.status === 429) {
      return VapiErrorType.RATE_LIMIT;
    }

    // Assistant configuration errors
    if (errorMessage.includes('assistant') ||
        errorMessage.includes('configuration') ||
        errorMessage.includes('missing') ||
        errorCode === 'ASSISTANT_NOT_FOUND') {
      return VapiErrorType.ASSISTANT_CONFIG;
    }

    // Audio-related errors
    if (errorMessage.includes('audio') ||
        errorMessage.includes('microphone') ||
        errorMessage.includes('sound') ||
        errorCode === 'AUDIO_ERROR') {
      return VapiErrorType.AUDIO;
    }

    // Timeout errors
    if (errorMessage.includes('timeout') ||
        errorMessage.includes('timed out') ||
        errorCode === 'TIMEOUT') {
      return VapiErrorType.TIMEOUT;
    }

    return VapiErrorType.UNKNOWN;
  }

  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error.toLowerCase();
    if (error?.message) return error.message.toLowerCase();
    if (error?.error?.message) return error.error.message.toLowerCase();
    if (error?.statusText) return error.statusText.toLowerCase();
    
    try {
      return JSON.stringify(error).toLowerCase();
    } catch {
      return 'unknown error';
    }
  }

  private extractErrorCode(error: any): string {
    if (error?.code) return error.code;
    if (error?.error?.code) return error.error.code;
    if (error?.name) return error.name;
    return '';
  }

  createVapiError(originalError: any): VapiError {
    const errorType = this.classifyError(originalError);
    const strategy = this.errorStrategies.get(errorType)!;
    
    return {
      code: errorType,
      message: this.generateUserFriendlyMessage(errorType, originalError),
      timestamp: new Date(),
      context: {
        originalError: this.sanitizeError(originalError),
        errorType,
        strategy
      },
      recoverable: strategy.shouldRetry
    };
  }

  private generateUserFriendlyMessage(errorType: VapiErrorType, originalError: any): string {
    const strategy = this.errorStrategies.get(errorType);
    
    if (strategy?.userAction) {
      return strategy.userAction;
    }

    // Fallback messages
    switch (errorType) {
      case VapiErrorType.NETWORK:
        return "Unable to connect to the interview service. Please check your internet connection.";
      case VapiErrorType.AUTHENTICATION:
        return "Authentication failed. Please refresh the page and try again.";
      case VapiErrorType.PERMISSION:
        return "Microphone access is required for the interview. Please allow microphone permissions.";
      case VapiErrorType.RATE_LIMIT:
        return "Too many requests. Please wait a moment before trying again.";
      case VapiErrorType.ASSISTANT_CONFIG:
        return "Interview service configuration error. Please contact support.";
      case VapiErrorType.AUDIO:
        return "Audio setup issue detected. Please check your microphone settings.";
      case VapiErrorType.TIMEOUT:
        return "Connection timed out. Please try starting the interview again.";
      default:
        return "An unexpected error occurred during the interview setup.";
    }
  }

  private sanitizeError(error: any): any {
    // Remove sensitive information from error context
    if (typeof error === 'object' && error !== null) {
      const sanitized = { ...error };
      delete sanitized.token;
      delete sanitized.apiKey;
      delete sanitized.authorization;
      return sanitized;
    }
    return error;
  }

  getRecoveryStrategy(errorType: VapiErrorType): ErrorRecoveryStrategy {
    return this.errorStrategies.get(errorType) || this.errorStrategies.get(VapiErrorType.UNKNOWN)!;
  }

  async executeRecoveryStrategy(
    errorType: VapiErrorType, 
    retryFunction: () => Promise<any>,
    currentAttempt: number = 0
  ): Promise<{ success: boolean; result?: any; finalError?: VapiError }> {
    const strategy = this.getRecoveryStrategy(errorType);
    
    if (!strategy.shouldRetry || currentAttempt >= strategy.maxRetries) {
      return { success: false };
    }

    // Wait before retry
    if (strategy.retryDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, strategy.retryDelay));
    }

    try {
      const result = await retryFunction();
      return { success: true, result };
    } catch (error) {
      const vapiError = this.createVapiError(error);
      
      // Try recovery strategy if available
      if (strategy.fallbackAction) {
        try {
          await strategy.fallbackAction();
        } catch (fallbackError) {
          console.warn('Fallback action failed:', fallbackError);
        }
      }

      // Recursive retry
      return this.executeRecoveryStrategy(errorType, retryFunction, currentAttempt + 1);
    }
  }

  logError(error: VapiError, context?: Record<string, any>): void {
    const logData = {
      timestamp: error.timestamp.toISOString(),
      errorCode: error.code,
      message: error.message,
      recoverable: error.recoverable,
      context: {
        ...error.context,
        ...context
      }
    };

    if (error.recoverable) {
      console.warn('[VAPI Error - Recoverable]:', logData);
    } else {
      console.error('[VAPI Error - Critical]:', logData);
    }

    // Send to analytics/monitoring service
    this.sendErrorToAnalytics(logData);
  }

  private sendErrorToAnalytics(errorData: any): void {
    // Implement analytics/monitoring integration
    // This could send to services like Sentry, LogRocket, etc.
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'vapi_error', {
        error_code: errorData.errorCode,
        error_message: errorData.message,
        recoverable: errorData.recoverable
      });
    }
  }
}

export const vapiErrorHandler = new VapiErrorHandler(); 