"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Review {
  id: string;
  platform: string;
  review_link: string;
  screenshot_url: string | null;
  status: string;
  reward_amount: number;
  created_at: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [platform, setPlatform] = useState("");
  const [reviewLink, setReviewLink] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchReviews = async () => {
    try {
      const data = await api.get<Review[]>("/ambassador/reviews");
      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform) {
      setMessage({ type: "error", text: "Please select a platform." });
      return;
    }
    if (!screenshotFile) {
      setMessage({ type: "error", text: "Please upload a screenshot of your review." });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("platform", platform);
      formData.append("review_link", reviewLink || "");
      formData.append("screenshot", screenshotFile);

      await api.post("/ambassador/reviews", formData);

      setMessage({ type: "success", text: "Review submitted successfully! Awaiting administrator approval." });
      setPlatform("");
      setReviewLink("");
      setScreenshotFile(null);
      
      // Reset file input element
      const fileInput = document.getElementById("screenshot-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      fetchReviews(); // Refresh table
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to submit review." });
    } finally {
      setSubmitting(false);
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

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-black text-white">Online Reviews</h1>
        <p className="text-slate-400">Upload a screenshot of your reviews on Google, Trustpilot, or Facebook to earn £10 per review.</p>
      </header>

      {/* Submit Form */}
      <div className="student-card mb-8">
        <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Submit a Review Screenshot</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div className={`p-4 rounded-xl text-sm ${message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {message.text}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Select Platform <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="student-input w-full text-slate-300"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value="">Choose Platform</option>
                <option value="google">Google Review</option>
                <option value="trustpilot">Trustpilot</option>
                <option value="facebook">Facebook Review</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Review URL Link (Optional)
              </label>
              <input
                type="url"
                className="student-input w-full"
                placeholder="e.g. https://google.com/maps/reviews/..."
                value={reviewLink}
                onChange={(e) => setReviewLink(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Upload Review Screenshot <span className="text-red-500">*</span>
              </label>
              <input
                id="screenshot-upload"
                type="file"
                accept="image/*"
                required
                className="student-input w-full file:bg-blue-600/20 file:text-blue-400 file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-3 file:text-xs file:font-semibold hover:file:bg-blue-600/30 cursor-pointer"
                onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="student-btn bg-blue-600 hover:bg-blue-500 text-white w-full py-2.5 cursor-pointer"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Reviews List */}
      <div className="student-card p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/5">
          <h3 className="font-bold text-white text-sm">Submitted Reviews</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-white/5 border-b border-white/10">
              <tr>
                <th scope="col" className="p-4">Platform</th>
                <th scope="col" className="p-4">Review Link</th>
                <th scope="col" className="p-4">Screenshot</th>
                <th scope="col" className="p-4">Submitted Date</th>
                <th scope="col" className="p-4">Reward</th>
                <th scope="col" className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <i className="fa-solid fa-circle-notch animate-spin text-blue-500"></i>
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">
                    No reviews submitted yet. Submit your links above to earn Level 1 rewards!
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 font-bold text-white capitalize">{rev.platform}</td>
                    <td className="p-4">
                      <a
                        href={rev.review_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:underline truncate max-w-xs block"
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
                          className="text-emerald-400 hover:underline inline-flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-image text-xs"></i> View Image
                        </a>
                      ) : (
                        <span className="text-slate-500">None</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-white">{formatCurrency(rev.reward_amount)}</td>
                    <td className="p-4">
                      <span className={`status-badge text-[10px] ${getStatusColor(rev.status)}`}>
                        {rev.status}
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
