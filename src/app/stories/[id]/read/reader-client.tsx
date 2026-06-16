"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sun, Moon, Type, Bookmark, Heart, ChevronLeft, ChevronRight, Share2, Sparkles, BookOpen, Lock } from "lucide-react";

interface ReaderClientProps {
  story: any;
  activeChapter: any;
  loggedInUserId: string | null;
  isBookmarkedInitially: boolean;
  chapterNo: number;
}

export default function ReaderClient({
  story,
  activeChapter,
  loggedInUserId,
  isBookmarkedInitially,
  chapterNo,
}: ReaderClientProps) {
  const router = useRouter();
  const readerRef = useRef<HTMLDivElement>(null);

  // States
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">("md");
  const [readerTheme, setReaderTheme] = useState<"light" | "dark" | "sepia">("dark");
  const [progress, setProgress] = useState(0);
  const [bookmarked, setBookmarked] = useState(isBookmarkedInitially);

  // 1. Hook to track scrolling progress
  useEffect(() => {
    const handleScroll = () => {
      if (!readerRef.current) return;
      const element = readerRef.current;
      const totalHeight = element.scrollHeight - element.clientHeight;
      if (totalHeight <= 0) return;
      const scrollPercent = Math.min(100, Math.round((element.scrollTop / totalHeight) * 100));
      setProgress(scrollPercent);
    };

    const element = readerRef.current;
    if (element) {
      element.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (element) {
        element.removeEventListener("scroll", handleScroll);
      }
    };
  }, [activeChapter]);

  // 2. Strict copyright protection rules (disabling copy actions)
  useEffect(() => {
    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      alert("Copying text from StoryVerse is restricted to protect author copyrights.");
    };

    const preventKeys = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+U, Ctrl+P, F12
      if (
        (e.ctrlKey && (e.key === "c" || e.key === "u" || e.key === "p" || e.key === "s")) ||
        e.key === "F12"
      ) {
        e.preventDefault();
        alert("Keyboard shortcuts are disabled in protected reader mode.");
      }
    };

    const preventContext = (e: MouseEvent) => {
      e.preventDefault();
      alert("Right-click is disabled to protect author copyrights.");
    };

    document.addEventListener("copy", preventCopy);
    document.addEventListener("keydown", preventKeys);
    document.addEventListener("contextmenu", preventContext);

    return () => {
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("keydown", preventKeys);
      document.removeEventListener("contextmenu", preventContext);
    };
  }, []);

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

  const getThemeClass = () => {
    if (readerTheme === "dark") return "bg-slate-950 text-slate-100";
    if (readerTheme === "sepia") return "bg-orange-50/90 text-amber-950 font-medium";
    return "bg-white text-slate-900";
  };

  const getFontClass = () => {
    if (fontSize === "sm") return "text-sm md:text-base";
    if (fontSize === "lg") return "text-lg md:text-xl";
    if (fontSize === "xl") return "text-xl md:text-2xl";
    return "text-base md:text-lg"; // medium default
  };

  const hasPrev = chapterNo > 1;
  const hasNext = chapterNo < story.chapters.length;

  return (
    <div className={`h-screen flex flex-col overflow-hidden transition-colors duration-300 ${getThemeClass()}`}>
      
      {/* Top Header Controls */}
      <header className="h-14 shrink-0 px-4 md:px-8 border-b border-slate-200/10 flex items-center justify-between glass-premium shadow-sm z-30">
        <div className="flex items-center gap-4">
          <Link
            href={`/stories/${story.id}`}
            className="p-1.5 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-slate-200 flex items-center gap-1 text-xs font-semibold"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
            Exit Reader
          </Link>
          <div className="h-4 w-px bg-slate-200/10 hidden sm:block" />
          <div className="hidden sm:block">
            <h1 className="text-xs font-bold text-slate-400 truncate max-w-[200px]">{story.title}</h1>
            <p className="text-[10px] text-slate-500 font-bold truncate max-w-[200px]">{activeChapter.title}</p>
          </div>
        </div>

        {/* Read Setting adjusters */}
        <div className="flex items-center gap-2">
          {/* Font Size Adjust */}
          <div className="flex items-center bg-slate-500/5 rounded-xl border border-slate-200/10 overflow-hidden">
            <button
              onClick={() => setFontSize("sm")}
              className={`px-2 py-1 text-[10px] font-bold ${fontSize === "sm" ? "bg-violet-600 text-white" : "text-slate-400"}`}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize("md")}
              className={`px-2.5 py-1 text-xs font-bold ${fontSize === "md" ? "bg-violet-600 text-white" : "text-slate-400"}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize("lg")}
              className={`px-2.5 py-1 text-sm font-bold ${fontSize === "lg" ? "bg-violet-600 text-white" : "text-slate-400"}`}
            >
              A+
            </button>
            <button
              onClick={() => setFontSize("xl")}
              className={`px-2 py-1 text-md font-bold ${fontSize === "xl" ? "bg-violet-600 text-white" : "text-slate-400"}`}
            >
              A++
            </button>
          </div>

          {/* Theme select dropdown */}
          <div className="flex bg-slate-500/5 rounded-xl border border-slate-200/10 overflow-hidden">
            <button
              onClick={() => setReaderTheme("light")}
              className={`p-1.5 ${readerTheme === "light" ? "bg-violet-600 text-white" : "text-slate-400"}`}
              title="Light Theme"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => setReaderTheme("sepia")}
              className={`px-2 py-1 text-[10px] font-bold ${readerTheme === "sepia" ? "bg-violet-600 text-white" : "text-slate-400"}`}
              title="Sepia Reading Filter"
            >
              Sepia
            </button>
            <button
              onClick={() => setReaderTheme("dark")}
              className={`p-1.5 ${readerTheme === "dark" ? "bg-violet-600 text-white" : "text-slate-400"}`}
              title="Dark Theme"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            className={`p-1.5 rounded-lg border border-slate-200/10 ${bookmarked ? "bg-violet-600/25 text-violet-500" : "text-slate-400"}`}
          >
            <Bookmark className={`w-4.5 h-4.5 ${bookmarked ? "fill-violet-500" : ""}`} />
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 shrink-0 w-full bg-slate-200/10 z-30">
        <div
          style={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-md shadow-violet-500/20 transition-all duration-200"
        />
      </div>

      {/* Main text pane (protected selection) */}
      <div
        ref={readerRef}
        className="flex-grow overflow-y-auto px-4 md:px-8 py-12 flex justify-center protected-reader"
      >
        <div className="max-w-2xl w-full space-y-6">
          {/* Chapter header */}
          <div className="text-center space-y-2 border-b border-slate-200/10 pb-6 mb-8">
            <span className="text-xs font-bold text-violet-500 uppercase tracking-widest">
              Chapter {activeChapter.chapterNo} of {story.chapters.length}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif">
              {activeChapter.title}
            </h2>
            <p className="text-[10px] text-slate-450 font-bold">
              Protected Reader Mode • Anti-Download Shield Enabled
            </p>
          </div>

          {/* Content Body */}
          <article className={`font-serif leading-relaxed space-y-6 select-none ${getFontClass()}`}>
            {activeChapter.content.split("\n\n").map((para: string, i: number) => (
              <p key={i} className="text-justify indent-4">
                {para}
              </p>
            ))}
          </article>

          {/* Chapter Navigation Controls */}
          <div className="flex justify-between items-center pt-10 border-t border-slate-200/10 mt-12 mb-8">
            {hasPrev ? (
              <Link
                href={`/stories/${story.id}/read?chapter=${chapterNo - 1}`}
                className="px-5 py-2.5 rounded-xl border border-slate-200/10 text-xs font-bold text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Chapter
              </Link>
            ) : (
              <div />
            )}

            <span className="text-[11px] text-slate-500 font-bold">
              Page {chapterNo} / {story.chapters.length}
            </span>

            {hasNext ? (
              <Link
                href={`/stories/${story.id}/read?chapter=${chapterNo + 1}`}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center gap-1 transition-all"
              >
                Next Chapter
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href={`/stories/${story.id}`}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1 transition-all"
              >
                Finish Reading
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
