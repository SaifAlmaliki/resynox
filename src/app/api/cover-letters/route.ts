import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { resumeId, jobDescription, title, content } = body;

    if (!resumeId || !jobDescription || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get user's subscription level
    const subscription = await db.userSubscription.findUnique({
      where: { userId },
    });

    // Check cover letter limit based on subscription
    const coverLetterCount = await db.coverLetter.count({
      where: { userId },
    });

    // Set limits based on subscription level
    let limit = 1; // Default for free users
    if (subscription?.stripePriceId?.includes("pro_plus")) {
      limit = 10;
    } else if (subscription?.stripePriceId?.includes("pro")) {
      limit = 3;
    }

    if (coverLetterCount >= limit) {
      const subscriptionType = subscription ? "subscription" : "free";
      return new NextResponse(`Cover letter limit reached for ${subscriptionType} users (${limit} cover letters)`, { status: 403 });
    }

    const coverLetter = await db.coverLetter.create({
      data: {
        userId,
        resumeId,
        jobDescription,
        content: content,
        title: title || "Untitled Cover Letter",
      },
    });

    return NextResponse.json(coverLetter);
  } catch (error) {
    console.error("[COVER_LETTER_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const coverLetters = await db.coverLetter.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(coverLetters);
  } catch (error) {
    console.error("[COVER_LETTER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 