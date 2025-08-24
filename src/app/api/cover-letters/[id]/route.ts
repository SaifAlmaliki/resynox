import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

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

    // Check if the cover letter exists and belongs to the user
    const coverLetter = await db.coverLetter.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!coverLetter) {
      return new NextResponse("Cover letter not found", { status: 404 });
    }

    // Delete the cover letter
    await db.coverLetter.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[COVER_LETTER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

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

    const coverLetter = await (db.coverLetter.findFirst as any)({
      where: {
        id,
        userId,
      },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            city: true,
            country: true,
          },
        },
      },
    });

    if (!coverLetter) {
      return new NextResponse("Cover letter not found", { status: 404 });
    }

    // Parse metadata if exists
    let parsedMetadata = null;
    if (coverLetter.metadata) {
      try {
        parsedMetadata = JSON.parse(coverLetter.metadata);
      } catch (error) {
        console.error("Error parsing cover letter metadata:", error);
      }
    }

    return NextResponse.json({
      ...coverLetter,
      parsedMetadata,
    });
  } catch (error) {
    console.error("[COVER_LETTER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
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
    const { title, content } = body;

    if (!content || !content.trim()) {
      return new NextResponse("Content is required", { status: 400 });
    }

    // Check if the cover letter exists and belongs to the user
    const existingCoverLetter = await db.coverLetter.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingCoverLetter) {
      return new NextResponse("Cover letter not found", { status: 404 });
    }

    // Update the cover letter
    const updatedCoverLetter = await db.coverLetter.update({
      where: { id },
      data: {
        title: title || null,
        content: content.trim(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedCoverLetter);
  } catch (error) {
    console.error("[COVER_LETTER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 