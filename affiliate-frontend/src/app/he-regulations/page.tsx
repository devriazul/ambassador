"use client";

import React from "react";
import Link from "next/link";

export default function HERegulationsPage() {
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
              University Compliance Spec
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-3">Higher Education (HE) Regulations</h1>
            <p className="text-slate-400 text-sm mt-2">
              Effective Period: 2026 – 2029 · Code: BHE-HE-REG-3.0
            </p>
          </div>

          <div className="border-t border-white/5 pt-6 space-y-6 text-sm text-slate-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-scale-balanced text-orange-500 text-sm"></i>
                1. Regulatory Alignment & CMA Compliance
              </h2>
              <p>
                The BHE Uni Ambassador and Rewards Programme operates in strict alignment with the **Competition and Markets Authority (CMA)** guidelines and UK Higher Education quality frameworks. As ambassadors represent BHE Uni and its partner colleges, transparency and accurate representation are legally binding requirements.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-bullhorn text-orange-500 text-sm"></i>
                2. Advertising Standards & Transparency
              </h2>
              <p>
                Under the UK **Advertising Standards Authority (ASA)** regulations, any promotional activities conducted by student ambassadors must clearly indicate a financial relationship:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-4 text-slate-400">
                <li><strong>Disclosure</strong>: If posting on social media, using affiliate codes, or running student campaigns, ambassadors must clearly state they receive referral rewards (e.g. using tags like `#Ad`, `#Ambassador`, or `#Sponsored`).</li>
                <li><strong>No Misrepresentation</strong>: Ambassadors must present course fees, entry criteria, visa rules, and academic structures truthfully. Making unrealistic promises regarding career prospects or visa approvals is strictly prohibited.</li>
                <li><strong>Official Material Only</strong>: Only official prospectus brochures, leaflets, and media issued by BHE Uni may be used for marketing campaigns.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-rotate-left text-orange-500 text-sm"></i>
                3. 14-Day Statutory Cooling-Off & Reward Clawbacks
              </h2>
              <p>
                In compliance with consumer protection rules and statutory cooling-off periods for higher education enrolments, BHE Uni enforces a structured **Clawback Policy**:
              </p>
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wide text-orange-400">Section 9.2: Cooling-off Clawbacks</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  If a referred student withdraws from their course or cancels their enrollment within the **first 14 days** of the statutory cooling-off period:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-400 pl-2 space-y-1">
                  <li>The Enrolment Reward (<strong>£500</strong> for Home students) will be fully reversed.</li>
                  <li>The ambassador's wallet balance and total earned stats will be debited to reflect the reversal.</li>
                  <li>In accordance with program policy, the Level 2 Lead Reward (<strong>£5</strong>) remains credited to the ambassador.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-graduation-cap text-orange-500 text-sm"></i>
                4. Admissions Criteria & Integrity
              </h2>
              <p>
                Referring a student does not guarantee admission. All referred applicants must go through standard university assessment processes:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-4 text-slate-400">
                <li>BHE Uni partner institutions retain final authority over admissions, credit transfers, English language exemptions, and portfolio evaluations.</li>
                <li>Ambassadors must never assist candidates in falsifying educational credentials, references, or bank declarations. Attempted fraud triggers immediate program termination and referral to the university disciplinary committee.</li>
              </ul>
            </section>

            <section className="space-y-3 border-t border-white/5 pt-6">
              <p className="text-slate-400 text-xs">
                To check current student CMA guidelines or learn more about admissions regulations, please email the Academic Registry Compliance Team at <a href="mailto:he-registry@bheuni.uk" className="text-orange-400 hover:underline">he-registry@bheuni.uk</a>.
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
