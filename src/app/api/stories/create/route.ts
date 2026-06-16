import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth-helper";
import { analyzeManuscript, reviewCover } from "@/lib/ai";

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

    const body = await req.json();
    const {
      title,
      subtitle,
      description,
      genre,
      category,
      tags,
      language,
      ageRating,
      storyType,
      coverUrl,
      manuscriptUrl,
      status,
      monetization,
      price,
      chapters, // [{ title: string, content: string }]
    } = body;

    if (!title || !description || !genre || !storyType || !chapters || chapters.length === 0) {
      return NextResponse.json(
        { error: "Required fields are missing: Title, Description, Genre, Story Type, and at least one chapter content." },
        { status: 400 }
      );
    }

    // 1. Run AI analysis on manuscript (using first chapter content)
    const firstChapterContent = chapters[0].content || "";
    const aiAnalysis = await analyzeManuscript(title, firstChapterContent);

    // 2. Run AI Cover Review
    const coverReview = await reviewCover(coverUrl);

    // 3. Save Story in database
    const newStory = await db.story.create({
      data: {
        title,
        subtitle,
        description,
        genre,
        category,
        tags: tags || genre,
        language: language || "English",
        ageRating: ageRating || "Everyone",
        storyType,
        coverUrl: coverUrl || "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
        manuscriptUrl,
        status: status || "PUBLIC",
        monetization: monetization || "FREE",
        price: price ? parseFloat(price) : 0.0,
        authorId: decoded.userId,
        // AI fields
        aiSummary: aiAnalysis.summary,
        aiKeywords: aiAnalysis.keywords.join(", "),
        aiContentRating: aiAnalysis.contentRating,
        aiCoverReview: coverReview.suggestions,
        // Chapters relations
        chapters: {
          create: chapters.map((chap: any, idx: number) => ({
            title: chap.title || `Chapter ${idx + 1}`,
            content: chap.content,
            chapterNo: idx + 1,
          })),
        },
      },
      include: {
        chapters: true,
      },
    });

    // Award author verification on first publish if not already verified
    await db.user.update({
      where: { id: decoded.userId },
      data: { isVerified: true },
    });

    return NextResponse.json({
      success: true,
      storyId: newStory.id,
      story: newStory,
    });
  } catch (error: any) {
    console.error("Story creation error:", error);
    return NextResponse.json(
      { error: "Internal server error during publishing." },
      { status: 500 }
    );
  }
}
