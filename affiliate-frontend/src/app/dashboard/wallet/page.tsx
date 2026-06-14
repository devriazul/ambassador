"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  category: string;
  description: string;
  created_at: string;
}

interface Payout {
  id: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
}

export default function WalletPage() {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  
  // Bank Details
  const [holderName, setHolderName] = useState("");
  const [sortCode, setSortCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  
  // Gift Card Detail
  const [giftCardEmail, setGiftCardEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = async () => {
    try {
      const [txs, pts] = await Promise.all([
        api.get<Transaction[]>("/ambassador/transactions"),
        api.get<Payout[]>("/ambassador/payouts"),
      ]);
      setTransactions(txs);
      setPayouts(pts);
    } catch (err) {
      console.error("Failed to load wallet data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error("Please enter a valid payout amount.");
      }
      if (numAmount < 20) {
        throw new Error("Minimum withdrawal amount is £20.00.");
      }
      if (numAmount > 5000) {
        throw new Error("Maximum withdrawal amount is £5,000.00 per request.");
      }

      const payload: any = {
        amount: numAmount,
        payment_method: method,
      };

      if (method === "bank_transfer") {
        if (!holderName || !sortCode || !accountNumber) {
          throw new Error("Please fill out all bank account credentials.");
        }
        payload.bank_details = {
          holder_name: holderName,
          sort_code: sortCode,
          account_number: accountNumber,
        };
      } else {
        if (!giftCardEmail) {
          throw new Error("Please enter your Love2Shop email address.");
        }
        payload.gift_card_email = giftCardEmail;
      }

      await api.post("/ambassador/payouts", payload);
      const isAutoApproved = numAmount < 1000;
      setMessage({
        type: "success",
        text: isAutoApproved
          ? "Withdrawal request submitted and auto-approved! Your payment will be processed shortly."
          : "Withdrawal request submitted. Amounts over £1,000 require manager approval before processing.",
      });
      setAmount("");

      // Refresh user balance & logs
      await refreshUser();
      await fetchData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to submit payout request." });
    } finally {
      setSubmitting(false);
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

  if (!user) return null;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-black text-white">Wallet &amp; Payouts</h1>
        <p className="text-slate-400">Request payouts and check transaction history details.</p>
      </header>

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="student-card md:col-span-1 bg-gradient-to-br from-blue-900/40 to-slate-900">
          <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2">Available Balance</h4>
          <p className="text-4xl font-black text-white">{formatCurrency(user.wallet_balance)}</p>
          <p className="text-xs text-slate-400 mt-2">Deducted immediately on withdrawal request.</p>
        </div>

        {/* Withdrawal Form */}
        <div className="student-card md:col-span-2">
          <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Request Payout</h3>
          <form onSubmit={handleWithdrawal} className="space-y-4">
            {message && (
              <div className={`p-3 rounded-xl text-xs ${message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                {message.text}
              </div>
            )}
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Amount (£)</label>
                <input
                  type="number"
                  step="0.01"
                  min="20"
                  max="5000"
                  required
                  placeholder="e.g. 50.00"
                  className="student-input w-full"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-[10px] text-slate-500 mt-1">Min: £20 · Max: £5,000. Under £1,000 is auto-approved.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Payout Method</label>
                <select
                  className="student-input w-full text-slate-300"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="gift_card">Love2Shop Gift Card</option>
                </select>
              </div>
            </div>

            {/* Conditional fields */}
            {method === "bank_transfer" ? (
              <div className="space-y-4 border-t border-white/5 pt-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    required={method === "bank_transfer"}
                    placeholder="Alexander Doe"
                    className="student-input w-full"
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Sort Code</label>
                    <input
                      type="text"
                      required={method === "bank_transfer"}
                      placeholder="20-45-14"
                      className="student-input w-full"
                      value={sortCode}
                      onChange={(e) => setSortCode(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Account Number</label>
                    <input
                      type="text"
                      required={method === "bank_transfer"}
                      placeholder="12345678"
                      className="student-input w-full"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-t border-white/5 pt-4">
                <label className="block text-xs font-medium text-slate-400 mb-1">Love2Shop Email Address</label>
                <input
                  type="email"
                  required={method === "gift_card"}
                  placeholder="john.doe@gmail.com"
                  className="student-input w-full"
                  value={giftCardEmail}
                  onChange={(e) => setGiftCardEmail(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="student-btn bg-blue-600 hover:bg-blue-500 text-white w-full py-2.5"
            >
              {submitting ? "Processing..." : "Submit Payout Request"}
            </button>
          </form>
        </div>
      </div>

      {/* Columns: Payout requests & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Withdrawals list */}
        <div className="student-card p-0 overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <h3 className="font-bold text-white text-sm">Payout Requests</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-white/5 border-b border-white/10">
                <tr>
                  <th scope="col" className="p-4">Requested</th>
                  <th scope="col" className="p-4">Amount</th>
                  <th scope="col" className="p-4">Method</th>
                  <th scope="col" className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center"><i className="fa-solid fa-circle-notch animate-spin text-blue-500"></i></td>
                  </tr>
                ) : payouts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500 text-xs">No payout history.</td>
                  </tr>
                ) : (
                  payouts.map((pt) => (
                    <tr key={pt.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4 text-slate-300">{new Date(pt.created_at).toLocaleDateString()}</td>
                      <td className="p-4 font-bold text-white">{formatCurrency(pt.amount)}</td>
                      <td className="p-4 text-slate-400 capitalize">{pt.payment_method.replace("_", " ")}</td>
                      <td className="p-4">
                        <span className={`status-badge text-[8px] ${getStatusColor(pt.status)}`}>
                          {pt.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transactions list */}
        <div className="student-card p-0 overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <h3 className="font-bold text-white text-sm">Transaction Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-white/5 border-b border-white/10">
                <tr>
                  <th scope="col" className="p-4">Date</th>
                  <th scope="col" className="p-4">Description</th>
                  <th scope="col" className="p-4">Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center"><i className="fa-solid fa-circle-notch animate-spin text-blue-500"></i></td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-slate-500 text-xs">No transactions found.</td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4 text-slate-300">{new Date(tx.created_at).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="text-white font-semibold capitalize text-xs">{tx.category.replace("_", " ")}</div>
                        <div className="text-[10px] text-slate-500">{tx.description}</div>
                      </td>
                      <td className={`p-4 font-bold ${tx.type === "debit" ? "text-slate-400" : "text-emerald-400"}`}>
                        {tx.type === "debit" ? "-" : "+"}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
