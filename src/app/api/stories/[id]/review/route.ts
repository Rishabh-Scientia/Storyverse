import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth-helper";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title, content, rating } = await req.json();

    if (!title || !content || !rating) {
      return NextResponse.json({ error: "Title, content, and rating are required" }, { status: 400 });
    }

    const val = parseInt(rating);
    if (isNaN(val) || val < 1 || val > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5 stars" }, { status: 400 });
    }

    // Insert Review
    const review = await db.review.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        rating: val,
        storyId: id,
        userId: decoded.userId,
      },
      include: {
        user: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Sync or create dynamic Rating record
    await db.rating.upsert({
      where: {
        storyId_userId: {
          storyId: id,
          userId: decoded.userId,
        },
      },
      update: {
        value: val,
      },
      create: {
        storyId: id,
        userId: decoded.userId,
        value: val,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Review submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
