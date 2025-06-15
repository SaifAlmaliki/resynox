import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET - Fetch a single cover letter
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const coverLetter = await db.coverLetter.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!coverLetter) {
      return new NextResponse("Cover letter not found", { status: 404 });
    }

    return NextResponse.json(coverLetter);
  } catch (error) {
    console.error("[COVER_LETTER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PUT - Update a cover letter
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, content, jobDescription, resumeId } = body;

    // Verify the cover letter exists and belongs to the user
    const existingCoverLetter = await db.coverLetter.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingCoverLetter) {
      return new NextResponse("Cover letter not found", { status: 404 });
    }

    const updatedCoverLetter = await db.coverLetter.update({
      where: { id },
      data: {
        title,
        content,
        jobDescription,
        resumeId,
      },
    });

    return NextResponse.json(updatedCoverLetter);
  } catch (error) {
    console.error("[COVER_LETTER_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE - Delete a cover letter
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    // Verify the cover letter exists and belongs to the user
    const existingCoverLetter = await db.coverLetter.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingCoverLetter) {
      return new NextResponse("Cover letter not found", { status: 404 });
    }

    await db.coverLetter.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[COVER_LETTER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 