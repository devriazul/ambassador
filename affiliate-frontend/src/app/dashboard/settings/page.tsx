"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [password, setPassword] = useState("");
  
  // Bank Details
  const [holderName, setHolderName] = useState(user?.bank_details?.holder_name || "");
  const [sortCode, setSortCode] = useState(user?.bank_details?.sort_code || "");
  const [accountNumber, setAccountNumber] = useState(user?.bank_details?.account_number || "");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const payload: any = {
        full_name: fullName,
      };
      if (password) {
        payload.password = password;
      }
      const data = await api.put<any>("/auth/settings", payload);
      setMessage({ type: "success", text: "Profile information updated successfully!" });
      setPassword("");
      await refreshUser();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const payload = {
        bank_details: {
          holder_name: holderName,
          sort_code: sortCode,
          account_number: accountNumber,
        },
      };
      await api.put<any>("/auth/settings", payload);
      setMessage({ type: "success", text: "Bank account settings updated!" });
      await refreshUser();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update bank account details." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-black text-white">Account Settings</h1>
        <p className="text-slate-400">Update your personal details and payout preferences.</p>
      </header>

      {message && (
        <div className={`p-4 rounded-xl text-sm mb-6 ${message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Config */}
        <form onSubmit={handleUpdateProfile} className="student-card space-y-4">
          <h3 className="font-bold text-white mb-6 border-b border-white/10 pb-2">Profile Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="student-input w-full"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">University Email (Read-only)</label>
            <input
              type="email"
              disabled
              className="student-input w-full bg-slate-800 text-slate-500 border-white/5 cursor-not-allowed"
              value={user.email}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Update Password (Optional)</label>
            <input
              type="password"
              placeholder="Leave blank to keep current"
              className="student-input w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="student-btn bg-blue-600 hover:bg-blue-500 text-white mt-4"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>

        {/* Payout Details */}
        <form onSubmit={handleUpdateBank} className="student-card space-y-4">
          <h3 className="font-bold text-white mb-6 border-b border-white/10 pb-2">Bank Details</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Account Holder Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Alexander Morgan"
              className="student-input w-full"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Sort Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="20-45-14"
                className="student-input w-full"
                value={sortCode}
                onChange={(e) => setSortCode(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Account Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="12345678"
                className="student-input w-full"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="student-btn bg-blue-600 hover:bg-blue-500 text-white mt-4"
          >
            {loading ? "Updating..." : "Update Bank Info"}
          </button>
        </form>
      </div>
    </div>
  );
}
