import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth-helper";
import { Feather, BookOpen, Heart, Eye, Award, Sparkles, PlusCircle, AlertCircle, TrendingUp, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WriterDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    redirect("/login");
  }

  // Fetch author details and their stories
  const author = await db.user.findUnique({
    where: { id: decoded.userId },
    include: {
      stories: {
        include: {
          chapters: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!author) {
    redirect("/login");
  }

  // Calculate stats
  const totalReads = author.stories.reduce((acc, curr) => acc + curr.reads, 0);
  const totalLikes = author.stories.reduce((acc, curr) => acc + curr.likes, 0);
  const totalStories = author.stories.length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-8">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Feather className="w-8 h-8 text-violet-500" />
              Writer Dashboard
            </h1>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Manage your manuscripts, analyze performance, and access AI tools.
            </p>
          </div>
          <Link
            href="/dashboard/writer/new"
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/15 flex items-center justify-center gap-1.5 transform hover:-translate-y-0.5 transition-all duration-300"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            Publish New Story
          </Link>
        </div>

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Reads</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalReads}</span>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-450 flex items-center justify-center">
              <Heart className="w-6 h-6 fill-rose-500/10" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Likes</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalLikes}</span>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-650 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Published Works</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalStories}</span>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Streak Level</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{author.streakDays || 0} Days 🔥</span>
            </div>
          </div>
        </div>

        {/* Analytics Graph Simulation */}
        <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-850 dark:text-slate-100 flex items-center gap-1.5 text-sm uppercase tracking-wider">
              <BarChart3 className="w-4 h-4 text-violet-500" />
              Story Performance & Views Over Time
            </h3>
            <span className="text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full">
              Live updates
            </span>
          </div>

          {/* Simple Sparkline Graphics using pure Tailwind CSS columns */}
          <div className="h-48 flex items-end justify-between gap-2.5 pt-4 px-2">
            {[35, 48, 62, 54, 73, 90, 85, 110, 142, 130, 155, 182].map((val, idx) => (
              <div key={idx} className="flex-grow flex flex-col items-center group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold z-10 shadow-lg">
                  {val * 10} Views
                </div>
                <div
                  style={{ height: `${(val / 200) * 100}%` }}
                  className="w-full bg-gradient-to-t from-violet-500 to-fuchsia-500 rounded-t-lg group-hover:from-violet-400 group-hover:to-fuchsia-400 transition-all duration-300 shadow-sm"
                />
                <span className="text-[9px] text-slate-400 font-semibold mt-2">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stories Management List */}
        <div className="space-y-4">
          <h2 className="font-bold text-slate-850 dark:text-slate-100 text-lg uppercase tracking-wide">
            My Published Stories
          </h2>

          {author.stories.length === 0 ? (
            <div className="text-center py-20 glass rounded-3xl border border-slate-200/50 dark:border-slate-800/40">
              <Feather className="w-12 h-12 text-slate-300 dark:text-slate-800 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 dark:text-slate-350">You haven't published any stories yet</h3>
              <p className="text-slate-550 text-xs mt-1">
                Share your first manuscript and experience AI powered editor reviews!
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/writer/new"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600"
                >
                  Write Your First Story
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {author.stories.map((story) => (
                <div
                  key={story.id}
                  className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 hover:border-violet-500/20 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 transition-all duration-300"
                >
                  <div className="flex gap-4">
                    <img
                      src={story.coverUrl || "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400"}
                      alt={story.title}
                      className="w-16 h-20 rounded-lg object-cover ring-2 ring-violet-500/5 shadow-md"
                    />
                    <div>
                      <h3 className="font-bold text-slate-850 dark:text-slate-100 group-hover:text-violet-600">
                        {story.title}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        {story.storyType} • {story.genre} • {story.chapters.length} Chapters
                      </p>
                      
                      {/* Tags */}
                      <div className="flex gap-1.5 mt-2">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-[9px] font-bold">
                          {story.status}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[9px] font-bold">
                          {story.monetization}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI & Statistics panel for each story */}
                  <div className="w-full lg:w-auto grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-100/40 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
                    <div className="text-center md:px-4">
                      <span className="block text-xs font-bold text-slate-450 dark:text-slate-500 uppercase">Reads</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-white">{story.reads}</span>
                    </div>
                    <div className="text-center md:px-4 border-l border-slate-250/50 dark:border-slate-800/50">
                      <span className="block text-xs font-bold text-slate-450 dark:text-slate-500 uppercase">Likes</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-white">{story.likes}</span>
                    </div>
                    
                    {/* Trigger popover modal for AI Review */}
                    <div className="col-span-2 text-center md:px-4 border-l-0 md:border-l border-slate-250/50 dark:border-slate-800/50 flex flex-col justify-center items-center">
                      <span className="block text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase flex items-center gap-1">
                        <Sparkles className="w-3 h-3 animate-pulse" />
                        AI Editor Insights
                      </span>
                      <Link
                        href={`/stories/${story.id}#ai-insights`}
                        className="text-[10px] font-semibold text-slate-500 hover:text-violet-500 hover:underline mt-1"
                      >
                        View AI Reviews
                      </Link>
                    </div>
                  </div>

                  {/* Quick view link */}
                  <div className="shrink-0 w-full lg:w-auto flex gap-2">
                    <Link
                      href={`/stories/${story.id}`}
                      className="flex-grow lg:flex-grow-0 text-center px-4 py-2 border border-slate-250 dark:border-slate-800 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 hover:bg-slate-100"
                    >
                      View Cover
                    </Link>
                    <Link
                      href={`/stories/${story.id}/read`}
                      className="flex-grow lg:flex-grow-0 text-center px-4 py-2 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
                    >
                      Read Securely
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
