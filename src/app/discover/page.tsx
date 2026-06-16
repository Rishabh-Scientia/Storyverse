import React from "react";
import Navbar from "@/components/layout/navbar";
import StoryCard from "@/components/story/story-card";
import { db } from "@/lib/db";
import { Search, SlidersHorizontal, BookOpen, Compass, Info } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface DiscoverPageProps {
  searchParams: Promise<{
    search?: string;
    genre?: string;
    storyType?: string;
    language?: string;
    rating?: string;
    sortBy?: string;
  }>;
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const params = await searchParams;
  const searchQuery = params.search || "";
  const genreFilter = params.genre || "";
  const typeFilter = params.storyType || "";
  const languageFilter = params.language || "";
  const ratingFilter = params.rating || "";
  const sortBy = params.sortBy || "reads"; // default sort by popularity

  // 1. Build Prisma where query filters
  const whereClause: any = {
    status: "PUBLIC",
  };

  if (searchQuery) {
    whereClause.OR = [
      { title: { contains: searchQuery } },
      { subtitle: { contains: searchQuery } },
      { description: { contains: searchQuery } },
      { tags: { contains: searchQuery } },
    ];
  }

  if (genreFilter) {
    whereClause.genre = genreFilter;
  }

  if (typeFilter) {
    whereClause.storyType = typeFilter;
  }

  if (languageFilter) {
    whereClause.language = languageFilter;
  }

  if (ratingFilter) {
    whereClause.ageRating = ratingFilter;
  }

  // 2. Build Prisma order by
  const orderByClause: any = {};
  if (sortBy === "reads") {
    orderByClause.reads = "desc";
  } else if (sortBy === "likes") {
    orderByClause.likes = "desc";
  } else if (sortBy === "newest") {
    orderByClause.createdAt = "desc";
  }

  // 3. Query Database
  const stories = await db.story.findMany({
    where: whereClause,
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
    orderBy: orderByClause,
  });

  const genresList = ["Fantasy", "Sci-Fi", "Romance", "Poetry", "Sayari", "Article", "Mystery", "Adventure", "Thriller", "Horror", "Non-Fiction"];
  const storyTypes = ["Novel", "Short Story", "Poetry", "Sayari", "Article", "Comic", "Fan Fiction", "Educational Story", "Children's Story"];
  const languagesList = ["English", "Spanish", "French", "German", "Chinese", "Japanese"];
  const ratingsList = ["Everyone", "Teen", "Mature"];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm sticky top-24">
            <h2 className="font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2 mb-4 text-sm uppercase tracking-wide">
              <SlidersHorizontal className="w-4 h-4 text-violet-500" />
              Filter Stories
            </h2>

            {/* Filter form */}
            <form action="/discover" method="GET" className="space-y-4">
              {/* Keep search query inside the filters form */}
              {searchQuery && <input type="hidden" name="search" value={searchQuery} />}

              {/* Genre Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Genre</label>
                <select
                  name="genre"
                  defaultValue={genreFilter}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-350 focus:outline-none"
                >
                  <option value="">All Genres</option>
                  {genresList.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Story Type Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Story Type</label>
                <select
                  name="storyType"
                  defaultValue={typeFilter}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-350 focus:outline-none"
                >
                  <option value="">All Types</option>
                  {storyTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Language Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Language</label>
                <select
                  name="language"
                  defaultValue={languageFilter}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-350 focus:outline-none"
                >
                  <option value="">All Languages</option>
                  {languagesList.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Age Rating Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Age Rating</label>
                <select
                  name="rating"
                  defaultValue={ratingFilter}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-350 focus:outline-none"
                >
                  <option value="">All Ratings</option>
                  {ratingsList.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Sort By Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Sort By</label>
                <select
                  name="sortBy"
                  defaultValue={sortBy}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-350 focus:outline-none"
                >
                  <option value="reads">Most Reads</option>
                  {/* Sorting criteria */}
                  <option value="likes">Most Likes</option>
                  <option value="newest">New Releases</option>
                </select>
              </div>

              {/* Apply & Reset Buttons */}
              <div className="pt-2 flex gap-2">
                <Link
                  href="/discover"
                  className="flex-grow text-center py-2 px-3 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-850"
                >
                  Reset
                </Link>
                <button
                  type="submit"
                  className="flex-grow py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-sm"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </aside>

        {/* Search Results List */}
        <section className="flex-grow space-y-6">
          {/* Header search details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {searchQuery ? `Search Results for "${searchQuery}"` : "Discover Stories"}
              </h1>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Showing {stories.length} stories found based on filters.
              </p>
            </div>
            
            {/* Search Input inline */}
            <form action="/discover" method="GET" className="relative shrink-0 w-full sm:w-72">
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search text, author, tags..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
              />
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            </form>
          </div>

          {/* Results grid */}
          {stories.length === 0 ? (
            <div className="text-center py-24 glass rounded-3xl border border-slate-200/50 dark:border-slate-800/40">
              <Compass className="w-16 h-16 text-slate-300 dark:text-slate-800 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 dark:text-slate-350">No Stories Match Your Search</h3>
              <p className="text-slate-500 dark:text-slate-550 text-xs mt-1 max-w-sm mx-auto">
                Try expanding your search query, or select another genre or story type combination.
              </p>
              <div className="mt-6">
                <Link
                  href="/discover"
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-300"
                >
                  Clear Filters
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
