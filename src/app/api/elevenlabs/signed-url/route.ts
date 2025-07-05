import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent_id');
    
    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.log("No API key found, returning public agent URL");
      return NextResponse.json({ 
        signed_url: `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}` 
      });
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey
      }
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({ signed_url: data.signed_url });
    } else {
      console.log("Failed to get signed URL, returning public agent URL");
      return NextResponse.json({ 
        signed_url: `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}` 
      });
    }
  } catch (error) {
    console.error("Error getting signed URL:", error);
    const agentId = new URL(request.url).searchParams.get('agent_id');
    return NextResponse.json({ 
      signed_url: `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}` 
    });
  }
} 