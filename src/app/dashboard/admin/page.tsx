import React from "react";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth-helper";
import { ShieldCheck, Users, BookOpen, AlertOctagon, MessageSquare, Trash2, Heart, CheckCircle2, Lock, Star } from "lucide-react";
import AdminClient from "./admin-client";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId || decoded.role !== "ADMIN") {
    // Restrict access to administrators only
    redirect("/");
  }

  // Fetch users list
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { stories: true } },
    },
  });

  // Fetch stories list
  const stories = await db.story.findMany({
    orderBy: { reads: "desc" },
    include: {
      author: { select: { username: true } },
    },
  });

  // Fetch recent comments for moderation
  const comments = await db.comment.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { username: true, avatarUrl: true } },
      story: { select: { title: true } },
    },
  });

  // Summarize aggregates
  const totalUsers = users.length;
  const totalStories = stories.length;
  const totalReads = stories.reduce((acc, curr) => acc + curr.reads, 0);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-8 animate-fade-in">
        {/* Admin Dashboard header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Admin Control Center</h1>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Verify creators, manage publishing directories, and moderate community discussions.
            </p>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
            <Users className="w-8 h-8 text-violet-500" />
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Registered Users</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">{totalUsers}</span>
            </div>
          </div>
          <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
            <BookOpen className="w-8 h-8 text-blue-500" />
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Manuscripts Published</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">{totalStories}</span>
            </div>
          </div>
          <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
            <AlertOctagon className="w-8 h-8 text-amber-500" />
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Total System Reads</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">{totalReads}</span>
            </div>
          </div>
        </div>

        {/* Client Subcomponent controller to switch/moderate */}
        <AdminClient
          initialUsers={JSON.parse(JSON.stringify(users))}
          initialStories={JSON.parse(JSON.stringify(stories))}
          initialComments={JSON.parse(JSON.stringify(comments))}
        />
      </main>
    </div>
  );
}
