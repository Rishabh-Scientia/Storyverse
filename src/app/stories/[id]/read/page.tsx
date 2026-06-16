import React from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth-helper";
import ReaderClient from "./reader-client";

export const dynamic = "force-dynamic";

interface ReadPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    chapter?: string;
  }>;
}

export default async function ReadPage({ params, searchParams }: ReadPageProps) {
  const { id } = await params;
  const sParams = await searchParams;
  const chapterNo = sParams.chapter ? parseInt(sParams.chapter) : 1;

  // Fetch story and chapters
  const story = await db.story.findUnique({
    where: { id },
    include: {
      author: {
        select: { username: true, id: true },
      },
      chapters: {
        orderBy: { chapterNo: "asc" },
      },
    },
  });

  if (!story || story.chapters.length === 0) {
    notFound();
  }

  // Find active chapter
  const activeChapter = story.chapters.find((c) => c.chapterNo === chapterNo) || story.chapters[0];

  // 1. Check if user is logged in
  let loggedInUserId: string | null = null;
  let isBookmarked = false;

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

      // Update readers count when a user reads a chapter
      await db.story.update({
        where: { id },
        data: {
          reads: {
            increment: 1,
          },
        },
      });

      // Update reader streak days
      const readerRecord = await db.user.findUnique({ where: { id: decoded.userId } });
      if (readerRecord) {
        const today = new Date();
        const lastRead = readerRecord.lastReadDate ? new Date(readerRecord.lastReadDate) : null;
        let streak = readerRecord.streakDays;

        if (!lastRead) {
          streak = 1;
        } else {
          const diffTime = Math.abs(today.getTime() - lastRead.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            streak += 1;
          } else if (diffDays > 1) {
            streak = 1;
          }
        }

        await db.user.update({
          where: { id: decoded.userId },
          data: {
            streakDays: streak,
            lastReadDate: today,
          },
        });
      }
    }
  }

  return (
    <ReaderClient
      story={JSON.parse(JSON.stringify(story))}
      activeChapter={JSON.parse(JSON.stringify(activeChapter))}
      loggedInUserId={loggedInUserId}
      isBookmarkedInitially={isBookmarked}
      chapterNo={chapterNo}
    />
  );
}
