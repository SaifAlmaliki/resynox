"use client";

import Vapi from "@vapi-ai/web";

let vapiInstance: Vapi | null = null;
let isInitializing = false;

// Async function to ensure VAPI is properly initialized
const ensureVapiInitialized = async (): Promise<Vapi> => {
  // If already initialized, return it
  if (vapiInstance) {
    return vapiInstance;
  }

  // If currently initializing, wait for it
  if (isInitializing) {
    console.log("⏳ VAPI initialization in progress, waiting...");
    // Wait a bit and check again
    await new Promise(resolve => setTimeout(resolve, 100));
    return ensureVapiInitialized();
  }

  // Start initialization
  isInitializing = true;
  console.log("🚀 Initializing VAPI client...");

  try {
    // Only initialize in browser environment
    if (typeof window === 'undefined') {
      console.log("❌ VAPI client not available - not in browser environment");
      throw new Error("VAPI client not available in server environment");
    }

    const webToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
    if (!webToken) {
      console.error("❌ VAPI Web Token not found in environment variables");
      throw new Error("VAPI Web Token not found");
    }

    console.log("🔑 Creating VAPI client with token...");
    vapiInstance = new Vapi(webToken);
    
    // Give it more time to fully initialize and "warm up"
    console.log("⏱️ Warming up VAPI client...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("✅ VAPI client initialized successfully");
    return vapiInstance;

  } catch (error) {
    console.error("❌ Error initializing VAPI client:", error);
    throw error;
  } finally {
    isInitializing = false;
  }
};

// Helper function to extract meaningful error information
const extractErrorInfo = (error: any): string => {
  if (!error) return "Unknown error";
  
  // If it's a string, return it
  if (typeof error === 'string') return error;
  
  // If it has a message property
  if (error.message) return error.message;
  
  // If it's a Response object (fetch error)
  if (error.status && error.statusText) {
    return `HTTP ${error.status}: ${error.statusText}`;
  }
  
  // If it has error property
  if (error.error) {
    if (typeof error.error === 'string') return error.error;
    if (error.error.message) return error.error.message;
  }
  
  // Try to stringify if it's an object
  try {
    const str = JSON.stringify(error);
    if (str && str !== '{}') return str;
  } catch (e) {
    // Stringify failed
  }
  
  // Last resort
  return error.toString ? error.toString() : "Unknown error occurred";
};

// Enhanced VAPI client that ensures proper initialization
export const vapi = {
  // Initialize and start call with retry mechanism
  async start(assistantId: string, overrides?: any) {
    console.log("🎯 Starting VAPI call with proper initialization...");
    const client = await ensureVapiInitialized();
    
    // Retry mechanism for the first-call issue
    let lastError: any = null;
    let errorDetails: string[] = [];
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`📞 Attempt ${attempt} to start VAPI call...`);
        
        // Clear any existing error state before attempting
        const result = await client.start(assistantId, overrides);
        
        console.log("✅ VAPI call started successfully!");
        return result; // Success!
        
      } catch (error: any) {
        lastError = error;
        const errorMsg = extractErrorInfo(error);
        errorDetails.push(`Attempt ${attempt}: ${errorMsg}`);
        
        console.warn(`⚠️ Attempt ${attempt} failed: ${errorMsg}`);
        console.warn(`⚠️ Full error object:`, error);
        
        // If it's not the last attempt, wait before retrying
        if (attempt < 3) {
          console.log(`⏳ Waiting 1 second before retry ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // If all attempts failed, throw a comprehensive error
    const finalErrorMsg = `All VAPI call attempts failed. Details: ${errorDetails.join('; ')}`;
    console.error("❌", finalErrorMsg);
    console.error("❌ Last error object:", lastError);
    
    // Create a clear error to throw
    const finalError = new Error(finalErrorMsg);
    (finalError as any).originalError = lastError;
    throw finalError;
  },

  // Get the initialized client for direct method access
  async getClient(): Promise<Vapi> {
    return ensureVapiInitialized();
  },

  // Direct access methods for common operations
  async stop() {
    const client = await ensureVapiInitialized();
    return client.stop();
  },

  async send(message: any) {
    const client = await ensureVapiInitialized();
    return client.send(message);
  },

  async isMuted() {
    const client = await ensureVapiInitialized();
    return client.isMuted();
  },

  async setMuted(muted: boolean) {
    const client = await ensureVapiInitialized();
    return client.setMuted(muted);
  },

  async say(message: string) {
    const client = await ensureVapiInitialized();
    return client.say(message);
  },

  // Event handling - get client first then attach events
  on: async (event: any, callback: any) => {
    const client = await ensureVapiInitialized();
    return client.on(event, callback);
  },

  off: async (event: any, callback: any) => {
    const client = await ensureVapiInitialized();
    return client.off(event, callback);
  }
};
