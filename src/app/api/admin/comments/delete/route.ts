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

    const { commentId } = await req.json();
    if (!commentId) {
      return NextResponse.json({ error: "Comment ID is required" }, { status: 400 });
    }

    const comment = await db.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Delete comment
    await db.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true, message: "Comment moderated successfully" });
  } catch (error) {
    console.error("Admin comment delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
