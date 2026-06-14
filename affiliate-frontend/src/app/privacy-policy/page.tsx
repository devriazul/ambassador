"use client";

import React from "react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
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
              Information Privacy
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-3">Privacy Policy</h1>
            <p className="text-slate-400 text-sm mt-2">
              Effective Date: January 1, 2026 · Document ID: BHE-AMB-PRIV-2026
            </p>
          </div>

          <div className="border-t border-white/5 pt-6 space-y-6 text-sm text-slate-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-circle-info text-orange-500 text-sm"></i>
                1. Overview
              </h2>
              <p>
                BHE Uni respects your privacy and is dedicated to protecting the personal information of our ambassadors and the prospective students you refer to us. This Privacy Policy describes how we collect, use, process, and disclose your data in connection with the Ambassador and Rewards Programme.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-database text-orange-500 text-sm"></i>
                2. Data We Collect
              </h2>
              <p>
                To administer rewards and track referrals, we collect specific data categories:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-4 text-slate-400">
                <li><strong>Ambassador Information</strong>: Full name, email address, password hash, role, wallet balance, bank account transfer details, or Love2Shop email values.</li>
                <li><strong>Candidate Referrals</strong>: Full name, email, phone number, and study interests of prospective students you refer. You must ensure you have their consent prior to submission.</li>
                <li><strong>Review Approvals</strong>: Social link and screenshot proofs verifying online course reviews.</li>
                <li><strong>Log Data</strong>: Transaction logs, network IPs, and timestamp indices tracking withdrawals.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-arrows-spin text-orange-500 text-sm"></i>
                3. Purpose of Processing
              </h2>
              <p>
                Data is processed solely for academic operations, reward calculations, and security:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-4 text-slate-400">
                <li>Verifying referred student applications and enrolments in university registry portals.</li>
                <li>Syncing candidate details with our **iCARE CRM Admissions System** to track recruitment progress.</li>
                <li>Processing cash withdrawals, bank transfers, and Love2Shop e-gift vouchers.</li>
                <li>Running security sweeps and duplicate check filters to prevent fraud.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-handshake text-orange-500 text-sm"></i>
                4. Data Sharing &amp; Disclosures
              </h2>
              <p>
                BHE Uni does **not** sell, lease, or share personal ambassador details with external marketing brokers. Your information is shared only under specific protocols:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-4 text-slate-400">
                <li><strong>Partner Institutions</strong>: Universities or registry offices verifying applicants’ enrolment status.</li>
                <li><strong>Payment Providers</strong>: Banking institutions or gift card dispatch APIs (Love2Shop) processing reward payout transactions.</li>
                <li><strong>Regulatory Audits</strong>: In rare instances, to comply with statutory legal disclosures (e.g. HMRC transactional auditing).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-cookie-bite text-orange-500 text-sm"></i>
                5. Cookies &amp; Tracking
              </h2>
              <p>
                We use security session cookies to verify authenticated logins and track session state. No target-ad trackers are deployed inside the portal interface.
              </p>
            </section>

            <section className="space-y-3 border-t border-white/5 pt-6">
              <p className="text-slate-400 text-xs">
                To submit data export requests, retrieve privacy files, or claim right-to-erasure options, please contact our Registry Office at <a href="mailto:privacy@bheuni.uk" className="text-orange-400 hover:underline">privacy@bheuni.uk</a>.
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
