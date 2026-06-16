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

    const story = await db.story.findUnique({ where: { id } });
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Check if the user has already liked the story
    const existingLike = await db.like.findUnique({
      where: {
        storyId_userId: {
          storyId: id,
          userId: decoded.userId,
        },
      },
    });

    let liked = false;
    let updatedStory;

    if (existingLike) {
      // Unlike
      await db.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      updatedStory = await db.story.update({
        where: { id },
        data: {
          likes: {
            decrement: 1,
          },
        },
      });
      liked = false;
    } else {
      // Like
      await db.like.create({
        data: {
          storyId: id,
          userId: decoded.userId,
        },
      });

      updatedStory = await db.story.update({
        where: { id },
        data: {
          likes: {
            increment: 1,
          },
        },
      });
      liked = true;
    }

    return NextResponse.json({ success: true, liked, likes: Math.max(0, updatedStory.likes) });
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
