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
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { authorId } = await req.json();
    if (!authorId) {
      return NextResponse.json({ error: "Author ID is required" }, { status: 400 });
    }

    // Do not allow self follow
    if (decoded.userId === authorId) {
      return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
    }

    // Check if follow relation exists
    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: decoded.userId,
          followingId: authorId,
        },
      },
    });

    let following = false;

    if (existingFollow) {
      // Unfollow
      await db.follow.delete({
        where: {
          id: existingFollow.id,
        },
      });
      following = false;
    } else {
      // Follow
      await db.follow.create({
        data: {
          followerId: decoded.userId,
          followingId: authorId,
        },
      });
      following = true;
    }

    return NextResponse.json({ success: true, following });
  } catch (error) {
    console.error("Follow error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
