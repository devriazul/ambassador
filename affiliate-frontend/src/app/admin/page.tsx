"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Activity {
  type: string;
  title: string;
  description: string;
  time: string;
}

interface Ambassador {
  full_name: string;
  email: string;
  total_earned: number;
  tier: string;
  wallet_balance: number;
}

interface AdminStats {
  total_referrals: number;
  referrals_this_week: number;
  pending_reviews: number;
  payouts_this_month: number;
  new_ambassadors: number;
  recent_activity: Activity[];
  top_ambassadors: Ambassador[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<{
    expired_submitted: number;
    expired_validated: number;
    expired_applications: number;
    expired_offers: number;
  } | null>(null);

  const fetchStats = async () => {
    try {
      const data = await api.get<AdminStats>("/admin/stats");
      setStats(data);
    } catch (err) {
      console.error("Failed to load admin dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCleanup = async () => {
    if (!window.confirm("Are you sure you want to run system cleanup? This will auto-reject and close expired leads according to compliance policies.")) return;
    setCleaningUp(true);
    setCleanupResult(null);
    try {
      const result = await api.post<{
        expired_submitted: number;
        expired_validated: number;
        expired_applications: number;
        expired_offers: number;
      }>("/admin/leads/cleanup", {});
      setCleanupResult(result);
      // Refresh stats after cleanup
      await fetchStats();
    } catch (err) {
      console.error("Failed to run lead cleanup", err);
      alert("Failed to run lead cleanup.");
    } finally {
      setCleaningUp(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(val);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "review":
        return { icon: "fa-star", bg: "bg-yellow-500/20 text-yellow-400" };
      case "referral":
        return { icon: "fa-graduation-cap", bg: "bg-emerald-500/20 text-emerald-400" };
      case "payout":
        return { icon: "fa-money-bill-transfer", bg: "bg-orange-500/20 text-orange-400" };
      default:
        return { icon: "fa-bell", bg: "bg-blue-500/20 text-blue-400" };
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "platinum":
        return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
      case "gold":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "silver":
        return "bg-slate-400/20 text-slate-300 border border-slate-400/30";
      default:
        return "bg-amber-600/20 text-amber-500 border border-amber-600/30";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fa-solid fa-circle-notch animate-spin text-2xl text-orange-500"></i>
      </div>
    );
  }

  if (!stats) return <p className="text-red-400">Failed to load administrator statistics.</p>;

  return (
    <div>
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Dashboard Overview</h1>
          <p className="text-slate-400">Welcome back, Administrator. Here's the programme summary.</p>
        </div>
        <button
          onClick={handleCleanup}
          disabled={cleaningUp}
          className="admin-btn bg-orange-600 hover:bg-orange-500 text-white flex items-center gap-2 text-xs font-bold"
        >
          {cleaningUp ? (
            <>
              <i className="fa-solid fa-circle-notch animate-spin"></i> Running...
            </>
          ) : (
            <>
              <i className="fa-solid fa-gears"></i> Clean Expired Leads
            </>
          )}
        </button>
      </header>

      {cleanupResult && (
        <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm flex items-center justify-between">
          <div>
            <span className="font-bold">System Maintenance Completed:</span> Expired leads processed:{" "}
            <span className="font-semibold text-white">{cleanupResult.expired_submitted}</span> submitted,{" "}
            <span className="font-semibold text-white">{cleanupResult.expired_validated}</span> contacted/validated,{" "}
            <span className="font-semibold text-white">{cleanupResult.expired_applications}</span> applications,{" "}
            <span className="font-semibold text-white">{cleanupResult.expired_offers}</span> offers.
          </div>
          <button onClick={() => setCleanupResult(null)} className="text-xs underline hover:text-white ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="admin-card">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-slate-300 text-sm">Total Referrals</h3>
            <div className="card-icon bg-blue-500/20 text-blue-400"><i className="fa-solid fa-users"></i></div>
          </div>
          <p className="text-3xl font-black text-white mt-4">{stats.total_referrals}</p>
          <p className="text-xs text-emerald-400 font-bold mt-1">+{stats.referrals_this_week} this week</p>
        </div>

        <div className="admin-card">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-slate-300 text-sm">Pending Reviews</h3>
            <div className="card-icon bg-yellow-500/20 text-yellow-400"><i className="fa-solid fa-star-half-stroke"></i></div>
          </div>
          <p className="text-3xl font-black text-white mt-4">{stats.pending_reviews}</p>
          <p className="text-xs text-slate-400 font-bold mt-1">Awaiting verification</p>
        </div>

        <div className="admin-card">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-slate-300 text-sm">Payouts processed</h3>
            <div className="card-icon bg-emerald-500/20 text-emerald-400"><i className="fa-solid fa-wallet"></i></div>
          </div>
          <p className="text-3xl font-black text-white mt-4">{formatCurrency(stats.payouts_this_month)}</p>
          <p className="text-xs text-slate-400 font-bold mt-1">This current month</p>
        </div>

        <div className="admin-card">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-slate-300 text-sm">New Ambassadors</h3>
            <div className="card-icon bg-orange-500/20 text-orange-400"><i className="fa-solid fa-user-plus"></i></div>
          </div>
          <p className="text-3xl font-black text-white mt-4">{stats.new_ambassadors}</p>
          <p className="text-xs text-slate-400 font-bold mt-1">Joined this week</p>
        </div>
      </div>

      {/* Grid: Activity and Top performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 admin-card">
          <h3 className="font-bold text-white mb-6">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recent_activity.length === 0 ? (
              <p className="text-slate-500 text-sm">No recent program activity found.</p>
            ) : (
              stats.recent_activity.map((activity, idx) => {
                const meta = getActivityIcon(activity.type);
                return (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${meta.bg}`}>
                      <i className={`fa-solid ${meta.icon}`}></i>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{activity.title}</p>
                      <p className="text-xs text-slate-400">{activity.description}</p>
                    </div>
                    <div className="ml-auto text-xs text-slate-500">
                      {activity.time ? new Date(activity.time).toLocaleDateString() : ""}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Ambassadors */}
        <div className="admin-card">
          <h3 className="font-bold text-white mb-6">Top Ambassadors</h3>
          <div className="space-y-4">
            {stats.top_ambassadors.length === 0 ? (
              <p className="text-slate-500 text-sm">No ambassadors registered yet.</p>
            ) : (
              stats.top_ambassadors.map((amb, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-xs">
                    {amb.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{amb.full_name}</p>
                    <p className="text-xs text-slate-400">{formatCurrency(amb.total_earned)} earned</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${getTierBadge(amb.tier)}`}>
                    {amb.tier}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
