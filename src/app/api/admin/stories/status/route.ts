import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth-helper";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 451 });
    }

    const { storyId } = await req.json();
    if (!storyId) {
      return NextResponse.json({ error: "Story ID is required" }, { status: 400 });
    }

    const story = await db.story.findUnique({ where: { id: storyId } });
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Toggle status between PUBLIC and PRIVATE (Takedown)
    const newStatus = story.status === "PUBLIC" ? "PRIVATE" : "PUBLIC";

    const updatedStory = await db.story.update({
      where: { id: storyId },
      data: {
        status: newStatus,
      },
    });

    return NextResponse.json({ success: true, status: updatedStory.status });
  } catch (error) {
    console.error("Admin story status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
