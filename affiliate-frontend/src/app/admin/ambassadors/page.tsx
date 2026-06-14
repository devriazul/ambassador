"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Ambassador {
  id: string;
  full_name: string;
  email: string;
  role: string;
  tier: string;
  referral_code: string;
  wallet_balance: number;
  total_earned: number;
  created_at: string;
}

export default function AdminAmbassadorsPage() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAmbassadors = async () => {
      try {
        const data = await api.get<Ambassador[]>("/admin/users");
        // Filter out admins from the ambassadors list
        setAmbassadors(data.filter(u => u.role !== "admin"));
      } catch (err) {
        console.error("Failed to load ambassadors list", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAmbassadors();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(val);
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

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-black text-white">Ambassadors</h1>
        <p className="text-slate-400">View and manage all registered student ambassadors and their program performance.</p>
      </header>

      <div className="admin-card p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/5">
          <h3 className="font-bold text-white text-sm">Ambassador Profiles</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-white/5 border-b border-white/10">
              <tr>
                <th scope="col" className="p-4">Ambassador Name</th>
                <th scope="col" className="p-4">Email</th>
                <th scope="col" className="p-4">Referral Code</th>
                <th scope="col" className="p-4">Tier Status</th>
                <th scope="col" className="p-4">Wallet Balance</th>
                <th scope="col" className="p-4">Total Earned</th>
                <th scope="col" className="p-4">Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <i className="fa-solid fa-circle-notch animate-spin text-orange-500"></i>
                  </td>
                </tr>
              ) : ambassadors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 text-sm">
                    No student ambassadors registered yet.
                  </td>
                </tr>
              ) : (
                ambassadors.map((amb) => (
                  <tr key={amb.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 font-bold text-white">{amb.full_name}</td>
                    <td className="p-4 text-slate-300">{amb.email}</td>
                    <td className="p-4"><code className="text-xs text-slate-400">{amb.referral_code}</code></td>
                    <td className="p-4">
                      <span className={`tier-badge text-[10px] uppercase ${getTierBadge(amb.tier)}`}>
                        {amb.tier}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-300">{formatCurrency(amb.wallet_balance)}</td>
                    <td className="p-4 font-black text-emerald-400">{formatCurrency(amb.total_earned)}</td>
                    <td className="p-4 text-slate-400">
                      {new Date(amb.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
