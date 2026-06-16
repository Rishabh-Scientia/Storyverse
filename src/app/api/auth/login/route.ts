import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, signToken } from "@/lib/auth-helper";

export async function POST(req: NextRequest) {
  try {
    const { loginId, password } = await req.json(); // loginId can be email or username

    if (!loginId || !password) {
      return NextResponse.json(
        { error: "Email/Username and password are required." },
        { status: 400 }
      );
    }

    const trimmedLogin = loginId.trim().toLowerCase();

    // Find user by email or username
    const user = await db.user.findFirst({
      where: {
        OR: [
          { email: trimmedLogin },
          { username: trimmedLogin },
        ],
      },
    });

    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Invalid email/username or password." },
        { status: 400 }
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
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
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error during login." },
      { status: 500 }
    );
  }
}
