"use client";

import React from "react";
import Link from "next/link";

export default function GDPRPolicyPage() {
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
              Compliance Document
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-3">GDPR Compliance Policy</h1>
            <p className="text-slate-400 text-sm mt-2">
              Effective Date: January 1, 2026 · Document ID: BHE-AMB-GDPR-2026
            </p>
          </div>

          <div className="border-t border-white/5 pt-6 space-y-6 text-sm text-slate-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-shield-halved text-orange-500 text-sm"></i>
                1. Data Protection Commitment
              </h2>
              <p>
                BHE Uni is committed to safeguarding the privacy and personal data of our student ambassadors, alumni, and referred prospective students. This document outlines our technical controls, processes, and guidelines in compliance with the General Data Protection Regulation (GDPR) and UK Data Protection Laws.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-key text-orange-500 text-sm"></i>
                2. Security & Encryption Controls
              </h2>
              <p>
                All data collected within the Ambassador and Rewards Programme is secured using industry-standard enterprise controls:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-4 text-slate-400">
                <li><strong>Encryption at Rest</strong>: Secure storage utilizing AES-256 standard encryption keys.</li>
                <li><strong>Encryption in Transit</strong>: Secure end-to-end communication channels encrypted via TLS 1.3 protocols.</li>
                <li><strong>Role-Based Access Control (RBAC)</strong>: Access restricted to authorized Recruitment Officers, Compliance Officers, and Administrators.</li>
                <li><strong>Identity Verification</strong>: Mandatory multi-factor authentication (MFA) required for administrative portals.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-clock text-orange-500 text-sm"></i>
                3. Data Retention Schedule
              </h2>
              <p>
                In alignment with GDPR minimization guidelines, data is retained only as long as necessary for administrative and legal audits:
              </p>
              <div className="overflow-x-auto bg-slate-950 rounded-xl border border-white/5 my-4">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-slate-300 font-bold">
                      <th className="p-3">Data Category</th>
                      <th className="p-3">Retention Period</th>
                      <th className="p-3">Expiry Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5">
                      <td className="p-3 font-semibold text-white">Active Ambassador Profiles</td>
                      <td className="p-3">Indefinite</td>
                      <td className="p-3">None (During active membership)</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="p-3 font-semibold text-white">Inactive Accounts</td>
                      <td className="p-3">3 Years of inactivity</td>
                      <td className="p-3">Full Profile Anonymisation</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="p-3 font-semibold text-white">Lead Referral Records</td>
                      <td className="p-3">5 Years</td>
                      <td className="p-3">Permanent Database Deletion</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="p-3 font-semibold text-white">Reward Transactions</td>
                      <td className="p-3">7 Years</td>
                      <td className="p-3">HMRC Compliance Archival</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Security & Audit Logs</td>
                      <td className="p-3">2 Years</td>
                      <td className="p-3">Log Rotation & Purge</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-clipboard-check text-orange-500 text-sm"></i>
                4. Consent Management
              </h2>
              <p>
                No student referral can be logged without active consent:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-4 text-slate-400">
                <li>Ambassadors must obtain explicit, verbal, or digital agreement from the referred candidate before submitting their contact details.</li>
                <li>An automated verification email is immediately dispatched to the referred candidate requesting confirmation and opt-in approval.</li>
                <li>Consent can be withdrawn by any user or lead at any time by contacting our compliance desk.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-user-gear text-orange-500 text-sm"></i>
                5. Your Data Rights
              </h2>
              <p>
                Under GDPR regulations, you hold the following rights regarding BHE Uni processing of your personal credentials:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-4 text-slate-400">
                <li><strong>Right of Access</strong>: Request a full export of all personal data held.</li>
                <li><strong>Right of Correction</strong>: Update or edit inaccurate details via the Settings module.</li>
                <li><strong>Right of Erasure ("Right to be Forgotten")</strong>: Request complete deletion of your account and credentials (subject to transactional ledger requirements).</li>
                <li><strong>Data Portability</strong>: Export transfer logs and earning history structures in standard format.</li>
              </ul>
            </section>

            <section className="space-y-3 border-t border-white/5 pt-6">
              <p className="text-slate-400 text-xs">
                For questions regarding data protection practices, please contact BHE Uni Compliance Desk at <a href="mailto:compliance@bheuni.uk" className="text-orange-400 hover:underline">compliance@bheuni.uk</a>.
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
