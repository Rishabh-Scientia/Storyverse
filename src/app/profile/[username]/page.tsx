import React from "react";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import StoryCard from "@/components/story/story-card";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth-helper";
import ProfileClient from "./profile-client";

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username).toLowerCase();

  // 1. Fetch user from DB
  const profileUser = await db.user.findUnique({
    where: { username: decodedUsername },
    include: {
      stories: {
        where: { status: "PUBLIC" },
        include: {
          author: {
            select: {
              username: true,
              avatarUrl: true,
              isVerified: true,
            },
          },
          chapters: {
            select: { content: true },
          },
          ratings: true,
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

  if (!profileUser) {
    notFound();
  }

  // Calculate aggregates
  const totalReads = profileUser.stories.reduce((acc, curr) => acc + curr.reads, 0);
  const totalLikes = profileUser.stories.reduce((acc, curr) => acc + curr.likes, 0);

  // 2. Identify logged in user to check if it's their own profile or follow state
  let loggedInUserId: string | null = null;
  let isFollowing = false;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (token) {
    const decoded = verifyToken(token);
    if (decoded && decoded.userId) {
      loggedInUserId = decoded.userId;

      // Check if logged in user is following this profile
      if (decoded.userId !== profileUser.id) {
        const followRecord = await db.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: decoded.userId,
              followingId: profileUser.id,
            },
          },
        });
        isFollowing = !!followRecord;
      }
    }
  }

  const isOwner = loggedInUserId === profileUser.id;

  const stats = {
    storiesCount: profileUser._count.stories,
    followersCount: profileUser._count.followers,
    followingCount: profileUser._count.following,
    totalReads,
    totalLikes,
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
        {/* Pass data to Client Component for dynamic toggles (follow / edit bio) */}
        <ProfileClient
          profileUser={JSON.parse(JSON.stringify(profileUser))}
          stats={stats}
          isOwner={isOwner}
          isInitiallyFollowing={isFollowing}
        />
      </main>
    </div>
  );
}
