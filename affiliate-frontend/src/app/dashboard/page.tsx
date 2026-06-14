"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface Activity {
  id: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  created_at: string;
}

interface TierConfig {
  tier: string;
  leads_required: number;
  bonus_amount: number | string;
}

interface Stats {
  total_earned: number;
  wallet_balance: number;
  total_leads: number;
  total_enrolments: number;
  tier: string;
  leads_to_next_tier: number;
  referral_code: string;
  recent_activity: Activity[];
  tier_configs: TierConfig[];
}

interface VisualTier {
  key: string;
  label: string;
  threshold: number;
  bonus: string;
  bg: string;
  text: string;
  border: string;
  glow: string;
  perks: string[];
  icon: string;
}

const TIERS: VisualTier[] = [
  {
    key: "bronze",
    label: "BRONZE",
    threshold: 10,
    bonus: "£25",
    bg: "bg-amber-600/10",
    text: "text-amber-500",
    border: "border-amber-500/20",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.05)]",
    perks: ["Digital Certificate", "Bronze Badge", "Exclusive Training Access"],
    icon: "fa-medal",
  },
  {
    key: "silver",
    label: "SILVER",
    threshold: 25,
    bonus: "£100",
    bg: "bg-slate-400/10",
    text: "text-slate-300",
    border: "border-slate-400/20",
    glow: "shadow-[0_0_20px_rgba(148,163,184,0.05)]",
    perks: ["Silver Certificate", "Branded Hoodie", "Priority Support"],
    icon: "fa-medal",
  },
  {
    key: "gold",
    label: "GOLD",
    threshold: 50,
    bonus: "£250",
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/20",
    glow: "shadow-[0_0_25px_rgba(234,179,8,0.08)]",
    perks: ["Gold Certificate", "Social Media Feature", "VIP Event Invites"],
    icon: "fa-trophy",
  },
  {
    key: "platinum",
    label: "PLATINUM",
    threshold: 100,
    bonus: "£500",
    bg: "bg-cyan-400/10",
    text: "text-cyan-300",
    border: "border-cyan-400/20",
    glow: "shadow-[0_0_30px_rgba(34,211,238,0.12)]",
    perks: ["Platinum Excellence Award", "Hall of Fame Induction", "Annual Awards Ceremony"],
    icon: "fa-crown",
  },
];

const TIER_ORDER = ["standard", "bronze", "silver", "gold", "platinum"];

function getTierProgress(tier: string, leadsToNext: number, tierConfigs?: TierConfig[]) {
  if (tier === "platinum") {
    return { percent: 100, current: 100, target: 100, label: "Max tier reached! 🏆" };
  }
  const thresholds: Record<string, number> = { standard: 0, bronze: 10, silver: 25, gold: 50, platinum: 100 };
  if (tierConfigs) {
    tierConfigs.forEach((tc) => {
      thresholds[tc.tier] = Number(tc.leads_required);
    });
  }
  const nextTiers: Record<string, string> = { standard: "bronze", bronze: "silver", silver: "gold", gold: "platinum" };
  const nextTierKey = nextTiers[tier] ?? "bronze";
  const nextThreshold = thresholds[nextTierKey] ?? 10;
  const currentThreshold = thresholds[tier] ?? 0;
  const validLeads = nextThreshold - leadsToNext;
  const range = nextThreshold - currentThreshold;
  const progress = Math.max(0, Math.min(100, ((validLeads - currentThreshold) / range) * 100));

  return {
    percent: Math.round(progress),
    current: validLeads,
    target: nextThreshold,
    label: `${leadsToNext} valid leads to ${nextTierKey.toUpperCase()}`,
  };
}

export default function AmbassadorDashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userData, statsData] = await Promise.all([
          api.get<UserProfile>("/auth/me"),
          api.get<Stats>("/ambassador/stats"),
        ]);
        setProfile(userData);
        setStats(statsData);
      } catch (err) {
        console.error("Failed to load dashboard statistics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const copyLink = () => {
    if (!stats) return;
    const link = `https://bheuni.uk/apply?ref=${stats.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <i className="fa-solid fa-circle-notch animate-spin text-3xl text-orange-500"></i>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Loading Dashboard...</p>
      </div>
    );
  }

  if (!stats) return <p className="text-red-400">Failed to load statistics.</p>;

  const tierProgress = getTierProgress(stats.tier, stats.leads_to_next_tier, stats.tier_configs);
  const currentTierIndex = TIER_ORDER.indexOf(stats.tier);

  const dynamicTiers = TIERS.map((t) => {
    const apiConfig = stats?.tier_configs?.find((tc) => tc.tier === t.key);
    return {
      ...t,
      threshold: apiConfig ? Number(apiConfig.leads_required) : t.threshold,
      bonus: apiConfig ? `£${Number(apiConfig.bonus_amount).toFixed(0)}` : t.bonus,
    };
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(val);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "review_reward":
        return { icon: "fa-star", bg: "bg-yellow-500/20 text-yellow-400" };
      case "lead_reward":
        return { icon: "fa-user-plus", bg: "bg-blue-500/20 text-blue-400" };
      case "enrolment_reward":
        return { icon: "fa-graduation-cap", bg: "bg-emerald-500/20 text-emerald-400" };
      case "payout_withdrawal":
        return { icon: "fa-money-bill-transfer", bg: "bg-slate-500/20 text-slate-400" };
      case "bonus_reward":
        return { icon: "fa-trophy", bg: "bg-yellow-500/20 text-yellow-400" };
      default:
        return { icon: "fa-coins", bg: "bg-emerald-500/20 text-emerald-400" };
    }
  };

  const currentTierLabel = stats.tier === "standard" ? "Standard Tier" : `${stats.tier.toUpperCase()} MEMBER`;
  const currentTierColor =
    stats.tier === "platinum"
      ? "text-cyan-400 bg-cyan-400/10 border-cyan-400/20"
      : stats.tier === "gold"
      ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
      : stats.tier === "silver"
      ? "text-slate-300 bg-slate-300/10 border-slate-300/20"
      : stats.tier === "bronze"
      ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
      : "text-slate-400 bg-slate-400/10 border-slate-400/20";

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-2">
            Welcome back, {profile?.full_name.split(" ")[0]}! <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Here is your student ambassador performance overview.</p>
        </div>
        <div className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border uppercase tracking-wider ${currentTierColor}`}>
          <i className="fa-solid fa-trophy"></i>
          <span>{currentTierLabel}</span>
        </div>
      </div>

      {/* Referral Link Box */}
      <div className="student-card bg-gradient-to-r from-blue-900/10 via-blue-950/10 to-transparent border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.05)] p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="text-lg font-bold text-blue-300 flex items-center gap-2">
              <i className="fa-solid fa-share-nodes text-blue-500"></i>
              Your Unique Student Referral Link
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Share this recruitment link with your friends and prospective applicants. Referrals will automatically sync with your account to boost your wallet rewards and milestones.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-950 border border-white/10 rounded-xl p-2 w-full lg:w-auto">
            <code className="text-xs text-slate-300 px-3 truncate max-w-[260px] sm:max-w-xs font-bold font-mono">
              {`https://bheuni.uk/apply?ref=${stats.referral_code}`}
            </code>
            <button
              onClick={copyLink}
              className="student-btn bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs py-2.5 px-5 flex-shrink-0 w-full sm:w-auto justify-center flex items-center gap-2 shadow-lg shadow-blue-950/30 active:scale-95 transition-all"
            >
              {copied ? (
                <>
                  <i className="fa-solid fa-check text-xs"></i>
                  Copied!
                </>
              ) : (
                <>
                  <i className="fa-regular fa-copy text-xs"></i>
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Wallet Balance */}
        <div className="student-card hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Available Funds</p>
              <h3 className="text-3xl font-bold text-white mt-2 group-hover:text-blue-400 transition-colors">
                {formatCurrency(stats.wallet_balance)}
              </h3>
            </div>
            <div className="card-icon bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-all">
              <i className="fa-solid fa-wallet"></i>
            </div>
          </div>
          <div className="mt-6 border-t border-white/5 pt-4">
            <Link
              href="/dashboard/wallet"
              className="text-xs text-blue-400 group-hover:text-blue-300 font-bold flex items-center gap-1.5 transition-colors"
            >
              Request Withdrawal
              <i className="fa-solid fa-arrow-right-long text-[10px] group-hover:translate-x-1 transition-transform"></i>
            </Link>
          </div>
        </div>

        {/* Total Earned */}
        <div className="student-card hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Earnings</p>
              <h3 className="text-3xl font-bold text-white mt-2 group-hover:text-emerald-400 transition-colors">
                {formatCurrency(stats.total_earned)}
              </h3>
            </div>
            <div className="card-icon bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
              <i className="fa-solid fa-coins"></i>
            </div>
          </div>
          <div className="mt-6 border-t border-white/5 pt-4 flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-400/80 bg-emerald-400/5 border border-emerald-500/10 px-2 py-0.5 rounded-lg">
              Lifetime Earned
            </span>
            <i className="fa-solid fa-circle-nodes text-[10px] text-slate-600"></i>
          </div>
        </div>

        {/* Referrals */}
        <div className="student-card hover:border-orange-500/30 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Referrals</p>
              <h3 className="text-3xl font-bold text-white mt-2 group-hover:text-orange-400 transition-colors">
                {stats.total_leads}
              </h3>
            </div>
            <div className="card-icon bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20 transition-all">
              <i className="fa-solid fa-users"></i>
            </div>
          </div>
          <div className="mt-6 border-t border-white/5 pt-4">
            <span className="text-xs text-slate-400 font-bold">
              {stats.total_enrolments} Enrolled Referral{stats.total_enrolments !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Milestone gauge */}
        <div className="student-card hover:border-yellow-500/30 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Next Milestone</p>
              <h3 className="text-xl font-bold text-yellow-400 mt-2.5 capitalize group-hover:text-yellow-300 transition-colors">
                {stats.tier === "platinum" ? "Platinum Reached 👑" : `${TIER_ORDER[currentTierIndex + 1]} Progress`}
              </h3>
            </div>
            <div className="card-icon bg-yellow-500/10 text-yellow-400 group-hover:bg-yellow-500/20 transition-all">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
          </div>
          <div className="mt-6 border-t border-white/5 pt-4">
            <div className="flex items-center justify-between text-[10px] mb-1.5 font-bold">
              <span className="text-slate-400">Completion</span>
              <span className="text-white">{tierProgress.percent}%</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-yellow-500 to-amber-500"
                style={{ width: `${tierProgress.percent}%` }}
              ></div>
            </div>
            <p className="text-[9px] text-slate-500 mt-1 text-right truncate">{tierProgress.label}</p>
          </div>
        </div>
      </div>

      {/* Gamified Level Journey Mapping */}
      <div className="student-card border-white/5 bg-slate-950/20 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Ambassador Milestones</h3>
            <p className="text-xs text-slate-400 mt-1">Unlock larger cash bonuses and merchandise as you register validated leads.</p>
          </div>
          <div className="text-xs text-slate-400 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg font-bold">
            {tierProgress.current} lifetime validated leads
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dynamicTiers.map((tier) => {
            const tierIdx = TIER_ORDER.indexOf(tier.key);
            const isAchieved = currentTierIndex >= tierIdx;
            const isNext = currentTierIndex === tierIdx - 1;

            return (
              <div
                key={tier.key}
                className={`relative rounded-2xl p-5 border flex flex-col justify-between transition-all duration-500 ${tier.glow} ${
                  isAchieved
                    ? `${tier.bg} ${tier.border} border-opacity-60 scale-100`
                    : isNext
                    ? "bg-slate-900/60 border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.02)] scale-[1.02] ring-2 ring-blue-500/10"
                    : "bg-slate-950/30 border-white/5 opacity-40"
                }`}
              >
                {/* Badges / Status Indicator Icons */}
                {isAchieved && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-md">
                    <i className="fa-solid fa-check text-xs"></i>
                  </div>
                )}
                {isNext && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center border border-blue-500/30 shadow-md animate-pulse">
                    <i className="fa-solid fa-arrow-up text-xs"></i>
                  </div>
                )}
                {!isAchieved && !isNext && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-slate-900/40 text-slate-600 rounded-full flex items-center justify-center border border-white/5">
                    <i className="fa-solid fa-lock text-[10px]"></i>
                  </div>
                )}

                <div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg mb-6 bg-slate-900 border border-white/10 ${isAchieved ? tier.text : "text-slate-600"}`}>
                    <i className={`fa-solid ${tier.icon}`}></i>
                  </div>

                  <h4 className={`text-base font-bold tracking-wider uppercase ${isAchieved ? tier.text : "text-slate-500"}`}>
                    {tier.label}
                  </h4>
                  <p className="text-white font-semibold text-sm mt-1">{tier.threshold} leads threshold</p>
                  
                  {/* Perks Summary Checklist */}
                  <ul className="mt-4 space-y-2 border-t border-white/5 pt-4">
                    {tier.perks.map((perk, pi) => (
                      <li key={pi} className="flex items-center gap-2 text-[10px] text-slate-400 font-medium leading-normal">
                        <i className={`fa-solid fa-chevron-right text-[7px] ${isAchieved ? tier.text : "text-slate-600"}`}></i>
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bonus Cash</span>
                  <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-lg border ${
                    isAchieved 
                      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" 
                      : isNext 
                      ? "text-blue-400 bg-blue-400/10 border-blue-400/20" 
                      : "text-slate-500 bg-white/5 border-white/5"
                  }`}>
                    {isAchieved ? `✓ ${tier.bonus} Paid` : `${tier.bonus} reward`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="student-card border-white/5 bg-slate-950/20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Recent Wallet Transactions</h3>
            <p className="text-xs text-slate-400 mt-1">Full audit trail of your commission payouts, rewards, and withdrawals.</p>
          </div>
          <span className="text-xs text-slate-500 bg-white/5 rounded-lg px-3 py-1 font-bold">
            {stats.recent_activity.length} Entries
          </span>
        </div>

        <div className="space-y-4">
          {stats.recent_activity.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/20 border border-white/5 rounded-2xl">
              <i className="fa-solid fa-vault text-slate-600 text-3xl mb-3"></i>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">No Transaction Activity Logs</p>
            </div>
          ) : (
            stats.recent_activity.map((activity) => {
              const meta = getCategoryIcon(activity.category);
              const isDebit = activity.type === "debit";
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/30 border border-white/5 hover:border-white/10 hover:bg-slate-900/60 transition-all duration-300"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm ${meta.bg}`}>
                    <i className={`fa-solid ${meta.icon}`}></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white uppercase tracking-wider capitalize">
                      {activity.category.replace(/_/g, " ")}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-normal truncate max-w-[200px] sm:max-w-md">
                      {activity.description}
                    </p>
                  </div>
                  <div className="ml-auto text-right flex-shrink-0">
                    <div className={`font-bold text-sm ${isDebit ? "text-slate-500" : "text-emerald-400"}`}>
                      {isDebit ? "-" : "+"}{formatCurrency(activity.amount)}
                    </div>
                    <div className="text-[9px] font-bold text-slate-500 mt-1 font-mono">
                      {new Date(activity.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
