import React from "react";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth-helper";
import Link from "next/link";
import { BookOpen, Heart, Star, Sparkles, AlertTriangle, MessageSquare, Calendar, ChevronRight, Bookmark, Lock, ShieldCheck } from "lucide-react";
import StoryDetailsClient from "./story-details-client";

export const dynamic = "force-dynamic";

interface StoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StoryDetailPage({ params }: StoryPageProps) {
  const { id } = await params;

  // Fetch story details
  const story = await db.story.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          isVerified: true,
        },
      },
      chapters: {
        orderBy: { chapterNo: "asc" },
      },
      comments: {
        include: {
          user: {
            select: { username: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      reviews: {
        include: {
          user: {
            select: { username: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      ratings: true,
    },
  });

  if (!story) {
    notFound();
  }

  // Calculate stats
  const totalChapters = story.chapters.length;
  const averageRating = story.reviews.length > 0 
    ? (story.reviews.reduce((acc, curr) => acc + curr.rating, 0) / story.reviews.length).toFixed(1)
    : "N/A";

  // Check if current user is logged in
  let loggedInUserId: string | null = null;
  let isBookmarked = false;
  let isLiked = false;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (token) {
    const decoded = verifyToken(token);
    if (decoded && decoded.userId) {
      loggedInUserId = decoded.userId;

      // Check bookmark status
      const bookmark = await db.bookmark.findUnique({
        where: {
          storyId_userId: {
            storyId: story.id,
            userId: decoded.userId,
          },
        },
      });
      isBookmarked = !!bookmark;

      // Check like status
      const like = await db.like.findUnique({
        where: {
          storyId_userId: {
            storyId: story.id,
            userId: decoded.userId,
          },
        },
      });
      isLiked = !!like;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-8 animate-fade-in">
        {/* Story details layout component */}
        <StoryDetailsClient
          story={JSON.parse(JSON.stringify(story))}
          loggedInUserId={loggedInUserId}
          isBookmarkedInitially={isBookmarked}
          isLikedInitially={isLiked}
          averageRating={averageRating}
          totalChapters={totalChapters}
        />
      </main>
    </div>
  );
}
