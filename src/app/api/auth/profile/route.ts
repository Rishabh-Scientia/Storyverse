import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth-helper";

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username, bio, avatarUrl, socialLinks } = await req.json();

    const trimmedUsername = username?.trim().toLowerCase();

    // Verify username uniqueness if username is being changed
    if (trimmedUsername && trimmedUsername !== decoded.username) {
      const existingUser = await db.user.findUnique({
        where: { username: trimmedUsername },
      });
      if (existingUser) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (trimmedUsername) updateData.username = trimmedUsername;
    if (bio !== undefined) updateData.bio = bio;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (socialLinks !== undefined) {
      updateData.socialLinks = typeof socialLinks === "string" ? socialLinks : JSON.stringify(socialLinks);
    }

    const updatedUser = await db.user.update({
      where: { id: decoded.userId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
        bio: updatedUser.bio,
        avatarUrl: updatedUser.avatarUrl,
        socialLinks: updatedUser.socialLinks,
        isVerified: updatedUser.isVerified,
        streakDays: updatedUser.streakDays,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
