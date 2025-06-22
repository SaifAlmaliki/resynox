"use client";

import { useState } from "react";
import { vapi } from "@/lib/vapi.sdk";
import { startVapiInterview } from "@/lib/vapi.integration";

export default function DebugVapiPage() {
  const [status, setStatus] = useState<string>("Ready");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testBasicConnection = async () => {
    setStatus("Testing basic connection...");
    addLog("Starting basic VAPI connection test");
    
    try {
      const client = await vapi.getClient();
      addLog("✅ VAPI client initialized successfully");
      setStatus("✅ Basic connection test passed");
    } catch (error: any) {
      addLog(`❌ Basic connection test failed: ${error.message}`);
      setStatus("❌ Basic connection test failed");
    }
  };

  const testFirstClickFix = async () => {
    setStatus("Testing first-click fix with retry mechanism...");
    addLog("Starting first-click reliability test with enhanced error handling");
    
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    
    if (!assistantId) {
      addLog("❌ No Assistant ID found in environment variables");
      setStatus("❌ Configuration Error");
      return;
    }
    
    try {
      // Use the enhanced start method which should handle retries
      await vapi.start(assistantId, {
        // Simple test parameters with required provider
        model: {
          provider: "openai",
          model: "gpt-4.1-mini",
          messages: [{ role: "system", content: "You are a test assistant." }]
        },
        variableValues: {
          candidateName: "Test User",
          role: "Test Role"
        }
      });
      
      addLog("✅ First-click test passed - interview started successfully");
      setStatus("✅ First-click test passed");
      
      // Stop the call after testing
      setTimeout(async () => {
        try {
          await vapi.stop();
          addLog("🛑 Test call stopped");
        } catch (e) {
          addLog("⚠️ Failed to stop test call gracefully");
        }
      }, 2000);
      
    } catch (error: any) {
      addLog(`❌ First-click test failed: ${error.message}`);
      addLog(`❌ Full error details: ${JSON.stringify(error, null, 2)}`);
      setStatus("❌ First-click test failed");
    }
  };

  const testEmptyErrorFix = async () => {
    setStatus("Testing empty error fix...");
    addLog("🔍 Testing VAPI empty error handling");
    
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    const webToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
    
    if (!assistantId || !webToken) {
      addLog("❌ Missing environment variables");
      addLog(`Assistant ID: ${assistantId ? '✅ Present' : '❌ Missing'}`);
      addLog(`Web Token: ${webToken ? '✅ Present' : '❌ Missing'}`);
      setStatus("❌ Configuration Error");
      return;
    }
    
    addLog(`🔑 Using Assistant ID: ${assistantId}`);
    addLog(`🔑 Web Token length: ${webToken.length} characters`);
    
    try {
      // Test the specific scenario that's failing
      const result = await startVapiInterview(
        "Test User",
        "test-user-123",
        "test-interview-456",
        "Software Developer",
        ["JavaScript", "React"],
        "Mid-level",
        [],
        "interview"
      );
      
      if (result.success) {
        addLog("✅ Empty error test passed - interview started successfully");
        setStatus("✅ Empty error fix working");
        
        // Stop the test call
        setTimeout(async () => {
          try {
            await vapi.stop();
            addLog("🛑 Test call stopped");
          } catch (e) {
            addLog("⚠️ Failed to stop test call gracefully");
          }
        }, 2000);
      } else {
        addLog(`❌ Empty error test failed: ${result.error}`);
        setStatus("❌ Empty error test failed");
      }
    } catch (error: any) {
      addLog(`❌ Caught error in test: ${error.message || 'No message'}`);
      addLog(`❌ Error type: ${typeof error}`);
      addLog(`❌ Error constructor: ${error?.constructor?.name || 'Unknown'}`);
      addLog(`❌ Error keys: ${JSON.stringify(Object.keys(error || {}))}`);
      addLog(`❌ Full error object: ${JSON.stringify(error, null, 2)}`);
      setStatus("❌ Empty error test failed");
    }
  };

  const testCallDurationLimits = async () => {
    setStatus("Testing call duration and account limits...");
    addLog("🕐 Testing VAPI call duration limits and account status");
    
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    const webToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
    
    if (!assistantId || !webToken) {
      addLog("❌ Missing environment variables");
      setStatus("❌ Configuration Error");
      return;
    }
    
    try {
      // Start a test call with minimal configuration
      addLog("📞 Starting test call to check account limits...");
      
      const result = await startVapiInterview(
        "Duration Test User",
        "duration-test-123",
        "duration-test-456",
        "Software Developer",
        ["JavaScript"],
        "Mid-level",
        [],
        "interview"
      );
      
      if (result.success) {
        addLog("✅ Test call started successfully");
        addLog("⏱️ Monitoring call for premature termination...");
        setStatus("✅ Monitoring call duration...");
        
        // Monitor the call for 30 seconds to see if it gets terminated
        let callEnded = false;
        const client = await vapi.getClient();
        
        const endHandler = (details?: any) => {
          callEnded = true;
          addLog(`🛑 Call ended: ${details ? JSON.stringify(details) : 'No details'}`);
          if (details && details.reason) {
            addLog(`📋 End reason: ${details.reason}`);
          }
        };
        
        const errorHandler = (error?: any) => {
          callEnded = true;
          addLog(`❌ Call error: ${JSON.stringify(error, null, 2)}`);
        };
        
        client.on("call-end", endHandler);
        client.on("error", errorHandler);
        
        // Monitor for 30 seconds
        setTimeout(async () => {
          if (!callEnded) {
            addLog("✅ Call survived 30 seconds - manually ending test");
            try {
              await vapi.stop();
              addLog("🛑 Test call stopped manually");
            } catch (e) {
              addLog("⚠️ Failed to stop test call gracefully");
            }
          }
          
          // Clean up event listeners
          client.off("call-end", endHandler);
          client.off("error", errorHandler);
          
          setStatus(callEnded ? "❌ Call ended prematurely" : "✅ Call duration test passed");
        }, 30000);
        
      } else {
        addLog(`❌ Test call failed to start: ${result.error}`);
        setStatus("❌ Call duration test failed");
      }
    } catch (error: any) {
      addLog(`❌ Duration test error: ${error.message || 'Unknown error'}`);
      addLog(`❌ Full error: ${JSON.stringify(error, null, 2)}`);
      setStatus("❌ Duration test failed");
    }
  };

  const testAssistantIntegration = async () => {
    setStatus("Testing complete assistant integration...");
    addLog("Starting comprehensive assistant integration test");
    
    try {
      // Test the complete interview flow
      const result = await startVapiInterview(
        "Alex Johnson",
        "test-user-id", 
        "test-interview-id",
        "Full Stack Developer",
        ["JavaScript", "React", "Node.js", "TypeScript"],
        "Mid-level",
        [],
        "interview"
      );
      
      if (result.success) {
        addLog("✅ Assistant integration test passed");
        setStatus("✅ Assistant test passed");
        
        // Stop the test call after a brief moment
        setTimeout(async () => {
          try {
            await vapi.stop();
            addLog("🛑 Assistant test call stopped");
          } catch (error) {
            addLog("⚠️ Failed to stop assistant test call gracefully");
          }
        }, 3000);
      } else {
        addLog(`❌ Assistant integration test failed: ${result.error}`);
        setStatus("❌ Assistant test failed");
      }
    } catch (error: any) {
      addLog(`❌ Assistant integration test failed: ${error.message}`);
      setStatus("❌ Assistant test failed");
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setStatus("Ready");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">VAPI Debug Console</h1>
        
        {/* Status Display */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Status</h2>
          <p className="text-lg">{status}</p>
        </div>

        {/* Environment Check */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Environment Configuration</h2>
          <div className="space-y-2">
            <p>VAPI Web Token: {process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN ? '✅ Present' : '❌ Missing'}</p>
            <p>Token Length: {process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN?.length || 0} characters</p>
            <p>Assistant ID: {process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '❌ Missing'}</p>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <button
              onClick={testBasicConnection}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
            >
              Basic Connection
            </button>
            
            <button
              onClick={testFirstClickFix}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors"
            >
              First-Click Fix Test
            </button>
            
            <button
              onClick={testEmptyErrorFix}
              className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded transition-colors"
            >
              Empty Error Test
            </button>
            
            <button
              onClick={testCallDurationLimits}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
            >
              Duration Limits Test
            </button>
            
            <button
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors"
              onClick={testAssistantIntegration}
              disabled={status.includes("Testing") || status.includes("passed")}
            >
              Assistant Test
            </button>
            
            <button
              onClick={clearLogs}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Test Descriptions */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Descriptions</h2>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Basic Connection:</strong> Tests VAPI client initialization only
            </div>
            <div>
              <strong>First-Click Fix Test:</strong> Tests the enhanced retry mechanism for first-click reliability
            </div>
            <div>
              <strong>Empty Error Test:</strong> Tests the VAPI's handling of empty error objects
            </div>
            <div>
              <strong>Duration Limits Test:</strong> Tests the VAPI's handling of call duration and account limits
            </div>
            <div>
              <strong>Assistant Test:</strong> Tests the complete interview integration with realistic parameters
            </div>
          </div>
        </div>

        {/* Logs Display */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="bg-black p-4 rounded border max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400">No logs yet. Run a test to see output.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1 font-mono text-sm">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Available Tests</h2>
          <ul className="space-y-2 text-sm">
            <li><strong>Basic Connection:</strong> Tests VAPI client initialization and token validation</li>
            <li><strong>First-Click Fix:</strong> Tests the enhanced retry mechanism for reliable first-click starts</li>
            <li><strong>Empty Error Test:</strong> Tests the VAPI's handling of empty error objects</li>
            <li><strong>Duration Limits Test:</strong> Tests the VAPI's handling of call duration and account limits</li>
            <li><strong>Assistant Test:</strong> Tests the complete interview integration with realistic parameters</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 