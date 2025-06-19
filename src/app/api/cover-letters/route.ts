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
    const { resumeId, jobDescription, title, content, basicInfo } = body;

    if (!jobDescription || !content) {
      return new NextResponse("Job description and content are required", { status: 400 });
    }

    // Validate that either resumeId or basicInfo is provided
    if (!resumeId && !basicInfo) {
      return new NextResponse("Either resume ID or basic info is required", { status: 400 });
    }

    // If basicInfo is provided, validate required fields
    if (basicInfo && (!basicInfo.firstName || !basicInfo.lastName || !basicInfo.email)) {
      return new NextResponse("First name, last name, and email are required when not using a resume", { status: 400 });
    }

    // Cover letter creation is now unlimited for all users

    // Prepare the cover letter data
    const coverLetterData: any = {
      userId,
      jobDescription,
      content: content,
      title: title || "Untitled Cover Letter",
    };

    // Add resumeId if provided, otherwise it will be null
    if (resumeId) {
      coverLetterData.resumeId = resumeId;
    }

    // Store basic info as metadata if provided (when not using resume)
    if (basicInfo) {
      coverLetterData.metadata = JSON.stringify({
        basicInfo: {
          firstName: basicInfo.firstName,
          lastName: basicInfo.lastName,
          email: basicInfo.email,
          phone: basicInfo.phone || null,
        },
        createdWithoutResume: true,
      });
    }

    const coverLetter = await db.coverLetter.create({
      data: coverLetterData,
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

    const coverLetters = await (db.coverLetter.findMany as any)({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Parse metadata for cover letters created without resume
    const coverLettersWithMetadata = coverLetters.map((coverLetter: any) => {
      let parsedMetadata = null;
      if (coverLetter.metadata) {
        try {
          parsedMetadata = JSON.parse(coverLetter.metadata);
        } catch (error) {
          console.error("Error parsing cover letter metadata:", error);
        }
      }

      return {
        ...coverLetter,
        parsedMetadata,
      };
    });

    return NextResponse.json(coverLettersWithMetadata);
  } catch (error) {
    console.error("[COVER_LETTER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 