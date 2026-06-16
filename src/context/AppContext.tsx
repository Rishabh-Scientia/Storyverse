"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserStats {
  storiesCount: number;
  followersCount: number;
  followingCount: number;
  totalReads: number;
  totalLikes: number;
}

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  bio: string | null;
  avatarUrl: string | null;
  socialLinks: string | null;
  isVerified: boolean;
  streakDays: number;
  stats?: UserStats;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
  login: (loginId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const router = useRouter();

  // Load theme and session on mount
  useEffect(() => {
    // 1. Load theme preference
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "dark";
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // 2. Fetch current user session
    refreshUser();
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to check auth status:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginId: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        router.refresh();
        return { success: true };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (err: any) {
      return { success: false, error: "An unexpected error occurred." };
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        router.refresh();
        return { success: true };
      } else {
        return { success: false, error: data.error || "Signup failed" };
      }
    } catch (err: any) {
      return { success: false, error: "An unexpected error occurred." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        theme,
        toggleTheme,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
