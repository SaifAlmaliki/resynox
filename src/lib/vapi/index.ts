// VAPI Module - Centralized exports for cleaner imports
// This file serves as the main entry point for all VAPI-related functionality

// Core SDK and client
export { vapi } from '../vapi.sdk';

// Integration and setup
export { 
  startComprehensiveTechnicalInterview,
  startVapiInterview,
  startVapiInterviewWithExistingAssistant 
} from '../vapi.integration';

// Error handling
export { vapiErrorHandler, VapiErrorType } from '../vapi-error-handler';
export type { ErrorRecoveryStrategy } from '../vapi-error-handler';

// Performance monitoring
export { vapiPerformance } from '../vapi-performance';
export type { VapiPerformanceMetrics, VapiConnectionConfig } from '../vapi-performance';

// Logging
export { vapiLogger, LogLevel } from '../vapi.logger';

// Prompt templates
export { createTechnicalInterviewPrompt, VAPI_PROMPT_VARIABLES } from '../vapi-prompt-template';

// Voice configuration (optimized and integrated)
export { 
  getOptimizedVoiceConfig, 
  VAPI_VOICE_SETTINGS, 
  mergeVoiceConfigWithOverrides 
} from './voice-config';
export type { 
  VapiVoiceSettings, 
  VapiTranscriberSettings, 
  OptimizedVoiceConfig 
} from './voice-config';

// Types
export type { TechnicalInterviewParams } from '../vapi.integration';

// Re-export useful types from the original interview types
export type { 
  AgentType, 
  CallStatus, 
  SavedMessage, 
  VapiError 
} from '../../types/interview'; 