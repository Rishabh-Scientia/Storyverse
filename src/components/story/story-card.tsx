"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Heart, Star, Flame, Eye } from "lucide-react";

export interface StoryCardProps {
  story: {
    id: string;
    title: string;
    subtitle?: string | null;
    description: string;
    genre: string;
    storyType: string;
    coverUrl?: string | null;
    reads: number;
    likes: number;
    createdAt: Date | string;
    author: {
      username: string;
      avatarUrl?: string | null;
      isVerified?: boolean;
    };
    chapters?: any[];
    ratings?: { value: number }[];
  };
}

export default function StoryCard({ story }: StoryCardProps) {
  // Calculate reading time roughly: 1 min per 200 words
  const calculateReadingTime = () => {
    if (!story.chapters || story.chapters.length === 0) return "2 min read";
    const totalWords = story.chapters.reduce(
      (acc, chap) => acc + (chap.content?.split(/\s+/).length || 0),
      0
    );
    const mins = Math.max(1, Math.round(totalWords / 200));
    return `${mins} min read`;
  };

  // Calculate average rating
  const getAverageRating = () => {
    if (!story.ratings || story.ratings.length === 0) {
      return "N/A";
    }
    const sum = story.ratings.reduce((acc, curr) => acc + curr.value, 0);
    return (sum / story.ratings.length).toFixed(1);
  };

  return (
    <Link href={`/stories/${story.id}`} className="group block h-full">
      <div className="h-full rounded-2xl glass border border-slate-200/50 dark:border-slate-800/40 overflow-hidden flex flex-col hover:border-violet-500/30 dark:hover:border-violet-500/30 shadow-sm hover:shadow-xl hover:shadow-violet-500/5 dark:hover:shadow-black/40 transition-all duration-300 transform group-hover:-translate-y-1">
        {/* Cover Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900">
          <img
            src={story.coverUrl || "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400"}
            alt={story.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
            loading="lazy"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 dark:opacity-80" />

          {/* Tags over cover */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-600/90 text-white shadow-md">
              {story.genre}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-sm">
              {story.storyType}
            </span>
          </div>

          {/* Reading Time over cover */}
          <div className="absolute bottom-3 right-3 text-white text-[11px] font-semibold bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md">
            {calculateReadingTime()}
          </div>
        </div>

        {/* Info Content */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Author */}
          <div className="flex items-center gap-1.5 mb-2 text-xs text-slate-500 dark:text-slate-400">
            <img
              src={story.author.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
              alt={story.author.username}
              className="w-4 h-4 rounded-full object-cover"
            />
            <span className="font-semibold hover:underline">@{story.author.username}</span>
            {story.author.isVerified && (
              <span className="w-1 h-1 rounded-full bg-blue-500"></span>
            )}
          </div>

          {/* Title & Subtitle */}
          <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 line-clamp-1 transition-colors duration-200">
            {story.title}
          </h3>
          {story.subtitle && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1 mt-0.5">
              {story.subtitle}
            </p>
          )}

          {/* Description */}
          <p className="text-xs text-slate-600 dark:text-slate-350 line-clamp-2 mt-2 mb-4 flex-grow">
            {story.description}
          </p>

          {/* Stats Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-850/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-white transition-colors">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {story.reads >= 1000 ? `${(story.reads / 1000).toFixed(1)}k` : story.reads}
              </span>
              <span className="flex items-center gap-1 hover:text-rose-500 transition-colors">
                <Heart className="w-3.5 h-3.5 text-rose-500/80 fill-rose-500/10" />
                {story.likes}
              </span>
            </div>

            <div className="flex items-center gap-1 text-amber-500 bg-amber-500/5 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-md">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{getAverageRating()}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
