import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Webhook endpoint to receive analysis results from n8n
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { analysisId, strengths, weaknesses, overallScore, recommendations } = body;

    if (!analysisId) {
      return NextResponse.json(
        { error: "Analysis ID is required" },
        { status: 400 }
      );
    }

    if (!strengths || !weaknesses) {
      return NextResponse.json(
        { error: "Strengths and weaknesses are required" },
        { status: 400 }
      );
    }

    // Update the analysis record with results
    await prisma.resumeAnalysis.update({
      where: { id: analysisId },
      data: {
        status: "completed",
        analysisResult: JSON.stringify({
          strengths: Array.isArray(strengths) ? strengths : [strengths],
          weaknesses: Array.isArray(weaknesses) ? weaknesses : [weaknesses],
          overallScore: overallScore || null,
          recommendations: Array.isArray(recommendations) ? recommendations : (recommendations ? [recommendations] : []),
          analyzedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    
    // Try to update the analysis record with error status
    try {
      const body = await req.json();
      if (body.analysisId) {
        await prisma.resumeAnalysis.update({
          where: { id: body.analysisId },
          data: {
            status: "failed",
            errorMessage: "Error processing webhook response",
          },
        });
      }
    } catch (updateError) {
      console.error("Error updating analysis record:", updateError);
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 