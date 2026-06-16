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

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Toggle verification
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        isVerified: !user.isVerified,
      },
    });

    return NextResponse.json({ success: true, isVerified: updatedUser.isVerified });
  } catch (error) {
    console.error("Admin user verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
