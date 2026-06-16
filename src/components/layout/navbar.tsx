"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Sun, Moon, Search, Menu, X, BookOpen, Feather, LogOut, User as UserIcon, ShieldAlert } from "lucide-react";

export default function Navbar() {
  const { user, theme, toggleTheme, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Explore", href: "/discover" },
    { name: "Challenges", href: "/challenges" },
    { name: "Write", href: "/dashboard/writer" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-premium border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20 text-white font-bold text-lg">
                S
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-pink-400">
                StoryVerse
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 items-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search Bar */}
            <form action="/discover" method="GET" className="relative">
              <input
                type="text"
                name="search"
                placeholder="Search stories..."
                className="w-48 lg:w-64 pl-10 pr-4 py-1.5 rounded-xl text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
            </form>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* User Session */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-all duration-200"
                >
                  <img
                    src={user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                    alt={user.username}
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-violet-500/20"
                  />
                  <span className="text-sm font-semibold max-w-[100px] truncate">
                    {user.username}
                  </span>
                  {user.isVerified && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Verified Author"></span>
                  )}
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-premium shadow-xl border border-slate-200/50 dark:border-slate-800/50 py-2 z-20 transition-all duration-300">
                      <div className="px-4 py-2 border-b border-slate-200/50 dark:border-slate-800/50">
                        <p className="text-xs text-slate-400 dark:text-slate-500">Logged in as</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                          {user.email}
                        </p>
                        <p className="text-[10px] inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400">
                          Streak: {user.streakDays || 0} 🔥
                        </p>
                      </div>

                      <Link
                        href={`/profile/${user.username}`}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60 transition-all duration-200"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>

                      <Link
                        href="/dashboard/writer"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60 transition-all duration-200"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Feather className="w-4 h-4 text-slate-400" />
                        Writer Dashboard
                      </Link>

                      {user.role === "ADMIN" && (
                        <Link
                          href="/dashboard/admin"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-amber-600 hover:bg-slate-100 dark:text-amber-400 dark:hover:bg-slate-800/60 transition-all duration-200 font-medium"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <ShieldAlert className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200 border-t border-slate-200/50 dark:border-slate-800/50"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-md shadow-violet-500/15 hover:shadow-violet-500/25 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-all duration-200"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-all duration-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-premium border-b border-slate-200/50 dark:border-slate-800/50 py-4 px-4 transition-all duration-300">
          <form action="/discover" method="GET" className="relative mb-4">
            <input
              type="text"
              name="search"
              placeholder="Search stories..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          </form>

          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {user ? (
              <>
                <div className="h-px bg-slate-200/50 dark:bg-slate-800/50 my-2" />
                <Link
                  href={`/profile/${user.username}`}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile ({user.username})
                </Link>
                <Link
                  href="/dashboard/writer"
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Writer Dashboard
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/dashboard/admin"
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-amber-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <div className="h-px bg-slate-200/50 dark:bg-slate-800/50 my-2" />
                <Link
                  href="/login"
                  className="text-center px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
