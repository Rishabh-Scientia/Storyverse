import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth-helper";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      include: {
        stories: {
          select: {
            reads: true,
            likes: true,
          },
        },
        _count: {
          select: {
            stories: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Aggregate reads and likes
    const totalReads = user.stories.reduce((acc, curr) => acc + curr.reads, 0);
    const totalLikes = user.stories.reduce((acc, curr) => acc + curr.likes, 0);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        socialLinks: user.socialLinks,
        isVerified: user.isVerified,
        streakDays: user.streakDays,
        stats: {
          storiesCount: user._count.stories,
          followersCount: user._count.followers,
          followingCount: user._count.following,
          totalReads,
          totalLikes,
        },
      },
    });
  } catch (error) {
    console.error("Auth verify error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
