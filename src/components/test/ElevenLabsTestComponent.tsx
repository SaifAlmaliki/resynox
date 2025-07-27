"use client";

import { useState } from 'react';
import { useElevenLabsInterview } from '@/components/interview/hooks/useElevenLabsInterview';
import { runSampleTest, testElevenLabsVariables } from '@/lib/test-elevenlabs-integration';
import { Button } from '@/components/ui/button';
import { CallStatus } from '@/types/interview';

/**
 * Test component for ElevenLabs integration
 * Use this to verify your ElevenLabs voice agent is working correctly
 */
export function ElevenLabsTestComponent() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isTestingVariables, setIsTestingVariables] = useState(false);

  const {
    callStatus,
    error,
    messages,
    isSpeaking,
    startInterview,
    endInterview,
    isActive
  } = useElevenLabsInterview({
    userName: "Test User",
    type: 'interview'
  });

  const handleVariableTest = () => {
    setIsTestingVariables(true);
    console.log('🧪 Running ElevenLabs variable test...');
    
    const result = runSampleTest();
    setTestResults(result);
    setIsTestingVariables(false);
    
    console.log('✅ Variable test completed:', result);
  };

  const handleStartInterview = async () => {
    try {
      console.log('🚀 Starting ElevenLabs test interview...');
      
      await startInterview({
        role: "Frontend Developer",
        experienceLevel: "Mid",
        techStack: ["React", "JavaScript", "TypeScript"],
        yearsOfExperience: 3,
        interviewDuration: 30,
        interviewType: "Technical Interview"
      });
    } catch (error) {
      console.error('❌ Failed to start test interview:', error);
    }
  };

  const handleEndInterview = async () => {
    try {
      console.log('🛑 Ending test interview...');
      await endInterview();
    } catch (error) {
      console.error('❌ Failed to end interview:', error);
    }
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case CallStatus.CONNECTING: return 'text-yellow-600';
      case CallStatus.ACTIVE: return 'text-green-600';
      case CallStatus.ERROR: return 'text-red-600';
      case CallStatus.FINISHED: return 'text-gray-600';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (callStatus) {
      case CallStatus.INACTIVE: return 'Ready to test';
      case CallStatus.CONNECTING: return 'Connecting to ElevenLabs...';
      case CallStatus.ACTIVE: return isSpeaking ? 'AI is speaking' : 'Listening for your voice';
      case CallStatus.ERROR: return 'Connection error';
      case CallStatus.FINISHED: return 'Interview ended';
      default: return 'Unknown status';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">ElevenLabs Integration Test</h1>
        
        {/* Environment Check */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Environment Check:</h3>
          <p className="text-sm">
            Agent ID: {process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ? 
              <span className="text-green-600">✅ Configured</span> : 
              <span className="text-red-600">❌ Missing</span>
            }
          </p>
          {!process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID && (
            <p className="text-red-600 text-sm mt-2">
              Add NEXT_PUBLIC_ELEVENLABS_AGENT_ID to your .env file
            </p>
          )}
        </div>

        {/* Variable Testing */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">1. Test Variable Preparation</h3>
          <Button 
            onClick={handleVariableTest} 
            disabled={isTestingVariables}
            className="mb-3"
          >
            {isTestingVariables ? 'Testing...' : 'Test Variables'}
          </Button>
          
          {testResults && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className={`font-medium ${testResults.success ? 'text-green-600' : 'text-red-600'}`}>
                {testResults.summary}
              </p>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-600">
                  View Variables ({testResults.variableCount} total)
                </summary>
                <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(testResults.dynamicVariables, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        {/* Voice Interview Testing */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">2. Test Voice Interview</h3>
          
          <div className="flex gap-3 mb-4">
            <Button 
              onClick={handleStartInterview}
              disabled={isActive || callStatus === CallStatus.CONNECTING}
              className="bg-green-600 hover:bg-green-700"
            >
              Start Test Interview
            </Button>
            
            <Button 
              onClick={handleEndInterview}
              disabled={!isActive}
              variant="outline"
            >
              End Interview
            </Button>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className={`font-medium ${getStatusColor()}`}>
              Status: {getStatusText()}
            </p>
            {error && (
              <p className="text-red-600 mt-2">Error: {error}</p>
            )}
          </div>
        </div>

        {/* Message History */}
        {messages.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">3. Message History</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {messages.map((message, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg ${
                    message.role === 'assistant' 
                      ? 'bg-blue-50 border-l-4 border-blue-400' 
                      : 'bg-green-50 border-l-4 border-green-400'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm">
                      {message.role === 'assistant' ? 'AI' : 'You'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{message.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Testing Instructions:</h3>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>First, test variables to ensure they're being prepared correctly</li>
            <li>Then start the voice interview (allow microphone access when prompted)</li>
            <li>Check browser console for detailed logs</li>
            <li>Speak to test voice recognition</li>
            <li>Listen for AI responses using your variables</li>
          </ol>
          
          <p className="text-sm mt-3 text-blue-700">
            📖 For detailed testing guide, see <code>ELEVENLABS_TESTING_GUIDE.md</code>
          </p>
        </div>
      </div>
    </div>
  );
}
