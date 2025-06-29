import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { canUseVoiceInterview } from "@/lib/permissions";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const voiceInterviewStatus = await canUseVoiceInterview(userId);
    
    return NextResponse.json(voiceInterviewStatus);
  } catch (error) {
    console.error("Error checking voice interview status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 