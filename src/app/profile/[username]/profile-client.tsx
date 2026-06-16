"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import StoryCard from "@/components/story/story-card";
import { Edit2, ShieldCheck, Globe, BookOpen, Flame, Heart, Users, Award, BookMarked, Save, X, PlusCircle, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation"; // Just keeping import context matching


interface ProfileClientProps {
  profileUser: any;
  stats: {
    storiesCount: number;
    followersCount: number;
    followingCount: number;
    totalReads: number;
    totalLikes: number;
  };
  isOwner: boolean;
  isInitiallyFollowing: boolean;
}

export default function ProfileClient({ profileUser, stats, isOwner, isInitiallyFollowing }: ProfileClientProps) {
  const { refreshUser } = useApp();
  const router = useRouter();
  
  // State variables
  const [activeTab, setActiveTab] = useState<"stories" | "about" | "lists">("stories");
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
  const [followersCount, setFollowersCount] = useState(stats.followersCount);
  const [loading, setLoading] = useState(false);

  // Edit fields
  const [username, setUsername] = useState(profileUser.username);
  const [bio, setBio] = useState(profileUser.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profileUser.avatarUrl || "");
  
  // Parse social links
  let initialSocials = { twitter: "", website: "", instagram: "" };
  try {
    if (profileUser.socialLinks) {
      initialSocials = { ...initialSocials, ...JSON.parse(profileUser.socialLinks) };
    }
  } catch (e) {}
  
  const [socials, setSocials] = useState(initialSocials);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFollow = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: profileUser.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.following);
        setFollowersCount(prev => data.following ? prev + 1 : Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          bio,
          avatarUrl,
          socialLinks: socials,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
        await refreshUser();
        // Redirect to new username path if username changed
        if (username.toLowerCase() !== profileUser.username) {
          router.push(`/profile/${username}`);
        } else {
          router.refresh();
        }
      } else {
        setError(data.error || "Failed to update profile.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Badge list logic based on achievements
  const badges = [
    { name: "First Steps", desc: "Signed up to StoryVerse", icon: "🌱", active: true },
    { name: "Verified Creator", desc: "Verified publisher profile", icon: "💎", active: profileUser.isVerified },
    { name: "Streak Reader", desc: "Read 7+ consecutive days", icon: "🔥", active: profileUser.streakDays >= 7 },
    { name: "Novelist", desc: "Published a novel", icon: "📚", active: profileUser.stories.some((s: any) => s.storyType === "Novel") },
    { name: "Bestseller", desc: "Gained over 1,000 reads", icon: "👑", active: stats.totalReads >= 1000 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner profile header */}
      <div className="relative rounded-3xl overflow-hidden glass border border-slate-200/50 dark:border-slate-800/40 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-md">
        {/* Avatar */}
        <div className="relative group">
          <img
            src={avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
            alt={profileUser.username}
            className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover ring-4 ring-violet-500/10 shadow-lg"
          />
          {profileUser.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-lg shadow-md border border-white dark:border-slate-950" title="Verified Author">
              <ShieldCheck className="w-4 h-4 fill-white/10" />
            </div>
          )}
        </div>

        {/* User Info Details */}
        <div className="flex-grow text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
              @{profileUser.username}
            </h1>
            <div className="flex justify-center gap-2">
              {profileUser.isVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10">
                  Verified Author
                </span>
              )}
              {profileUser.role === "ADMIN" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10">
                  Staff
                </span>
              )}
            </div>
          </div>

          <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm max-w-2xl font-medium">
            {profileUser.bio || "No biography provided yet."}
          </p>

          {/* Social Icons list */}
          <div className="flex justify-center md:justify-start gap-4 mt-4 text-slate-500 dark:text-slate-400">
            {socials.twitter && (
              <a href={`https://twitter.com/${socials.twitter}`} target="_blank" className="hover:text-violet-500 transition-colors flex items-center gap-1.5 text-xs font-semibold">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter
              </a>
            )}
            {socials.website && (
              <a href={socials.website} target="_blank" className="hover:text-violet-500 transition-colors flex items-center gap-1 text-xs font-semibold">
                <Globe className="w-4 h-4" />
                Website
              </a>
            )}
          </div>
        </div>

        {/* Actions (Edit / Follow) */}
        <div className="flex gap-3 mt-4 md:mt-0 shrink-0">
          {isOwner ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 hover:border-violet-500/20 shadow-sm flex items-center gap-1.5 transition-all duration-300"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleFollow}
              disabled={loading}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all duration-300 flex items-center gap-1.5 ${
                isFollowing
                  ? "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-100 border border-slate-300/30 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20"
                  : "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-violet-500/10"
              }`}
            >
              {isFollowing ? (
                <>
                  <Check className="w-4 h-4" />
                  Following
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  Follow Author
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Grid Stats & Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Numeric stats */}
        <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center justify-around">
          <div className="text-center">
            <span className="block text-2xl font-extrabold text-slate-900 dark:text-white">{followersCount}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Followers</span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="text-center">
            <span className="block text-2xl font-extrabold text-slate-900 dark:text-white">{stats.followingCount}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Following</span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="text-center">
            <span className="block text-2xl font-extrabold text-slate-900 dark:text-white">{stats.storiesCount}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Stories</span>
          </div>
        </div>

        {/* Aggregates reads and likes */}
        <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center justify-around">
          <div className="text-center">
            <span className="block text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 justify-center">
              <BookOpen className="w-5 h-5 text-violet-500" />
              {stats.totalReads}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reads Logged</span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="text-center">
            <span className="block text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 justify-center">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              {stats.totalLikes}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Likes Received</span>
          </div>
        </div>

        {/* Achievements streak info */}
        <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center gap-4 px-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Flame className="w-6 h-6 fill-amber-500/10" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {profileUser.streakDays} Day Reading Streak!
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Read daily to keep the fire going and win achievements.
            </p>
          </div>
        </div>
      </div>

      {/* Editing Dialog Modal overlay */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-premium w-full max-w-lg rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Edit Profile Details</h2>
              <button onClick={() => setIsEditing(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/10 text-rose-500 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-450 dark:text-slate-450 uppercase tracking-wide">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 dark:text-slate-450 uppercase tracking-wide">Avatar Photo URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 dark:text-slate-450 uppercase tracking-wide">Biography</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-450 dark:text-slate-450 uppercase tracking-wide">Twitter Username</label>
                  <input
                    type="text"
                    value={socials.twitter}
                    onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="@handle"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-450 dark:text-slate-450 uppercase tracking-wide">Website URL</label>
                  <input
                    type="url"
                    value={socials.website}
                    onChange={(e) => setSocials({ ...socials, website: e.target.value })}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="https://mysite.com"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-200/50 dark:border-slate-800/40">
          <button
            onClick={() => setActiveTab("stories")}
            className={`px-6 py-3 border-b-2 font-bold text-sm transition-all ${
              activeTab === "stories"
                ? "border-violet-500 text-violet-600 dark:text-violet-400"
                : "border-transparent text-slate-500 hover:text-slate-750"
            }`}
          >
            Published Stories ({profileUser.stories.length})
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`px-6 py-3 border-b-2 font-bold text-sm transition-all ${
              activeTab === "about"
                ? "border-violet-500 text-violet-600 dark:text-violet-400"
                : "border-transparent text-slate-500 hover:text-slate-750"
            }`}
          >
            Achievements & Badges
          </button>
        </div>

        {/* Stories Tab */}
        {activeTab === "stories" && (
          <div>
            {profileUser.stories.length === 0 ? (
              <div className="text-center py-16 glass rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
                <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700 dark:text-slate-350">No Stories Published</h3>
                <p className="text-slate-500 dark:text-slate-550 text-xs mt-1">
                  This author hasn't shared any public manuscripts yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {profileUser.stories.map((story: any) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* About / Badges Tab */}
        {activeTab === "about" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Biography detail panel */}
            <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
              <h3 className="font-bold text-slate-850 dark:text-slate-100 text-lg mb-4">About the Author</h3>
              <p className="text-slate-650 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {profileUser.bio || "No biography provided yet."}
              </p>
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />
              <div className="flex flex-col gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                <p className="font-semibold">Joined StoryVerse on: {new Date(profileUser.createdAt).toLocaleDateString()}</p>
                <p className="font-semibold">Role account type: <span className="text-violet-500 capitalize">{profileUser.role.toLowerCase()}</span></p>
              </div>
            </div>

            {/* Badges items grid */}
            <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
              <h3 className="font-bold text-slate-850 dark:text-slate-100 text-lg mb-4 flex items-center gap-1.5">
                <Award className="w-5 h-5 text-violet-500" />
                Unlocked Achievements
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {badges.map((badge, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border flex gap-3 transition-all duration-300 ${
                      badge.active
                        ? "border-violet-500/10 bg-violet-500/5 text-slate-800 dark:text-slate-200"
                        : "border-slate-200 dark:border-slate-850 opacity-40 bg-slate-50 dark:bg-slate-900 text-slate-400"
                    }`}
                  >
                    <div className="text-2xl select-none shrink-0">{badge.active ? badge.icon : "🔒"}</div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs truncate">{badge.name}</h4>
                      <p className="text-[9px] font-semibold text-slate-450 dark:text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                        {badge.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
