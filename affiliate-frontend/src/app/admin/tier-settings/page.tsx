"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface TierConfig {
  tier: "bronze" | "silver" | "gold" | "platinum";
  leads_required: number;
  bonus_amount: number | string;
  updated_at: string;
}

interface MetaDetails {
  label: string;
  icon: string;
  gradient: string;
  glow: string;
  text: string;
  border: string;
  desc: string;
  benefits: string[];
}

const TIER_META: Record<TierConfig["tier"], MetaDetails> = {
  bronze: {
    label: "Bronze Tier",
    icon: "fa-medal",
    gradient: "from-amber-600/20 via-amber-700/10 to-transparent",
    glow: "shadow-[0_0_30px_rgba(245,158,11,0.08)]",
    text: "text-amber-500",
    border: "border-amber-500/20 hover:border-amber-500/40",
    desc: "First level milestone. Perfect for active beginners starting their referral journey.",
    benefits: ["Digital Achievement Certificate", "Official Bronze Badge", "Exclusive Training Access"],
  },
  silver: {
    label: "Silver Tier",
    icon: "fa-medal",
    gradient: "from-slate-400/20 via-slate-500/10 to-transparent",
    glow: "shadow-[0_0_30px_rgba(148,163,184,0.08)]",
    text: "text-slate-300",
    border: "border-slate-400/20 hover:border-slate-400/40",
    desc: "Mid-level milestone. Rewards sustained activity and consistent engagement.",
    benefits: ["Silver Certificate", "Branded Hoodie & Polo", "Priority Student Support"],
  },
  gold: {
    label: "Gold Tier",
    icon: "fa-trophy",
    gradient: "from-yellow-500/20 via-yellow-600/10 to-transparent",
    glow: "shadow-[0_0_35px_rgba(234,179,8,0.12)]",
    text: "text-yellow-400",
    border: "border-yellow-500/20 hover:border-yellow-500/40",
    desc: "Elite level milestone. Unlocks VIP benefits, networks, and advanced publicity.",
    benefits: ["Gold Level Certificate", "Social Media Feature Spotlight", "VIP Event Invitations"],
  },
  platinum: {
    label: "Platinum Tier",
    icon: "fa-crown",
    gradient: "from-cyan-400/20 via-cyan-500/10 to-transparent",
    glow: "shadow-[0_0_40px_rgba(34,211,238,0.15)]",
    text: "text-cyan-300",
    border: "border-cyan-400/20 hover:border-cyan-400/40",
    desc: "Highest achievement. Celebrates top ambassador leaders in the BHE Uni network.",
    benefits: ["Platinum Excellence Award", "Hall of Fame Public Induction", "Annual Awards Ceremony Seat", "Priority Paid Campus Roles"],
  },
};

export default function TierSettingsPage() {
  const [configs, setConfigs] = useState<TierConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // Parameter states
  const [formLeads, setFormLeads] = useState<Record<string, number>>({});
  const [formBonus, setFormBonus] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, { type: "success" | "error"; text: string } | null>>({});

  const fetchConfigs = async () => {
    try {
      const data = await api.get<TierConfig[]>("/admin/tier-configs");
      setConfigs(data);

      const leads: Record<string, number> = {};
      const bonuses: Record<string, number> = {};
      data.forEach((c) => {
        leads[c.tier] = Number(c.leads_required);
        bonuses[c.tier] = Number(c.bonus_amount);
      });
      setFormLeads(leads);
      setFormBonus(bonuses);
    } catch (err) {
      console.error("Failed to load tier configurations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleSaveConfig = async (tier: TierConfig["tier"]) => {
    const leadsVal = formLeads[tier];
    const bonusVal = formBonus[tier];

    if (leadsVal === undefined || bonusVal === undefined) return;
    if (leadsVal <= 0) {
      setResults((prev) => ({
        ...prev,
        [tier]: { type: "error", text: "Leads required must be greater than 0" },
      }));
      return;
    }
    if (bonusVal < 0) {
      setResults((prev) => ({
        ...prev,
        [tier]: { type: "error", text: "Bonus amount cannot be negative" },
      }));
      return;
    }

    setSaving((prev) => ({ ...prev, [tier]: true }));
    setResults((prev) => ({ ...prev, [tier]: null }));

    try {
      const updated = await api.put<TierConfig>(`/admin/tier-configs/${tier}`, {
        leads_required: leadsVal,
        bonus_amount: bonusVal,
      });

      setConfigs((prev) => prev.map((c) => (c.tier === tier ? updated : c)));
      setResults((prev) => ({
        ...prev,
        [tier]: { type: "success", text: "✓ Saved & Tiers recalculated!" },
      }));
    } catch (err: any) {
      setResults((prev) => ({
        ...prev,
        [tier]: { type: "error", text: err.message || "Failed to save configuration." },
      }));
    } finally {
      setSaving((prev) => ({ ...prev, [tier]: false }));
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(val);

  // Compute live visual roadmap coordinates
  const roadmaps = [
    { key: "standard", label: "Standard", leads: 0, bonus: 0, icon: "fa-user", text: "text-slate-400", bg: "bg-slate-800" },
    { key: "bronze", label: "Bronze", leads: formLeads.bronze ?? 10, bonus: formBonus.bronze ?? 25, icon: "fa-medal", text: "text-amber-500", bg: "bg-amber-950/40" },
    { key: "silver", label: "Silver", leads: formLeads.silver ?? 25, bonus: formBonus.silver ?? 100, icon: "fa-medal", text: "text-slate-300", bg: "bg-slate-800/40" },
    { key: "gold", label: "Gold", leads: formLeads.gold ?? 50, bonus: formBonus.gold ?? 250, icon: "fa-trophy", text: "text-yellow-400", bg: "bg-yellow-950/40" },
    { key: "platinum", label: "Platinum", leads: formLeads.platinum ?? 100, bonus: formBonus.platinum ?? 500, icon: "fa-crown", text: "text-cyan-300", bg: "bg-cyan-950/40" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header section with modern title card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-orange-500 font-semibold tracking-wider text-[10px] uppercase bg-orange-500/10 px-3 py-1 rounded-full">
            System Settings
          </span>
          <h1 className="text-4xl font-bold text-white tracking-tight mt-2">Ambassador Tier Settings</h1>
          <p className="text-slate-400 text-sm mt-1">
            Redefine the progression tiers, lead quotas, and financial milestones.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 border border-white/5 px-4 py-2.5 rounded-xl">
          <i className="fa-solid fa-clock-rotate-left text-orange-500"></i>
          <span>Auto-evaluates database-wide</span>
        </div>
      </div>

      {/* Dynamic Interactive Roadmap Timeline */}
      {!loading && (
        <div className="admin-card p-6 bg-slate-950/40 border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-slate-800 text-6xl pointer-events-none font-bold uppercase select-none">
            Preview
          </div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
            Live Interactive Roadmap Preview
          </h3>
          
          <div className="relative mt-8 mb-6">
            {/* Connector Line */}
            <div className="absolute top-5 left-4 right-4 h-1 bg-white/5 rounded-full z-0">
              <div className="h-full bg-gradient-to-r from-slate-700 via-yellow-600 to-cyan-500 rounded-full w-full opacity-60"></div>
            </div>

            {/* Nodes */}
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4">
              {roadmaps.map((node, i) => {
                const isChanged =
                  node.key !== "standard" &&
                  (configs.find((c) => c.tier === node.key)?.leads_required !== node.leads ||
                    Number(configs.find((c) => c.tier === node.key)?.bonus_amount) !== Number(node.bonus));

                return (
                  <div key={node.key} className="flex md:flex-col items-center gap-4 md:gap-2 flex-1 text-center group">
                    {/* Node Bubble */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm border transition-all duration-300 ${
                        isChanged
                          ? "border-orange-500 ring-4 ring-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.3)] scale-110"
                          : "border-white/10 group-hover:border-white/20"
                      } ${node.bg} ${node.text}`}
                    >
                      <i className={`fa-solid ${node.icon}`}></i>
                    </div>

                    {/* Metadata */}
                    <div className="text-left md:text-center">
                      <p className={`font-bold text-xs uppercase tracking-wide ${node.text}`}>
                        {node.label}
                        {isChanged && <span className="text-[8px] text-orange-400 font-semibold ml-1">Staged</span>}
                      </p>
                      <p className="text-white font-semibold text-sm mt-0.5">
                        {node.leads} Valid Lead{node.leads !== 1 ? "s" : ""}
                      </p>
                      <p className="text-[10px] text-emerald-400 font-bold mt-0.5">
                        {node.bonus > 0 ? `+ ${formatCurrency(node.bonus)} Reward` : "Baseline Entry"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <i className="fa-solid fa-circle-notch animate-spin text-orange-500 text-4xl"></i>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Retrieving Configurations...</p>
        </div>
      ) : (
        /* Overhauled Card Configurations Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {configs.map((config) => {
            const meta = TIER_META[config.tier];
            const originalLeads = Number(config.leads_required);
            const originalBonus = Number(config.bonus_amount);

            const currentLeads = formLeads[config.tier] ?? originalLeads;
            const currentBonus = formBonus[config.tier] ?? originalBonus;

            const isChanged = currentLeads !== originalLeads || currentBonus !== originalBonus;
            const isSaving = saving[config.tier];
            const result = results[config.tier];

            return (
              <div
                key={config.tier}
                className={`admin-card border backdrop-blur-md relative overflow-hidden transition-all duration-500 flex flex-col justify-between ${meta.glow} ${
                  isChanged
                    ? "border-orange-500/40 bg-slate-900/60"
                    : "border-white/5 hover:border-white/10 bg-slate-950/20"
                }`}
              >
                {/* Background Gradient Accent Glow */}
                <div className={`absolute top-0 left-0 w-48 h-24 bg-gradient-to-br ${meta.gradient} blur-xl z-0 pointer-events-none`}></div>

                <div className="relative z-10">
                  {/* Card Header Section */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shadow-inner bg-slate-900 border border-white/10 ${meta.text}`}>
                        <i className={`fa-solid ${meta.icon}`}></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg tracking-tight capitalize">{meta.label}</h3>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Rule Specifications</span>
                      </div>
                    </div>

                    {isChanged && (
                      <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-400 text-[9px] font-bold uppercase px-2.5 py-1 rounded-lg border border-orange-500/20 shadow-sm animate-pulse">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                        Unsaved Changes
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
                    {meta.desc}
                  </p>

                  {/* Tactile Control Form Fields */}
                  <div className="space-y-6">
                    {/* Quota Control */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor={`leads-${config.tier}`} className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Leads Required
                        </label>
                        {isChanged && currentLeads !== originalLeads && (
                          <span className="text-[10px] font-bold text-orange-400 flex items-center gap-1">
                            {originalLeads} <i className="fa-solid fa-arrow-right text-[7px]"></i> {currentLeads}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Minus button */}
                        <button
                          type="button"
                          onClick={() =>
                            setFormLeads((prev) => ({
                              ...prev,
                              [config.tier]: Math.max(1, (prev[config.tier] ?? originalLeads) - 1),
                            }))
                          }
                          className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 flex items-center justify-center transition-all active:scale-90 hover:border-white/10"
                        >
                          <i className="fa-solid fa-minus text-xs"></i>
                        </button>

                        <div className="relative flex-1">
                          <i className="fa-solid fa-user-check absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                          <input
                            id={`leads-${config.tier}`}
                            type="number"
                            min={1}
                            className="admin-input pl-10 w-full text-center font-bold text-sm py-2"
                            value={currentLeads}
                            onChange={(e) =>
                              setFormLeads((prev) => ({
                                ...prev,
                                [config.tier]: parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>

                        {/* Plus button */}
                        <button
                          type="button"
                          onClick={() =>
                            setFormLeads((prev) => ({
                              ...prev,
                              [config.tier]: (prev[config.tier] ?? originalLeads) + 1,
                            }))
                          }
                          className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 flex items-center justify-center transition-all active:scale-90 hover:border-white/10"
                        >
                          <i className="fa-solid fa-plus text-xs"></i>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1.5 font-medium leading-relaxed">
                        The cumulative validated referrals needed before dynamic status promotion triggers.
                      </p>
                    </div>

                    {/* Reward Amount Control */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor={`bonus-${config.tier}`} className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Cash Reward Bonus
                        </label>
                        {isChanged && currentBonus !== originalBonus && (
                          <span className="text-[10px] font-bold text-orange-400 flex items-center gap-1">
                            {formatCurrency(originalBonus)} <i className="fa-solid fa-arrow-right text-[7px]"></i> {formatCurrency(currentBonus)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Minus button */}
                        <button
                          type="button"
                          onClick={() =>
                            setFormBonus((prev) => ({
                              ...prev,
                              [config.tier]: Math.max(0, (prev[config.tier] ?? originalBonus) - 10),
                            }))
                          }
                          className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 flex items-center justify-center transition-all active:scale-90 hover:border-white/10"
                        >
                          <i className="fa-solid fa-minus text-xs"></i>
                        </button>

                        <div className="relative flex-1">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-semibold">£</span>
                          <input
                            id={`bonus-${config.tier}`}
                            type="number"
                            min={0}
                            step={5}
                            className="admin-input pl-8 w-full text-center font-bold text-sm py-2"
                            value={currentBonus}
                            onChange={(e) =>
                              setFormBonus((prev) => ({
                                ...prev,
                                [config.tier]: parseFloat(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>

                        {/* Plus button */}
                        <button
                          type="button"
                          onClick={() =>
                            setFormBonus((prev) => ({
                              ...prev,
                              [config.tier]: (prev[config.tier] ?? originalBonus) + 10,
                            }))
                          }
                          className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 flex items-center justify-center transition-all active:scale-90 hover:border-white/10"
                        >
                          <i className="fa-solid fa-plus text-xs"></i>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1.5 font-medium leading-relaxed">
                        One-time wallet balance credit awarded dynamically when student achieves this level.
                      </p>
                    </div>
                  </div>

                  {/* Level Rewards/Perks Checklist */}
                  <div className="mt-6 p-4 rounded-xl bg-slate-950/50 border border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                      Benefits & Recognition Awarded
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                      {meta.benefits.map((b, i) => (
                        <li key={i} className="flex items-center gap-2 font-medium">
                          <i className={`fa-solid fa-circle-check text-[9px] ${meta.text}`}></i>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-8 pt-4 border-t border-white/5 relative z-10">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      id={`save-config-${config.tier}`}
                      onClick={() => handleSaveConfig(config.tier)}
                      disabled={isSaving || !isChanged}
                      className={`px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 flex-grow ${
                        isChanged && !isSaving
                          ? "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg shadow-orange-950/20 active:scale-95"
                          : "bg-white/5 text-slate-600 cursor-not-allowed border border-white/5"
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <i className="fa-solid fa-circle-notch animate-spin text-xs"></i>
                          Recalculating...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-floppy-disk text-xs"></i>
                          Commit Settings
                        </>
                      )}
                    </button>

                    {isChanged && (
                      <button
                        onClick={() => {
                          setFormLeads((prev) => ({ ...prev, [config.tier]: originalLeads }));
                          setFormBonus((prev) => ({ ...prev, [config.tier]: originalBonus }));
                          setResults((prev) => ({ ...prev, [config.tier]: null }));
                        }}
                        className="px-3.5 py-3 rounded-xl text-xs font-bold transition-all bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 active:scale-95"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {result && (
                    <div className="mt-3">
                      <div
                        className={`text-xs font-bold flex items-center gap-2 px-3 py-2.5 rounded-lg border ${
                          result.type === "success"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}
                      >
                        <i
                          className={`fa-solid ${
                            result.type === "success" ? "fa-circle-check" : "fa-circle-exmark"
                          } text-sm`}
                        ></i>
                        <span>{result.text}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
