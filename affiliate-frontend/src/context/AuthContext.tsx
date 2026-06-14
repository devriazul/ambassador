"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "student" | "admin";
  tier: "standard" | "bronze" | "silver" | "gold" | "platinum";
  referral_code: string;
  wallet_balance: number;
  total_earned: number;
  bank_details?: {
    holder_name?: string;
    sort_code?: string;
    account_number?: string;
  } | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = async () => {
    try {
      const userData = await api.get<User>("/auth/me");
      setUser(userData);
    } catch (err) {
      console.error("Failed to fetch user profile", err);
      logout();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await api.get<User>("/auth/me");
          setUser(userData);
        } catch (err) {
          console.error("Session expired or invalid token", err);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Protect routes and handle routing based on authentication & roles
  useEffect(() => {
    if (loading) return;

    const token = localStorage.getItem("token");
    const isDashboard = pathname.startsWith("/dashboard");
    const isAdmin = pathname.startsWith("/admin") && pathname !== "/admin/login";

    if (!token) {
      if (isDashboard) {
        router.push("/login");
      } else if (isAdmin) {
        router.push("/admin/login");
      }
    } else if (user) {
      // Prevent students from entering admin portal, and vice versa
      if (user.role === "student" && isAdmin) {
        router.push("/dashboard");
      } else if (user.role === "admin" && isDashboard) {
        router.push("/admin");
      }
      // Redirect away from login pages if already logged in
      if (pathname === "/login") {
        router.push("/dashboard");
      } else if (pathname === "/admin/login") {
        router.push("/admin");
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await api.post<{ access_token: string; token_type: string }>("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", data.access_token);
      
      const userData = await api.get<User>("/auth/me");
      setUser(userData);
      setLoading(false);

      if (userData.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const loginWithGoogle = async (credential: string) => {
    setLoading(true);
    try {
      const data = await api.post<{ access_token: string; token_type: string }>("/auth/google", {
        credential,
      });
      localStorage.setItem("token", data.access_token);
      
      const userData = await api.get<User>("/auth/me");
      setUser(userData);
      setLoading(false);

      if (userData.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    if (pathname.startsWith("/admin")) {
      router.push("/admin/login");
    } else {
      router.push("/login");
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
