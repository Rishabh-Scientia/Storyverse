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

    // Toggle bookmark
    const existingBookmark = await db.bookmark.findUnique({
      where: {
        storyId_userId: {
          storyId: id,
          userId: decoded.userId,
        },
      },
    });

    let bookmarked = false;
    if (existingBookmark) {
      await db.bookmark.delete({
        where: { id: existingBookmark.id },
      });
      bookmarked = false;
    } else {
      await db.bookmark.create({
        data: {
          storyId: id,
          userId: decoded.userId,
          chapterNo: 1,
          progress: 0,
        },
      });
      bookmarked = true;
    }

    return NextResponse.json({ success: true, bookmarked });
  } catch (error) {
    console.error("Bookmark error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
