"use client";
 
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
 
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
 
  if (loading) {
    return (
      <div className="bg-slate-900 text-slate-200 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch animate-spin text-3xl text-blue-500 mb-4"></i>
          <p className="text-slate-400 text-sm">Loading Ambassador Portal...</p>
        </div>
      </div>
    );
  }
 
  if (!user) return null;
 
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
 
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "fa-chart-pie" },
    { name: "Referrals", path: "/dashboard/referrals", icon: "fa-user-plus" },
    { name: "Reviews", path: "/dashboard/reviews", icon: "fa-star" },
    { name: "Wallet & Payouts", path: "/dashboard/wallet", icon: "fa-wallet" },
    { name: "Settings", path: "/dashboard/settings", icon: "fa-gear" },
  ];
 
  return (
    <div className={`${theme} bg-slate-900 text-slate-200 flex h-screen overflow-hidden`}>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:flex w-64 bg-slate-950/80 border-r border-white/10 p-6 flex-shrink-0 flex flex-col">
        <div className="flex flex-col gap-1 mb-8">
          <div className="bg-white px-3 py-2.5 rounded-xl flex items-center justify-center shadow-md">
            <img src="/logo.png" alt="BHE UNI Logo" className="h-8 w-auto object-contain" />
          </div>
          <span className="text-blue-400 font-extrabold text-[10px] tracking-widest uppercase text-center mt-1">
            Ambassador Panel
          </span>
        </div>
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-link ${isActive ? "student-nav-link-active" : ""}`}
              >
                <i className={`fa-solid ${item.icon}`}></i> {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar/Drawer (hidden on desktop) */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        
        {/* Slide-out drawer content */}
        <aside
          className={`absolute top-0 left-0 bottom-0 w-64 bg-slate-950 p-6 border-r border-white/10 flex flex-col transition-transform duration-300 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col gap-1">
              <div className="bg-white px-3 py-2.5 rounded-xl flex items-center justify-center shadow-md">
                <img src="/logo.png" alt="BHE UNI Logo" className="h-8 w-auto object-contain" />
              </div>
              <span className="text-blue-400 font-extrabold text-[10px] tracking-widest uppercase text-center mt-1">
                Ambassador Panel
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-slate-400 hover:text-white p-2 text-lg transition-colors"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`nav-link ${isActive ? "student-nav-link-active" : ""}`}
                >
                  <i className={`fa-solid ${item.icon}`}></i> {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>
      </div>
 
      {/* Main Content Container with Header */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-white/10 px-4 sm:px-8 flex items-center justify-between bg-slate-950/40">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white p-2 -ml-2 transition-colors"
            aria-label="Toggle Menu"
          >
            <i className="fa-solid fa-bars text-xl"></i>
          </button>
          <div></div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="text-slate-450 hover:text-blue-500 hover:bg-slate-800/20 p-2 rounded-lg transition-all flex items-center justify-center cursor-pointer"
              aria-label="Toggle Theme"
              type="button"
            >
              {theme === "dark" ? (
                <i className="fa-solid fa-sun text-base text-yellow-500"></i>
              ) : (
                <i className="fa-solid fa-moon text-base text-slate-600"></i>
              )}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                {getInitials(user.full_name)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-white font-bold text-xs leading-none">{user.full_name}</p>
                <p className="text-slate-500 text-[10px] mt-0.5 capitalize">{user.tier} Ambassador</p>
              </div>
            </div>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-blue-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <i className="fa-solid fa-right-from-bracket"></i> Log Out
            </button>
          </div>
        </header>
 
        {/* Main Content Pane */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}
