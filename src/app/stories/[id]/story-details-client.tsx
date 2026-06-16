"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, Heart, Star, Sparkles, MessageSquare, Calendar, ChevronRight, Bookmark, Lock, ShieldCheck, Check, Plus, AlertCircle, Share2, Send } from "lucide-react";
import { useRouter } from "next/navigation";

interface StoryDetailsClientProps {
  story: any;
  loggedInUserId: string | null;
  isBookmarkedInitially: boolean;
  isLikedInitially: boolean;
  averageRating: string;
  totalChapters: number;
}

export default function StoryDetailsClient({
  story,
  loggedInUserId,
  isBookmarkedInitially,
  isLikedInitially,
  averageRating,
  totalChapters,
}: StoryDetailsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"chapters" | "reviews" | "comments" | "ai">("chapters");
  const [liked, setLiked] = useState(isLikedInitially);
  const [likesCount, setLikesCount] = useState(story.likes);
  const [bookmarked, setBookmarked] = useState(isBookmarkedInitially);
  const [loading, setLoading] = useState(false);

  // New Comment input
  const [commentContent, setCommentContent] = useState("");
  const [commentList, setCommentList] = useState(story.comments);

  // New Review inputs
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewList, setReviewList] = useState(story.reviews);

  const handleLike = async () => {
    if (!loggedInUserId) {
      router.push("/login");
      return;
    }
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((prev: number) => nextLiked ? prev + 1 : prev - 1);
    
    try {
      const res = await fetch(`/api/stories/${story.id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLiked(data.liked);
          setLikesCount(data.likes);
        }
      } else {
        // Revert on error
        setLiked(liked);
        setLikesCount(likesCount);
      }
    } catch (err) {
      console.error(err);
      // Revert on error
      setLiked(liked);
      setLikesCount(likesCount);
    }
  };

  const handleBookmark = async () => {
    if (!loggedInUserId) {
      router.push("/login");
      return;
    }
    setBookmarked(!bookmarked);

    try {
      await fetch(`/api/stories/${story.id}/bookmark`, { method: "POST" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInUserId) {
      router.push("/login");
      return;
    }
    if (!commentContent.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/stories/${story.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentContent }),
      });

      if (res.ok) {
        const data = await res.json();
        setCommentList([data.comment, ...commentList]);
        setCommentContent("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInUserId) {
      router.push("/login");
      return;
    }
    if (!reviewTitle.trim() || !reviewContent.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/stories/${story.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: reviewTitle,
          content: reviewContent,
          rating: reviewRating,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReviewList([data.review, ...reviewList]);
        setReviewTitle("");
        setReviewContent("");
        setReviewRating(5);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Story link copied to clipboard!");
  };

  return (
    <div className="space-y-8">
      {/* Detail Hero Section */}
      <div className="relative rounded-3xl overflow-hidden glass border border-slate-200/50 dark:border-slate-800/40 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-lg">
        {/* Cover Art */}
        <div className="w-44 md:w-56 shrink-0 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-slate-900 ring-4 ring-violet-500/5">
          <img
            src={story.coverUrl || "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400"}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Info */}
        <div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left h-full justify-between">
          <div className="space-y-4">
            {/* Genre & Rating tags */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-violet-600/90 text-white shadow">
                {story.genre}
              </span>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-slate-250 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350">
                {story.storyType}
              </span>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-550 dark:text-rose-400">
                Rating: {story.ageRating}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {story.title}
            </h1>
            {story.subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {story.subtitle}
              </p>
            )}

            {/* Author details */}
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-slate-650 dark:text-slate-400 font-semibold">
              <span>By</span>
              <Link href={`/profile/${story.author.username}`} className="flex items-center gap-1.5 hover:underline">
                <img
                  src={story.author.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                  alt={story.author.username}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-slate-800 dark:text-white font-bold">@{story.author.username}</span>
              </Link>
              {story.author.isVerified && (
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />
              )}
            </div>

            {/* Stats list */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2 text-xs text-slate-500 dark:text-slate-400 font-bold">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-violet-500" />
                {story.reads} Reads
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500/10" />
                {likesCount} Likes
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {averageRating} Rating
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                {new Date(story.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Synopsis */}
            <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed max-w-3xl pt-2">
              {story.description}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-3 mt-6 pt-4 w-full justify-center md:justify-start">
            {/* Read Button */}
            <Link
              href={`/stories/${story.id}/read`}
              className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-md shadow-violet-500/15 flex items-center justify-center gap-1.5 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <BookOpen className="w-4.5 h-4.5" />
              Read Securely
            </Link>

            {/* Like Toggle */}
            <button
              onClick={handleLike}
              className={`p-3 rounded-xl border text-sm font-bold transition-all shadow-sm flex items-center justify-center ${
                liked
                  ? "bg-rose-500/15 text-rose-600 border-rose-500/25"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-500 hover:text-slate-800"
              }`}
              title="Like Story"
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-rose-500" : ""}`} />
            </button>

            {/* Bookmark Toggle */}
            <button
              onClick={handleBookmark}
              className={`p-3 rounded-xl border text-sm font-bold transition-all shadow-sm flex items-center justify-center ${
                bookmarked
                  ? "bg-violet-500/15 text-violet-600 border-violet-500/25"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-500 hover:text-slate-800"
              }`}
              title="Add to Bookmark Library"
            >
              <Bookmark className={`w-5 h-5 ${bookmarked ? "fill-violet-500" : ""}`} />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-850 text-slate-500 hover:text-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center"
              title="Share Story"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-200/50 dark:border-slate-800/40">
          <button
            onClick={() => setActiveTab("chapters")}
            className={`px-5 py-3 border-b-2 font-bold text-sm transition-all ${
              activeTab === "chapters"
                ? "border-violet-500 text-violet-600 dark:text-violet-400"
                : "border-transparent text-slate-500 hover:text-slate-750"
            }`}
          >
            Chapters ({totalChapters})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-5 py-3 border-b-2 font-bold text-sm transition-all ${
              activeTab === "reviews"
                ? "border-violet-500 text-violet-600 dark:text-violet-400"
                : "border-transparent text-slate-500 hover:text-slate-750"
            }`}
          >
            Reviews ({reviewList.length})
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`px-5 py-3 border-b-2 font-bold text-sm transition-all ${
              activeTab === "comments"
                ? "border-violet-500 text-violet-600 dark:text-violet-400"
                : "border-transparent text-slate-500 hover:text-slate-750"
            }`}
          >
            Comments ({commentList.length})
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            id="ai-insights"
            className={`px-5 py-3 border-b-2 font-bold text-sm transition-all flex items-center gap-1.5 ${
              activeTab === "ai"
                ? "border-violet-500 text-violet-650 dark:text-violet-400"
                : "border-transparent text-slate-500 hover:text-slate-750"
            }`}
          >
            <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" />
            AI Editor Review
          </button>
        </div>

        {/* Chapters Tab content */}
        {activeTab === "chapters" && (
          <div className="glass rounded-2xl border border-slate-200/50 dark:border-slate-800/40 overflow-hidden divide-y divide-slate-200/50 dark:divide-slate-850/50">
            {story.chapters.map((chapter: any, idx: number) => (
              <Link
                key={chapter.id}
                href={`/stories/${story.id}/read?chapter=${chapter.chapterNo}`}
                className="flex items-center justify-between p-4 hover:bg-slate-100/50 dark:hover:bg-slate-900/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:bg-violet-500/10 group-hover:text-violet-600">
                    {chapter.chapterNo}
                  </div>
                  <span className="text-sm font-bold text-slate-850 dark:text-slate-200 group-hover:text-violet-600 transition-colors">
                    {chapter.title}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        )}

        {/* Reviews Tab content */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            {/* Write a review box */}
            {loggedInUserId ? (
              <form onSubmit={handleReviewSubmit} className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Publish Book Review</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      required
                      placeholder="Review title (e.g. Masterful story!)..."
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 focus:outline-none"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                      <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                      <option value={3}>⭐⭐⭐ (3/5)</option>
                      <option value={2}>⭐⭐ (2/5)</option>
                      <option value={1}>⭐ (1/5)</option>
                    </select>
                  </div>
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="Share your detailed analysis of the characters, pace, and writing style..."
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center gap-1.5"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl text-center text-xs font-semibold text-slate-500">
                Please <Link href="/login" className="text-violet-500 hover:underline">login</Link> to publish reviews.
              </div>
            )}

            {/* List Reviews */}
            <div className="space-y-4">
              {reviewList.length === 0 ? (
                <div className="text-center py-10 text-xs font-semibold text-slate-500">
                  No reviews posted yet. Be the first to critique this story!
                </div>
              ) : (
                reviewList.map((review: any) => (
                  <div key={review.id} className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={review.user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                          alt={review.user.username}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-bold">@{review.user.username}</span>
                      </div>
                      <div className="flex gap-0.5 text-amber-500 text-xs">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <span key={i}>⭐</span>
                        ))}
                      </div>
                    </div>
                    <h4 className="font-bold text-xs text-slate-850 dark:text-slate-200 pt-1">{review.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                      {review.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Comments Tab content */}
        {activeTab === "comments" && (
          <div className="space-y-6">
            {/* Post comment box */}
            {loggedInUserId ? (
              <form onSubmit={handleCommentSubmit} className="relative flex items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder="Join the discussion, write a comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2.5 p-1.5 rounded-xl text-violet-500 hover:bg-violet-500/10 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl text-center text-xs font-semibold text-slate-500">
                Please <Link href="/login" className="text-violet-500 hover:underline">login</Link> to join the comments.
              </div>
            )}

            {/* List Comments */}
            <div className="space-y-4">
              {commentList.length === 0 ? (
                <div className="text-center py-10 text-xs font-semibold text-slate-500">
                  No comments yet. Write a comment to engage with the author!
                </div>
              ) : (
                commentList.map((comm: any) => (
                  <div key={comm.id} className="flex gap-3 items-start border-b border-slate-200/40 dark:border-slate-850/40 pb-4">
                    <img
                      src={comm.user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                      alt={comm.user.username}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">@{comm.user.username}</span>
                        <span className="text-[9px] text-slate-400 font-semibold">
                          {new Date(comm.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-650 dark:text-slate-350 mt-1 font-medium">
                        {comm.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* AI Editor Review Tab content */}
        {activeTab === "ai" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Story analysis cards */}
            <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 space-y-6">
              <h3 className="font-bold text-slate-850 dark:text-slate-100 text-lg flex items-center gap-1.5 border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
                <Sparkles className="w-5 h-5 text-violet-500 animate-pulse" />
                AI Manuscript Analyzer
              </h3>
              
              <div className="space-y-4">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Content Summary</span>
                  <p className="text-xs text-slate-650 dark:text-slate-300 mt-1 leading-relaxed font-semibold bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                    {story.aiSummary || "The AI is analyzing this manuscript."}
                  </p>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Metadata Tags</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(story.aiKeywords || story.tags || "draft").split(",").map((kw: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[10px] font-bold">
                        #{kw.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Safety & Content Rating Recommendation</span>
                  <p className="text-xs text-slate-650 dark:text-slate-300 mt-1 leading-normal font-semibold">
                    {story.aiContentRating || "Everyone"}
                  </p>
                </div>
              </div>
            </div>

            {/* Cover Analysis */}
            <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 space-y-6">
              <h3 className="font-bold text-slate-850 dark:text-slate-100 text-lg flex items-center gap-1.5 border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
                <Sparkles className="w-5 h-5 text-violet-500 animate-pulse" />
                AI Cover Design critique
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                  <div className="w-14 h-14 rounded-full bg-violet-500/10 text-violet-600 flex items-center justify-center font-bold text-xl">
                    88
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Design Score</h4>
                    <p className="text-[10px] text-slate-450 mt-0.5">High aesthetic compatibility rating.</p>
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Aesthetic Critiques & Improvement Advice</span>
                  <p className="text-xs text-slate-650 dark:text-slate-350 mt-1.5 leading-relaxed font-semibold bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-250/50 dark:border-slate-800/50">
                    {story.aiCoverReview || "No design review available."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
