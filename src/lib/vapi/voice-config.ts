/**
 * VAPI Voice Configuration - Optimized and Integrated
 * This replaces the standalone vapi-voice-config.ts with a more integrated approach
 */

// Simplified voice configuration interface
export interface VapiVoiceSettings {
  provider: string;
  voiceId: string;
  model?: string;
  speed: number;
  stability: number;
  style?: number;
}

export interface VapiTranscriberSettings {
  provider: string;
  model: string;
  language: string;
  keywords?: readonly string[];
}

export interface OptimizedVoiceConfig {
  voice: VapiVoiceSettings;
  transcriber: VapiTranscriberSettings;
  backchannelingEnabled: boolean;
  backgroundDenoisingEnabled: boolean;
  modelOutputInMessagesEnabled: boolean;
}

// Optimized settings for different interview types
export const VAPI_VOICE_SETTINGS = {
  interview: {
    voice: {
      provider: "11labs",
      voiceId: "sarah",
      model: "eleven_turbo_v2",
      speed: 0.9,
      stability: 0.8,
      style: 0.2
    },
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "en-US",
      keywords: [
        "interview", "experience", "project", "team", "challenge", "solution",
        "development", "management", "leadership", "collaboration", "skills",
        "responsibility", "achievement", "problem", "result", "process"
      ]
    },
    backchannelingEnabled: false,
    backgroundDenoisingEnabled: true,
    modelOutputInMessagesEnabled: true
  },
  
  feedback: {
    voice: {
      provider: "11labs",
      voiceId: "sarah",
      model: "eleven_turbo_v2",
      speed: 0.85,
      stability: 0.8,
      style: 0.1
    },
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "en-US",
      keywords: [
        "feedback", "improvement", "performance", "recommendation",
        "strength", "weakness", "suggestion", "evaluation"
      ]
    },
    backchannelingEnabled: false,
    backgroundDenoisingEnabled: true,
    modelOutputInMessagesEnabled: true
  }
} as const;

/**
 * Get optimized voice configuration for the specified type
 */
export function getOptimizedVoiceConfig(
  type: 'interview' | 'feedback' = 'interview'
): OptimizedVoiceConfig {
  return VAPI_VOICE_SETTINGS[type];
}

/**
 * Merge voice configuration with VAPI assistant overrides
 * This is used in vapi.integration.ts to apply voice settings
 */
export function mergeVoiceConfigWithOverrides(
  baseOverrides: any,
  voiceType: 'interview' | 'feedback' = 'interview'
): any {
  const voiceConfig = getOptimizedVoiceConfig(voiceType);
  
  return {
    ...baseOverrides,
    voice: voiceConfig.voice,
    transcriber: voiceConfig.transcriber,
    backchannelingEnabled: voiceConfig.backchannelingEnabled,
    backgroundDenoisingEnabled: voiceConfig.backgroundDenoisingEnabled,
    modelOutputInMessagesEnabled: voiceConfig.modelOutputInMessagesEnabled
  };
} 