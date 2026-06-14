"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Referral {
  id: string;
  referrer_id: string;
  lead_name: string;
  lead_email: string;
  lead_phone: string;
  education_interest: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReferrals = async () => {
    try {
      const data = await api.get<Referral[]>("/admin/referrals");
      setReferrals(data);
    } catch (err) {
      console.error("Failed to load referrals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleStatusChange = async (referralId: string, newStatus: string) => {
    setUpdatingId(referralId);
    try {
      await api.put(`/admin/referrals/${referralId}/status`, { status: newStatus });
      await fetchReferrals(); // Refresh list to get updated statuses/rewards
    } catch (err) {
      console.error("Failed to update referral status", err);
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClawback = async (referralId: string) => {
    if (!window.confirm("Are you sure you want to reverse this enrolment reward? This will debit the ambassador's wallet.")) return;
    setUpdatingId(referralId);
    try {
      await api.post(`/admin/referrals/${referralId}/clawback`, {});
      await fetchReferrals();
      alert("Clawback applied successfully.");
    } catch (err) {
      console.error("Failed to apply clawback", err);
      alert("Failed to apply clawback.");
    } finally {
      setUpdatingId(null);
    }
  };

  const isClawbackAllowed = (ref: Referral) => {
    if (ref.status !== "enrolled_home" && ref.status !== "enrolled_international") return false;
    const enrolledDate = new Date(ref.updated_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - enrolledDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 14;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "enrolled_home":
      case "enrolled_international":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      case "validated":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "submitted":
        return "bg-slate-500/20 text-slate-300 border border-slate-500/30";
      case "application_submitted":
      case "offer_made":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border border-slate-500/30";
    }
  };

  const statuses = [
    { value: "submitted", label: "Submitted" },
    { value: "validated", label: "Validated Lead (£5)" },
    { value: "application_submitted", label: "Application Submitted" },
    { value: "offer_made", label: "Offer Made" },
    { value: "enrolled_home", label: "Enrolled student (£500)" },
    { value: "rejected", label: "Rejected / Invalid" },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-black text-white">Lead Referrals</h1>
        <p className="text-slate-400">Validate submitted student referral leads, update recruitment pipelines, and confirm enrolments.</p>
      </header>

      <div className="admin-card p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/5">
          <h3 className="font-bold text-white text-sm">Submitted Referral Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-white/5 border-b border-white/10">
              <tr>
                <th scope="col" className="p-4">Lead Details</th>
                <th scope="col" className="p-4">Referrer (Ambassador)</th>
                <th scope="col" className="p-4">Interest</th>
                <th scope="col" className="p-4">Submitted Date</th>
                <th scope="col" className="p-4">Current Status</th>
                <th scope="col" className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <i className="fa-solid fa-circle-notch animate-spin text-orange-500"></i>
                  </td>
                </tr>
              ) : referrals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">
                    No lead referrals found in database.
                  </td>
                </tr>
              ) : (
                referrals.map((ref) => (
                  <tr key={ref.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div className="font-bold text-white">{ref.lead_name}</div>
                      <div className="text-xs text-slate-400">{ref.lead_email}</div>
                      <div className="text-[10px] text-slate-500">{ref.lead_phone || "No phone"}</div>
                    </td>
                    <td className="p-4 text-xs font-mono text-slate-400 truncate max-w-[120px]">
                      {ref.referrer_id}
                    </td>
                    <td className="p-4 text-slate-300">{ref.education_interest || "-"}</td>
                    <td className="p-4 text-slate-400">
                      {new Date(ref.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`status-badge text-[10px] ${getStatusColor(ref.status)}`}>
                        {ref.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4">
                      {updatingId === ref.id ? (
                        <i className="fa-solid fa-circle-notch animate-spin text-orange-500"></i>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            className="admin-input py-1 text-xs text-slate-300 border-white/10"
                            value={ref.status}
                            onChange={(e) => handleStatusChange(ref.id, e.target.value)}
                          >
                            {statuses.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                          {isClawbackAllowed(ref) && (
                            <button
                              onClick={() => handleClawback(ref.id)}
                              className="px-2.5 py-1 text-[10px] font-bold uppercase bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors border border-red-500/20"
                              title="Clawback enrolment reward within 14-day cooling-off period"
                            >
                              Clawback
                            </button>
                          )}
                        </div>
                      )}
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
