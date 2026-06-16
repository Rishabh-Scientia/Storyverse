import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import StoryCard from "@/components/story/story-card";
import { db } from "@/lib/db";
import { Feather, Compass, Award, TrendingUp, Sparkles, BookOpen, Users, CheckCircle, Quote } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch trending stories based on reads
  const trendingStories = await db.story.findMany({
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
        select: {
          content: true,
        },
      },
      ratings: true,
    },
    orderBy: { reads: "desc" },
    take: 6,
  });

  // Fetch featured authors (users who have published stories)
  const featuredAuthors = await db.user.findMany({
    where: {
      role: "WRITER",
    },
    take: 4,
    include: {
      _count: {
        select: {
          stories: true,
          followers: true,
        },
      },
    },
  });

  const popularGenres = [
    { name: "Fantasy", icon: "✨", count: "1.2k stories", color: "from-purple-500 to-indigo-600" },
    { name: "Sci-Fi", icon: "🚀", count: "850 stories", color: "from-blue-500 to-cyan-500" },
    { name: "Poetry", icon: "✍️", count: "600 stories", color: "from-pink-500 to-rose-500" },
    { name: "Romance", icon: "💖", count: "1.5k stories", color: "from-red-400 to-pink-500" },
    { name: "Mystery", icon: "🔍", count: "400 stories", color: "from-amber-500 to-orange-600" },
    { name: "Adventure", icon: "🗺️", count: "700 stories", color: "from-emerald-500 to-teal-600" },
  ];

  // Fetch exact statistics
  const readsAggregate = await db.story.aggregate({
    _sum: {
      reads: true,
    },
  });
  const totalReads = readsAggregate._sum.reads || 0;

  const writersCount = await db.user.count({
    where: { role: "WRITER" },
  });

  const readersCount = await db.user.count({
    where: { role: "USER" },
  });

  const formattedReads = totalReads >= 1000 
    ? `${(totalReads / 1000).toFixed(1)}K` 
    : `${totalReads}`;

  const stats = [
    { label: "Reads Logged", value: formattedReads, icon: <BookOpen className="w-5 h-5" /> },
    { label: "Writers Published", value: `${writersCount}`, icon: <Feather className="w-5 h-5" /> },
    { label: "Active Readers", value: `${readersCount}`, icon: <Users className="w-5 h-5" /> },
    { label: "Weekly Writing Contests", value: "8", icon: <Award className="w-5 h-5" /> },
  ];

  const testimonials = [
    {
      quote: "StoryVerse changed my writing career. The AI analysis helped me refine my content keywords, and the protected reader gives me absolute peace of mind.",
      author: "Jane Doe",
      role: "Fantasy Author",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    },
    {
      quote: "The reading interface is gorgeous. It feels just like reading on an e-reader device, distraction-free and perfectly styled for night-reading.",
      author: "Alex Scribe",
      role: "Poet & Reader",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Background radial gradient highlights for premium layout */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-violet-500/10 dark:bg-violet-600/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-1/4 w-[600px] h-[600px] rounded-full bg-fuchsia-500/10 dark:bg-fuchsia-600/5 blur-[150px] pointer-events-none -z-10" />

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/15 mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          The Future of Indie Publishing is Here
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] max-w-4xl mx-auto">
          Publish Your Stories. <br />
          <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-pink-400">
            Inspire Millions.
          </span>
        </h1>
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
          A premium self-publishing ecosystem for authors and readers. Integrated AI manuscript analytics, beautiful protected e-reading, and direct community engagement.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard/writer"
            className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25 dark:shadow-violet-950/20 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Feather className="w-4 h-4" />
            Start Writing
          </Link>
          <Link
            href="/discover"
            className="px-8 py-3.5 rounded-xl text-sm font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4" />
            Explore Stories
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 text-center shadow-sm hover:border-violet-500/20 transition-all duration-300"
            >
              <div className="mx-auto w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3">
                {stat.icon}
              </div>
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Stories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-sm tracking-wider uppercase mb-1">
              <TrendingUp className="w-4 h-4" />
              HOT & TRENDING
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Trending on StoryVerse
            </h2>
          </div>
          <Link
            href="/discover"
            className="text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline mt-2 sm:mt-0"
          >
            View all stories →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {trendingStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>

      {/* Genres Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Explore Popular Genres
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
            Dive into thousands of stories, categorized and filtered for your reading preference.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularGenres.map((genre, i) => (
            <Link
              key={i}
              href={`/discover?genre=${genre.name}`}
              className="group relative overflow-hidden rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-violet-500/20 text-center transition-all duration-300"
            >
              <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                {genre.icon}
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {genre.name}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
                {genre.count}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Authors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Meet Featured Authors
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
            The creative minds producing the highest-rated novels and stories on StoryVerse.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredAuthors.map((author) => (
            <Link
              key={author.id}
              href={`/profile/${author.username}`}
              className="group block"
            >
              <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 flex items-center gap-4 hover:border-violet-500/30 transition-all duration-300">
                <img
                  src={author.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                  alt={author.username}
                  className="w-14 h-14 rounded-xl object-cover ring-2 ring-violet-500/10 group-hover:ring-violet-500/30 transition-all"
                />
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-800 dark:text-slate-150 truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {author.username}
                    </h4>
                    {author.isVerified && (
                      <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1 font-semibold">
                    {author.bio || "StoryVerse Creator"}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                    <span>{author._count.stories} Stories</span>
                    <span>{author._count.followers} Followers</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full border-t border-slate-200/50 dark:border-slate-850/50">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            What Creators & Readers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((test, i) => (
            <div
              key={i}
              className="glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 relative shadow-sm"
            >
              <Quote className="absolute top-6 right-8 w-10 h-10 text-slate-200 dark:text-slate-800/40 -z-10" />
              <p className="text-slate-600 dark:text-slate-300 italic text-sm leading-relaxed mb-6">
                "{test.quote}"
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={test.avatar}
                  alt={test.author}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {test.author}
                  </h4>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">
                    {test.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-slate-100 dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-900 py-12 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-md">
              S
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">StoryVerse</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            © 2026 StoryVerse Inc. All rights reserved. Created with absolute premium precision.
          </p>
          <div className="flex gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link href="/discover" className="hover:underline">Explore</Link>
            <Link href="/dashboard/writer" className="hover:underline">Publish</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
