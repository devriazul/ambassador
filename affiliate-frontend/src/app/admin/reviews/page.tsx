"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Review {
  id: string;
  user_id: string;
  platform: string;
  review_link: string;
  screenshot_url: string | null;
  status: string;
  reward_amount: number;
  created_at: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const data = await api.get<Review[]>("/admin/reviews");
      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews list", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (reviewId: string, newStatus: "approved" | "rejected") => {
    setProcessingId(reviewId);
    try {
      await api.put(`/admin/reviews/${reviewId}/status`, { status: newStatus });
      await fetchReviews(); // Refresh table
    } catch (err) {
      console.error("Failed to process review status", err);
      alert("Failed to update review status.");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border border-slate-500/30";
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(val);
  };

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Review Approvals</h1>
        <p className="text-slate-400">Approve or reject student review link submissions to credit Level 1 (£10) Love2Shop voucher codes.</p>
      </header>

      <div className="admin-card p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/5">
          <h3 className="font-bold text-white text-sm">Review Verification Pipeline</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-white/5 border-b border-white/10">
              <tr>
                <th scope="col" className="p-4">Platform</th>
                <th scope="col" className="p-4">Ambassador ID</th>
                <th scope="col" className="p-4">Review Link</th>
                <th scope="col" className="p-4">Screenshot Link</th>
                <th scope="col" className="p-4">Reward Value</th>
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
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 text-sm">
                    No online reviews submitted for verification.
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 font-bold text-white capitalize">{rev.platform}</td>
                    <td className="p-4 text-xs font-mono text-slate-450 truncate max-w-[100px]">{rev.user_id}</td>
                    <td className="p-4">
                      <a
                        href={rev.review_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-450 hover:underline truncate max-w-xs block"
                      >
                        {rev.review_link}
                      </a>
                    </td>
                    <td className="p-4">
                      {rev.screenshot_url ? (
                        <a
                          href={`${API_BASE_URL}${rev.screenshot_url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-orange-450 hover:underline text-xs"
                        >
                          View Screenshot
                        </a>
                      ) : (
                        <span className="text-slate-500 text-xs">None</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-white">{formatCurrency(rev.reward_amount)}</td>
                    <td className="p-4">
                      <span className={`status-badge text-[10px] ${getStatusColor(rev.status)}`}>
                        {rev.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {rev.status === "pending" && (
                        <div className="flex items-center gap-2">
                          {processingId === rev.id ? (
                            <i className="fa-solid fa-circle-notch animate-spin text-orange-500"></i>
                          ) : (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(rev.id, "approved")}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(rev.id, "rejected")}
                                className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Reject
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
