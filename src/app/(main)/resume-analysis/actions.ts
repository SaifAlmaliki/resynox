"use server";

import { env } from "@/env";
import { canUseAITools } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { resumeAnalysisSchema, ResumeAnalysisValues } from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import path from "path";

/**
 * Uploads a PDF resume and job description for AI analysis
 * Sends data to n8n webhook and waits for response
 */
export async function analyzeResume(values: ResumeAnalysisValues) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Validate input
  const { resumePdf, jobDescription } = resumeAnalysisSchema.parse(values);

  // Check subscription level - only pro users can use this feature
  const subscriptionLevel = await getUserSubscriptionLevel(userId);
  if (!canUseAITools(subscriptionLevel)) {
    throw new Error("Resume analysis is only available for Pro subscribers");
  }

  try {
    // Upload PDF to Vercel storage
    const fileExtension = path.extname(resumePdf.name);
    const fileName = `resume_analysis_${Date.now()}${fileExtension}`;
    
    const blob = await put(`resume_analysis/${fileName}`, resumePdf, {
      access: "public",
    });

    // Create analysis record in database
    const analysis = await prisma.resumeAnalysis.create({
      data: {
        userId,
        pdfFileUrl: blob.url,
        jobDescription,
        status: "processing",
      },
    });

    // Send to n8n webhook
    const webhookResponse = await sendToN8nWebhook({
      analysisId: analysis.id,
      pdfUrl: blob.url,
      jobDescription,
      userId,
    });

    // Wait for response with 25-second timeout
    const analysisResult = await waitForAnalysisResult(analysis.id);

    return {
      success: true,
      analysisId: analysis.id,
      result: analysisResult,
    };
  } catch (error) {
    console.error("Resume analysis error:", error);
    
    // Update analysis record with error
    await prisma.resumeAnalysis.updateMany({
      where: { userId },
      data: {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error occurred",
      },
    });

    throw new Error(
      error instanceof Error ? error.message : "Failed to analyze resume"
    );
  }
}

/**
 * Sends resume data to n8n webhook
 */
async function sendToN8nWebhook(data: {
  analysisId: string;
  pdfUrl: string;
  jobDescription: string;
  userId: string;
}) {
  const response = await fetch(env.N8N_RESUME_ANALYSIS_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`n8n webhook failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Waits for analysis result with 25-second timeout
 */
async function waitForAnalysisResult(analysisId: string): Promise<any> {
  const timeout = 25000; // 25 seconds
  const pollInterval = 1000; // 1 second
  const maxAttempts = timeout / pollInterval;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const analysis = await prisma.resumeAnalysis.findUnique({
      where: { id: analysisId },
    });

    if (!analysis) {
      throw new Error("Analysis record not found");
    }

    if (analysis.status === "completed" && analysis.analysisResult) {
      return JSON.parse(analysis.analysisResult);
    }

    if (analysis.status === "failed") {
      throw new Error(analysis.errorMessage || "Analysis failed");
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  // Timeout reached
  await prisma.resumeAnalysis.update({
    where: { id: analysisId },
    data: {
      status: "failed",
      errorMessage: "Analysis timeout - no response received within 25 seconds",
    },
  });

  throw new Error("Analysis timeout - please try again");
}

/**
 * Retrieves analysis results for a user
 */
export async function getUserAnalyses() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const analyses = await prisma.resumeAnalysis.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return analyses;
}

/**
 * Webhook endpoint handler for n8n responses
 */
export async function handleN8nWebhookResponse(data: {
  analysisId: string;
  strengths: string[];
  weaknesses: string[];
  overallScore?: number;
  recommendations?: string[];
}) {
  const { analysisId, strengths, weaknesses, overallScore, recommendations } = data;

  await prisma.resumeAnalysis.update({
    where: { id: analysisId },
    data: {
      status: "completed",
      analysisResult: JSON.stringify({
        strengths,
        weaknesses,
        overallScore,
        recommendations,
        analyzedAt: new Date().toISOString(),
      }),
    },
  });

  return { success: true };
} 