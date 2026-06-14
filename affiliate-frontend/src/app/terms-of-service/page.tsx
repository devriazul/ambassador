"use client";

import React from "react";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="border-b border-white/5 bg-slate-950/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-white font-bold text-lg flex items-center gap-2">
            <i className="fa-solid fa-graduation-cap text-orange-500"></i>
            BHE Uni
          </Link>
          <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-white border border-white/10 px-3.5 py-2 rounded-xl transition-all">
            <i className="fa-solid fa-arrow-left mr-2"></i>Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-12 px-6">
        <div className="max-w-4xl mx-auto bg-slate-950/40 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl space-y-8">
          <div>
            <span className="text-orange-500 text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 px-3 py-1 rounded-full">
              Legal Agreement
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-3">Terms of Service</h1>
            <p className="text-slate-400 text-sm mt-2">
              Last Updated: June 8, 2026 · Document ID: BHE-AMB-TOS-2026
            </p>
          </div>

          <div className="border-t border-white/5 pt-6 space-y-6 text-sm text-slate-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-user-circle text-orange-500 text-sm"></i>
                1. Acceptance of Terms
              </h2>
              <p>
                By enrolling as a student or alumni ambassador in the BHE Uni Ambassador and Rewards Programme, you agree to be bound by these Terms of Service. If you do not agree, you are not authorized to use the platform, share referral links, or claim financial incentives.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-wallet text-orange-500 text-sm"></i>
                2. Wallet, Rewards &amp; Payout Criteria
              </h2>
              <p>
                Ambassadors accrue rewards in their digital wallet based on valid actions. Withdrawals are subject to the following rules:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-4 text-slate-400">
                <li><strong>Minimum Withdrawal Limit</strong>: Requests must be for a minimum of <strong>£20.00</strong>.</li>
                <li><strong>Maximum Withdrawal Limit</strong>: Requests are capped at a maximum of <strong>£5,000.00</strong> per individual transaction.</li>
                <li><strong>Approval Rules</strong>: Payout requests under <strong>£1,000.00</strong> are automatically approved and dispatched. Requests for <strong>£1,000.00 or more</strong> are set to pending for mandatory compliance review.</li>
                <li><strong>Methods</strong>: Rewards are disbursed via bank transfer (BACS) or Love2Shop E-Gift Cards. Payment method details must be accurate and owned by the registered user.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-star text-orange-500 text-sm"></i>
                3. Review Rewards Restrictions
              </h2>
              <p>
                Under Level 1 Review Rewards, ambassadors can earn reward incentives for publishing verified online feedback on BHE Uni partner courses:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-4 text-slate-400">
                <li>Eligible platforms: Google Reviews, Trustpilot, and Facebook Reviews.</li>
                <li>Ambassadors earn <strong>£10</strong> per approved review, capped at a maximum of one review per platform.</li>
                <li>The absolute lifetime cap for online reviews is <strong>£30.00 total</strong>. Duplicate review links or platform spam will lead to reward cancellation.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-users text-orange-500 text-sm"></i>
                4. Referral Guidelines &amp; Lead Integrity
              </h2>
              <p>
                A referral is validated for payout only if the lead is contactable, expresses genuine interest in Higher Education, is not a duplicate in our CRM, and registers consent. Self-referrals (referring yourself) are not permitted and will result in referral deletion.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-triangle-exclamation text-orange-500 text-sm"></i>
                5. Fraud Prevention &amp; Account Suspension
              </h2>
              <p>
                BHE Uni utilizes automated duplicate checks, device fingerprinting, and manual validation checks to prevent program abuse. System manipulation, fake contact info submissions, or spam advertising will result in immediate suspension, confiscation of accrued wallet balances, and potential referral to academic registries.
              </p>
            </section>

            <section className="space-y-3 border-t border-white/5 pt-6">
              <p className="text-slate-400 text-xs">
                To inquire about outstanding payouts or report platform discrepancies, please contact Academic Support Desk at <a href="mailto:support@bheuni.uk" className="text-orange-400 hover:underline">support@bheuni.uk</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500 bg-slate-950/20">
        <p>© {new Date().getFullYear()} BHE Uni. All rights reserved.</p>
      </footer>
    </div>
  );
}
