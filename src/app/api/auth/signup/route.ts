import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth-helper";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required." },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim().toLowerCase();
    const trimmedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: trimmedEmail },
          { username: trimmedUsername },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === trimmedEmail) {
        return NextResponse.json({ error: "Email is already registered." }, { status: 400 });
      }
      return NextResponse.json({ error: "Username is already taken." }, { status: 400 });
    }

    const passwordHash = hashPassword(password);
    
    // Default avatar
    const avatarUrl = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`;

    const newUser = await db.user.create({
      data: {
        username: trimmedUsername,
        email: trimmedEmail,
        passwordHash,
        avatarUrl,
        bio: `Hi, I am ${trimmedUsername}! Welcome to my profile.`,
      },
    });

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        bio: newUser.bio,
        avatarUrl: newUser.avatarUrl,
        isVerified: newUser.isVerified,
        streakDays: newUser.streakDays,
      },
    });

    // Set secure JWT cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}
