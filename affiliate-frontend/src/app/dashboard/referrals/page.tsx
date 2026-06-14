"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Referral {
  id: string;
  lead_name: string;
  lead_email: string;
  lead_phone: string;
  education_interest: string;
  status: string;
  lead_reward_paid: boolean;
  enrolment_reward_paid: boolean;
  created_at: string;
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [course, setCourse] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchReferrals = async () => {
    try {
      const data = await api.get<Referral[]>("/ambassador/referrals");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await api.post("/ambassador/referrals", {
        lead_name: fullName,
        lead_email: email,
        lead_phone: phone,
        education_interest: course || undefined,
      });
      setMessage({ type: "success", text: "Referral lead submitted successfully!" });
      setFullName("");
      setEmail("");
      setPhone("");
      setCourse("");
      fetchReferrals(); // Refresh table
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to submit referral." });
    } finally {
      setSubmitting(false);
    }
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
        return "bg-red-500/20 text-red-400 border border-red-500/20";
      default:
        return "bg-slate-500/20 text-slate-300 border border-slate-500/30";
    }
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-black text-white">My Referrals</h1>
        <p className="text-slate-400">Submit new leads manually and track their application progress.</p>
      </header>

      {/* Submit Lead Form */}
      <div className="student-card mb-8">
        <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Submit a New Lead</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div className={`p-4 rounded-xl text-sm ${message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {message.text}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="student-input w-full"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                className="student-input w-full"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                className="student-input w-full"
                placeholder="07123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-slate-400 mb-1">Course / Education Interest</label>
              <input
                type="text"
                className="student-input w-full"
                placeholder="e.g. MSc Data Science, BSc Computer Science"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="student-btn bg-blue-600 hover:bg-blue-500 text-white w-full py-2.5"
              >
                {submitting ? "Submitting..." : "Submit Lead"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Referrals Table */}
      <div className="student-card p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/5">
          <h3 className="font-bold text-white text-sm">Lead Referral History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-white/5 border-b border-white/10">
              <tr>
                <th scope="col" className="p-4">Lead Name</th>
                <th scope="col" className="p-4">Contact Info</th>
                <th scope="col" className="p-4">Interest</th>
                <th scope="col" className="p-4">Submitted Date</th>
                <th scope="col" className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <i className="fa-solid fa-circle-notch animate-spin text-blue-500"></i>
                  </td>
                </tr>
              ) : referrals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                    No referrals submitted yet. Share your link or fill the form above!
                  </td>
                </tr>
              ) : (
                referrals.map((ref) => (
                  <tr key={ref.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 font-bold text-white">{ref.lead_name}</td>
                    <td className="p-4">
                      <div className="text-xs text-slate-300">{ref.lead_email}</div>
                      <div className="text-[10px] text-slate-500">{ref.lead_phone || "No phone"}</div>
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
