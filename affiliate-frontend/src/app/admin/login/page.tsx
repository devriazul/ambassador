"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark";
    if (saved) {
      setTheme(saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Invalid administrator credentials");
      setLoading(false);
    }
  };

  return (
    <div className={`${theme} bg-slate-900 text-slate-200 min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-950/20 via-slate-900 to-slate-950 relative overflow-hidden`}>
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          className="text-slate-450 hover:text-orange-500 bg-slate-900/40 border border-slate-800/80 p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-lg"
          aria-label="Toggle Theme"
          type="button"
        >
          {theme === "dark" ? (
            <i className="fa-solid fa-sun text-base text-yellow-500"></i>
          ) : (
            <i className="fa-solid fa-moon text-base text-slate-600"></i>
          )}
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-white font-extrabold text-2xl flex items-center justify-center gap-2 mb-4">
            <i className="fa-solid fa-graduation-cap text-orange-500"></i>
            BHE Uni Admin
          </Link>
          <h2 className="text-2xl font-bold text-white">Administrator Portal</h2>
          <p className="text-slate-400 text-xs mt-1">Process review rewards, validate referral leads, and verify payouts.</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-card space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Admin Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="admin@bheuni.ac.uk"
              className="admin-input w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="admin-input w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-btn bg-orange-600 hover:bg-orange-500 text-white w-full py-3 mt-4"
          >
            {loading ? "Logging in..." : "Administrator Access Log In →"}
          </button>

          <p className="text-center text-xs text-slate-500">
            <Link href="/" className="text-slate-400 hover:text-white underline">Back to Student Homepage</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
