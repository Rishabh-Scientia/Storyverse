import React from "react";
import Navbar from "@/components/layout/navbar";
import { Award, Flame, Trophy, Calendar, Users, Feather, BookOpen, Star, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ChallengesPage() {
  // Query top users for leaderboard based on reading streaks or published stories
  const topWriters = await db.user.findMany({
    where: { role: "WRITER" },
    take: 3,
    orderBy: { streakDays: "desc" },
    include: {
      _count: { select: { stories: true } },
    },
  });

  const activeChallenges = [
    {
      title: "Solstice Scribe Marathon",
      type: "Writing Challenge",
      description: "Write and publish a short story of at least 1,500 words before the summer solstice ends.",
      participants: "420 writers active",
      deadline: "Ends in 6 days",
      reward: "Solstice Writer Badge + 100 Streak Points",
      color: "from-amber-500 to-orange-500",
    },
    {
      title: "Cyberpunk Chronicle Anthology",
      type: "Anthology Contest",
      description: "Submit a chapter for the official Neon Whispers community compilation book.",
      participants: "180 netrunners signed up",
      deadline: "Ends in 15 days",
      reward: "Verification status review + Story Spotlight placement",
      color: "from-violet-600 to-fuchsia-600",
    },
    {
      title: "Midnight Soliloquies Poetry Slam",
      type: "Poetry Challenge",
      description: "Publish 3 new poems with the tag #midnight before the clock strikes July.",
      participants: "95 poets active",
      deadline: "Ends in 12 days",
      reward: "Melancholy Quill Trophy on profile",
      color: "from-pink-500 to-rose-500",
    },
  ];

  const readerMilestones = [
    { name: "First Steps", desc: "Unlock by reading your first chapter", icon: "🌱", done: true },
    { name: "Streak Starter", desc: "Read for 3 consecutive days", icon: "🔥", done: true },
    { name: "Library Curator", desc: "Save 5 stories to your bookmarks list", icon: "📚", done: false },
    { name: "Critic's Choice", desc: "Publish at least 3 detailed book reviews", icon: "✍️", done: false },
    { name: "Premium Patron", desc: "Unlock a paid chapter using subscriber model", icon: "💎", done: false },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-8 h-8 text-amber-500 fill-amber-500/10" />
            Writing Challenges & Milestones
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Participate in weekly community writing contests, complete reading streaks, and unlock profile trophy badges.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Challenges Feed */}
          <section className="lg:col-span-2 space-y-6">
            <h2 className="font-bold text-slate-850 dark:text-slate-100 text-lg uppercase tracking-wide">
              Active Community Contests
            </h2>

            <div className="space-y-6">
              {activeChallenges.map((challenge, i) => (
                <div
                  key={i}
                  className="glass rounded-3xl border border-slate-200/50 dark:border-slate-800/40 p-6 flex flex-col md:flex-row gap-6 shadow-sm hover:border-violet-500/20 transition-all duration-300"
                >
                  {/* Badge side */}
                  <div className={`w-full md:w-44 shrink-0 rounded-2xl bg-gradient-to-tr ${challenge.color} p-5 text-white flex flex-col justify-between shadow-md`}>
                    <div>
                      <span className="text-[10px] font-bold uppercase opacity-80 tracking-wider">
                        {challenge.type}
                      </span>
                      <h3 className="font-bold text-sm leading-tight mt-1">
                        {challenge.title}
                      </h3>
                    </div>
                    <span className="text-[10px] font-semibold flex items-center gap-1 mt-4">
                      <Calendar className="w-3 h-3" />
                      {challenge.deadline}
                    </span>
                  </div>

                  {/* Info side */}
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-semibold">
                        {challenge.description}
                      </p>
                      <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                        <Users className="w-3.5 h-3.5" />
                        <span>{challenge.participants}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200/50 dark:border-slate-850/50 mt-4 flex justify-between items-center">
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase">Rewards</span>
                        <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {challenge.reward}
                        </span>
                      </div>
                      <Link
                        href="/dashboard/writer"
                        className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 rounded-xl text-xs font-bold shadow hover:scale-102 transition-all"
                      >
                        Enter Challenge
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Sidebar Leaderboards & Milestones */}
          <aside className="space-y-8">
            {/* Leaders of streaks */}
            <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm">
              <h2 className="font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2 mb-4 text-xs uppercase tracking-wider">
                <Flame className="w-4.5 h-4.5 text-amber-500" />
                Streak Leaderboard
              </h2>
              <div className="space-y-4">
                {topWriters.map((writer, index) => (
                  <div key={writer.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-4">#{index + 1}</span>
                      <img
                        src={writer.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                        alt={writer.username}
                        className="w-8 h-8 rounded-lg object-cover ring-2 ring-violet-500/5"
                      />
                      <div className="min-w-0">
                        <Link href={`/profile/${writer.username}`} className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:underline">
                          @{writer.username}
                        </Link>
                        <p className="text-[9px] text-slate-450 font-bold">{writer._count.stories} Published stories</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-550 dark:text-amber-400 flex items-center gap-1">
                      {writer.streakDays}🔥
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones list */}
            <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm">
              <h2 className="font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2 mb-4 text-xs uppercase tracking-wider">
                <Award className="w-4.5 h-4.5 text-violet-500" />
                Reader Milestones
              </h2>
              <div className="space-y-3.5">
                {readerMilestones.map((ms, i) => (
                  <div key={i} className={`flex items-start gap-3 ${!ms.done && "opacity-60"}`}>
                    <span className="text-2xl select-none">{ms.icon}</span>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs flex items-center gap-1 text-slate-800 dark:text-slate-200">
                        {ms.name}
                        {ms.done && <span className="text-[8px] bg-emerald-500/20 text-emerald-500 font-bold px-1 rounded-full">Done</span>}
                      </h4>
                      <p className="text-[9px] text-slate-450 mt-0.5 leading-tight font-semibold">
                        {ms.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
