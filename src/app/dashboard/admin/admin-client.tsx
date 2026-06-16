"use client";

import React, { useState } from "react";
import { Users, BookOpen, MessageSquare, Trash2, CheckCircle2, AlertCircle, ShieldAlert, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AdminClientProps {
  initialUsers: any[];
  initialStories: any[];
  initialComments: any[];
}

export default function AdminClient({ initialUsers, initialStories, initialComments }: AdminClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "stories" | "comments">("users");
  const [users, setUsers] = useState(initialUsers);
  const [stories, setStories] = useState(initialStories);
  const [comments, setComments] = useState(initialComments);
  const [loading, setLoading] = useState(false);

  const handleVerifyToggle = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(users.map(u => u.id === userId ? { ...u, isVerified: data.isVerified } : u));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryStatusToggle = async (storyId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stories/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId }),
      });
      if (res.ok) {
        const data = await res.json();
        setStories(stories.map(s => s.id === storyId ? { ...s, status: data.status } : s));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/comments/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });
      if (res.ok) {
        setComments(comments.filter(c => c.id !== commentId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs nav */}
      <div className="flex border-b border-slate-200/50 dark:border-slate-800/40">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-5 py-3 border-b-2 font-bold text-sm transition-all flex items-center gap-1.5 ${
            activeTab === "users"
              ? "border-violet-500 text-violet-650 dark:text-violet-400"
              : "border-transparent text-slate-500 hover:text-slate-750"
          }`}
        >
          <Users className="w-4 h-4" />
          Manage Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("stories")}
          className={`px-5 py-3 border-b-2 font-bold text-sm transition-all flex items-center gap-1.5 ${
            activeTab === "stories"
              ? "border-violet-500 text-violet-650 dark:text-violet-400"
              : "border-transparent text-slate-500 hover:text-slate-750"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Manage Stories ({stories.length})
        </button>
        <button
          onClick={() => setActiveTab("comments")}
          className={`px-5 py-3 border-b-2 font-bold text-sm transition-all flex items-center gap-1.5 ${
            activeTab === "comments"
              ? "border-violet-500 text-violet-650 dark:text-violet-400"
              : "border-transparent text-slate-500 hover:text-slate-750"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Moderate Comments ({comments.length})
        </button>
      </div>

      {/* Users Management Grid Table */}
      {activeTab === "users" && (
        <div className="glass rounded-2xl border border-slate-200/50 dark:border-slate-800/40 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="bg-slate-100/40 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Verified Status</th>
                  <th className="p-4">Published Works</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-850/50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/20 transition-all">
                    <td className="p-4 flex items-center gap-2.5">
                      <img src={user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} alt={user.username} className="w-7 h-7 rounded-full object-cover" />
                      <span className="font-bold text-slate-800 dark:text-slate-100">@{user.username}</span>
                    </td>
                    <td className="p-4 text-slate-500">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${user.role === "ADMIN" ? "bg-amber-500/10 text-amber-600" : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-350"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.isVerified ? (
                        <span className="text-blue-500 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-slate-400">Unverified</span>
                      )}
                    </td>
                    <td className="p-4 text-center">{user._count.stories}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleVerifyToggle(user.id)}
                        disabled={loading}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[10px] border transition-all ${
                          user.isVerified
                            ? "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
                            : "bg-blue-600 text-white border-transparent hover:bg-blue-500"
                        }`}
                      >
                        {user.isVerified ? "Revoke Badge" : "Verify Creator"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stories Management List */}
      {activeTab === "stories" && (
        <div className="glass rounded-2xl border border-slate-200/50 dark:border-slate-800/40 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="bg-slate-100/40 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Story Title</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Genre</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 text-center">Reads</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-850/50">
                {stories.map((story) => (
                  <tr key={story.id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/20 transition-all">
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-100">
                      <Link href={`/stories/${story.id}`} className="hover:underline">
                        {story.title}
                      </Link>
                    </td>
                    <td className="p-4 text-slate-500">@{story.author.username}</td>
                    <td className="p-4">{story.genre}</td>
                    <td className="p-4 text-slate-500">{story.storyType}</td>
                    <td className="p-4 text-center">{story.reads}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${story.status === "PUBLIC" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
                        {story.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleStoryStatusToggle(story.id)}
                        disabled={loading}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[10px] border transition-all ${
                          story.status === "PUBLIC"
                            ? "bg-rose-50 dark:bg-rose-950/20 border-transparent text-rose-600 hover:bg-rose-100"
                            : "bg-emerald-600 text-white border-transparent hover:bg-emerald-500"
                        }`}
                      >
                        {story.status === "PUBLIC" ? "Take Down / Restrict" : "Release Public"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Flagged/Comments moderation list */}
      {activeTab === "comments" && (
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-semibold glass rounded-2xl border">
              No recent discussions found to moderate.
            </div>
          ) : (
            comments.map((comm) => (
              <div
                key={comm.id}
                className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 hover:border-violet-500/15 flex items-start justify-between gap-6 transition-all duration-300"
              >
                <div className="flex gap-3 items-start">
                  <img src={comm.user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} alt={comm.user.username} className="w-8 h-8 rounded-full object-cover shrink-0" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">@{comm.user.username}</span>
                      <span className="text-[10px] text-slate-400">on story</span>
                      <span className="text-[10px] font-bold text-violet-650 dark:text-violet-400">"{comm.story.title}"</span>
                    </div>
                    <p className="text-xs text-slate-650 dark:text-slate-350 mt-1 font-medium italic">
                      "{comm.content}"
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleCommentDelete(comm.id)}
                  disabled={loading}
                  className="p-2.5 rounded-xl border border-rose-500/10 text-rose-550 hover:bg-rose-500/10 transition-all shadow-sm"
                  title="Delete/Moderate Comment"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
