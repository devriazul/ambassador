"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Payout {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  status: string;
  bank_details: {
    holder_name?: string;
    sort_code?: string;
    account_number?: string;
  } | null;
  gift_card_email: string | null;
  created_at: string;
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPayouts = async () => {
    try {
      const data = await api.get<Payout[]>("/admin/payouts");
      setPayouts(data);
    } catch (err) {
      console.error("Failed to load payouts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleUpdateStatus = async (payoutId: string, newStatus: "paid" | "cancelled") => {
    setProcessingId(payoutId);
    try {
      await api.put(`/admin/payouts/${payoutId}/status`, { status: newStatus });
      await fetchPayouts(); // Refresh table
    } catch (err) {
      console.error("Failed to update payout status", err);
      alert("Failed to update status.");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border border-slate-500/30";
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(val);
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Payout Requests</h1>
        <p className="text-slate-400">Process student ambassador cashout withdrawals (bank transfers &amp; Love2Shop gift cards).</p>
      </header>

      <div className="admin-card p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/5">
          <h3 className="font-bold text-white text-sm">Withdrawal Pipeline</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-white/5 border-b border-white/10">
              <tr>
                <th scope="col" className="p-4">Ambassador ID</th>
                <th scope="col" className="p-4">Requested Date</th>
                <th scope="col" className="p-4">Amount</th>
                <th scope="col" className="p-4">Method</th>
                <th scope="col" className="p-4">Payout Details</th>
                <th scope="col" className="p-4">Status</th>
                <th scope="col" className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <i className="fa-solid fa-circle-notch animate-spin text-orange-500"></i>
                  </td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 text-sm">
                    No payout withdrawal requests found.
                  </td>
                </tr>
              ) : (
                payouts.map((pt) => (
                  <tr key={pt.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 text-xs font-mono text-slate-400 truncate max-w-[120px]">{pt.user_id}</td>
                    <td className="p-4 text-slate-400">{new Date(pt.created_at).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-white">{formatCurrency(pt.amount)}</td>
                    <td className="p-4 text-slate-300 capitalize">{pt.payment_method.replace("_", " ")}</td>
                    <td className="p-4 text-xs">
                      {pt.payment_method === "bank_transfer" && pt.bank_details ? (
                        <div className="text-slate-400 space-y-0.5">
                          <div><strong className="text-slate-300">Holder:</strong> {pt.bank_details.holder_name}</div>
                          <div><strong className="text-slate-300">Sort:</strong> {pt.bank_details.sort_code}</div>
                          <div><strong className="text-slate-300">Acc:</strong> {pt.bank_details.account_number}</div>
                        </div>
                      ) : pt.payment_method === "gift_card" ? (
                        <div><strong className="text-slate-300">Email:</strong> {pt.gift_card_email}</div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`status-badge text-[10px] ${getStatusColor(pt.status)}`}>
                        {pt.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {pt.status === "pending" && (
                        <div className="flex items-center gap-2">
                          {processingId === pt.id ? (
                            <i className="fa-solid fa-circle-notch animate-spin text-orange-500"></i>
                          ) : (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(pt.id, "paid")}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Mark Paid
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(pt.id, "cancelled")}
                                className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Reject / Cancel
                              </button>
                            </>
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
