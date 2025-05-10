"use client";

import Vapi from "@vapi-ai/web";

// Create a safe wrapper for the VAPI client that works in all environments
const createSafeVapiClient = () => {
  // Dummy client with the same API shape for non-browser environments
  const dummyClient = {
    start: async () => {
      console.log("VAPI client not available in this environment");
      return Promise.resolve();
    },
    stop: () => console.log("VAPI client not available in this environment"),
    on: () => {
      console.log("VAPI client not available in this environment");
      return { remove: () => {} };
    },
    off: () => console.log("VAPI client not available in this environment"),
    send: () => console.log("VAPI client not available in this environment"),
    isMuted: () => false,
    setMuted: () => console.log("VAPI client not available in this environment"),
    say: () => console.log("VAPI client not available in this environment"),
  };

  // Only initialize in browser environment
  if (typeof window === 'undefined') {
    console.log("VAPI client not initialized - not in browser environment");
    return dummyClient;
  }

  try {
    // Initialize the VAPI client with the web token from environment variables
    return new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!);
  } catch (error) {
    console.error("Error initializing VAPI client:", error);
    return dummyClient;
  }
};

// Export a singleton instance of the VAPI client
export const vapi = createSafeVapiClient();
