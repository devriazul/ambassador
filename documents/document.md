BHE UNI AMBASSADOR & REWARDS PROGRAMME
BUSINESS REQUIREMENTS & SYSTEM SPECIFICATION

Document ID: BHE-AMB-2026-03
Version: 3.0 (Final)
Status: Approved
Effective Period: 2026 – 2029


EXECUTIVE SUMMARY

BHE Uni proposes the development and implementation of a technology-driven Ambassador & Rewards Programme designed to create a scalable student recruitment ecosystem across the United Kingdom and international markets.

The programme combines referral marketing, affiliate recruitment, online review incentives, student engagement initiatives, gamified ambassador levels (Bronze to Platinum), and mobile technology to generate qualified student leads, increase enrolments, improve brand reputation, and reduce reliance on traditional recruitment agencies.

Through a dedicated mobile application integrated with BHE Uni CRM and university application systems, students and alumni will be able to refer prospective students, monitor referral progress, receive rewards, participate in ambassador campaigns, and progress through achievement levels.

The initiative is expected to generate significant enrolment growth and deliver a positive return on investment within the first 4–5 months of operation.


1. BUSINESS OBJECTIVES

1.1 Primary Objectives

The programme aims to:
- Generate qualified student leads through peer-to-peer advocacy
- Increase enrolments across UK and international university partners
- Improve Google Reviews and Trustpilot ratings
- Create a nationwide student ambassador network
- Develop a sustainable recruitment channel
- Increase student engagement and retention
- Reduce student acquisition costs
- Improve conversion rates through trusted referrals
- Increase ambassador retention through gamified progression (Bronze to Platinum)

1.2 Strategic Targets (2026–2029)

+----------------------+--------+--------+--------+
| KPI                  | Year 1 | Year 2 | Year 3 |
+----------------------+--------+--------+--------+
| Active Ambassadors   | 1,000  | 3,000  | 5,000  |
| Leads Generated      | 5,000  | 15,000 | 30,000 |
| Valid Leads          | 3,500  | 10,500 | 21,000 |
| Applications         | 1,200  | 3,600  | 7,200  |
| Offers               | 600    | 1,800  | 3,600  |
| Enrolments           | 300    | 900    | 1,800  |
+----------------------+--------+--------+--------+


2. PROGRAMME STRUCTURE

The Ambassador Programme consists of four reward levels.

LEVEL 1 – REVIEW REWARDS

Objective: Improve online reputation and brand trust.
Eligible Platforms: Google Reviews, Trustpilot, Facebook Reviews
Reward: £10 Gift Card

Process:
1. Student submits review
2. Review verification completed
3. Compliance approval
4. Reward issued to student wallet

LEVEL 2 – LEAD REFERRAL PROGRAMME

Objective: Generate prospective student enquiries.
Reward: £5 per valid lead.

Validation Criteria:
- Lead must be new
- Lead must not exist within CRM
- Valid contact details required
- GDPR consent mandatory

Process:
1. Ambassador submits referral
2. Duplicate verification
3. Compliance validation
4. Reward credited

No referral limits apply.

LEVEL 3 – ENROLMENT REWARDS

Objective: Reward successful student recruitment.

+----------------------+----------+
| Student Category     | Reward   |
+----------------------+----------+
| UK Home Student      | £500     |
| International Student| £750     |
| Postgraduate Student | £750     |
+----------------------+----------+

Process:
1. Referred student applies
2. Application processed
3. Offer issued
4. Student enrols
5. CRM confirms enrolment
6. Reward released

LEVEL 4 – AMBASSADOR PROGRESSION TIERS (GAMIFIED)

Objective: Reward cumulative lead generation and recognise ambassador excellence.

+----------+----------------+--------------+------------------------------------------+
| Level    | Leads Required | Bonus Reward | Perks & Recognition                       |
+----------+----------------+--------------+------------------------------------------+
| BRONZE   | 10 leads       | £25          | Digital Certificate, Ambassador Badge,   |
|          |                |              | Exclusive Training Access                |
| SILVER   | 25 leads       | £100         | Silver Certificate, Branded Hoodie/Polo, |
|          |                |              | Priority Support                         |
| GOLD     | 50 leads       | £250         | Gold Certificate, Social Media Feature,  |
|          |                |              | VIP Event Invitations                    |
| PLATINUM | 100+ leads     | £500         | Platinum Excellence Award, Hall of Fame, |
|          |                |              | Awards Ceremony, Priority Paid Roles     |
+----------+----------------+--------------+------------------------------------------+

Note: Ambassadors earn BOTH financial rewards (per lead/enrolment) AND level-up bonuses when thresholds are reached. Level progression is cumulative (lifetime leads, never resetting).


3. SYSTEM OVERVIEW

3.1 Solution Architecture

The solution consists of:
- Mobile Application – For students and ambassadors
- Web Administration Portal – For BHE Uni staff and compliance teams
- CRM Integration Layer – Synchronisation between iCARE CRM, University Partner Systems, and Student Application Systems
- Analytics & Reporting Platform – Real-time recruitment and performance reporting


4. USER ROLES & PERMISSIONS

+----------------------+---------------------------------------------------+
| Role                 | Functions                                         |
+----------------------+---------------------------------------------------+
| Student Ambassador   | Register, submit referrals, view status/earnings,|
|                      | redeem rewards, submit reviews                   |
| Alumni Ambassador    | All student functions + alumni campaigns +       |
|                      | premium referral programmes                      |
| Recruitment Officer  | Review leads, verify referrals, monitor          |
|                      | conversions, approve rewards                     |
| Compliance Officer   | GDPR audits, fraud investigation, consent        |
|                      | verification                                     |
| System Administrator | User management, system configuration, reporting,|
|                      | security administration                          |
+----------------------+---------------------------------------------------+


5. FUNCTIONAL REQUIREMENTS

5.1 User Registration

Features: Email registration, mobile registration, social login, identity verification, consent management.

Data Fields: Full Name, Email, Phone Number, Student ID, University, Country, Course Information.

5.2 Student Dashboard

Displays: Total referrals, Applications, Offers, Enrolments, Earnings, Pending rewards, Conversion statistics, Current level + progress to next level.

5.3 Referral Submission Module

Mandatory Fields: Full Name, Email Address, Mobile Number, Country, Study Interest, Intended Intake, GDPR Consent.

Validation: Duplicate detection, email validation, mobile validation, consent verification.

5.4 Referral Tracking Workflow

Lead status progression:
1. Submitted
2. Verified
3. Contacted
4. Application Started
5. Offer Issued
6. Enrolled
7. Reward Approved
8. Reward Paid

Timeout Rules:

+----------------------+-------------------+------------------------------------+
| Lead Status          | Timeout Period    | Expiry Action                      |
+----------------------+-------------------+------------------------------------+
| Submitted            | 7 days            | Auto-reject, notify ambassador     |
| Contacted            | 30 days           | Move to "Dormant"                  |
| Application Started  | 90 days           | Close, no reward                   |
| Offer Issued         | 60 days           | Expire, no enrolment reward        |
+----------------------+-------------------+------------------------------------+

5.5 Rewards & Wallet Module

Features: Current balance, pending rewards, transaction history, voucher redemption, withdrawal requests.

Supported Payout Methods: Bank Transfer, PayPal, Gift Cards, Digital Vouchers.

Withdrawal Request & Approval Flow:

Step 1: Ambassador initiates withdrawal (minimum £20, maximum £5,000)
Step 2: System eligibility check (balance, ID verified, no fraud flag)
Step 3: Withdrawals under £1,000 auto-approve; over £1,000 require manager approval
Step 4: Money transfer processed (Stripe/PayPal/BACS)
Step 5: Failed transfers retry (1h, 6h, 24h, maximum 3 attempts)
Step 6: Ambassador notified, wallet balance reduced

5.6 Notification Engine

Types: Lead status updates, reward approvals, campaign announcements, level-up celebrations.

Channels: Push Notifications, Email, SMS.


6. TECHNOLOGY INFRASTRUCTURE

+----------------------+---------------------------------------------------+
| Layer                | Technology                                        |
+----------------------+---------------------------------------------------+
| Mobile App           | Flutter (preferred) / React Native – iOS + Android|
| Web Portal           | React.js / Angular                                |
| Backend Services     | .NET Core / Node.js                               |
| Database             | PostgreSQL / Microsoft SQL Server                 |
| Cloud Platform       | Microsoft Azure (preferred) / AWS                 |
| Offline Capability   | Mobile app MUST queue referrals offline and sync  |
|                      | when connectivity restored                        |
+----------------------+---------------------------------------------------+


7. CRM & UNIVERSITY INTEGRATION

Integrated Systems: iCARE CRM, University Admissions Portals, Student Application Systems.

+----------------------+------------------------+-----------------------------+
| Integration          | Method                 | Retry Strategy              |
+----------------------+------------------------+-----------------------------+
| iCARE CRM (lead sync)| REST API + Webhook     | 3 retries, exponential      |
|                      |                        | backoff                     |
| University Portal    | Webhook (inbound)      | N/A                         |
| Student Application  | Batch API (daily)      | 2 retries                   |
+----------------------+------------------------+-----------------------------+


8. ARTIFICIAL INTELLIGENCE ROADMAP

+-------------------------------------+----------------+---------------------------------+
| AI Feature                          | Release        | Data Required                   |
+-------------------------------------+----------------+---------------------------------+
| Duplicate lead detection (rule-based)| Launch        | Email + phone hash              |
| AI fraud detection                  | Month 9        | 6 months historical lead data   |
| AI lead scoring                     | Month 12       | 12 months enrolment outcomes    |
| Predictive conversion modelling     | Month 18       | Integrated CRM data             |
| Ambassador performance intelligence | Month 24       | 2 years ambassador data         |
+-------------------------------------+----------------+---------------------------------+


9. COMPLIANCE, SECURITY & RISK MANAGEMENT

9.1 GDPR Compliance

- Explicit consent collection
- Data encryption (AES-256 at rest, TLS 1.3 in transit)
- Secure storage
- Data retention policies
- Right to access and erasure

9.2 Clawback Policy (Reward Reversal)

If a referred student withdraws within 14 days of enrolment (statutory cooling-off period):
- Enrolment reward (£500–£750) shall be reversed
- Lead reward (£5) remains payable
- Ambassador's wallet shall be debited

9.3 Data Retention Schedule

+----------------------+-------------------+---------------------------------+
| Data Type            | Retention Period  | Post-Retention Action           |
+----------------------+-------------------+---------------------------------+
| User account (active)| Indefinite        | –                               |
| User account (inactive)| 3 years         | Anonymisation                   |
| Lead records         | 5 years           | Deletion                        |
| Reward transactions  | 7 years (HMRC)    | Archived                        |
| Audit logs           | 2 years           | Rotation                        |
+----------------------+-------------------+---------------------------------+

9.4 Security Controls

- Multi-Factor Authentication (MFA)
- Role-Based Access Control (RBAC)
- SSL/TLS Encryption
- Audit Logging (user activity, lead submissions, reward payments)

9.5 Fraud Prevention

Automated: Duplicate lead detection, email/phone verification, device monitoring.

Manual: Compliance audits, random inspections, reward approval controls.


10. MARKETING & AMBASSADOR GROWTH STRATEGY

10.1 Recruitment Channels

- Existing Students
- Alumni Network
- Instagram, LinkedIn, TikTok
- Facebook Communities
- WhatsApp Groups

10.2 Ambassador Incentives

Quarterly awards: MacBook Air, International Holiday, Cash Bonuses, Ambassador Excellence Awards.

Level-based perks: Certificates, branded merchandise, social media features, Hall of Fame, VIP events.


11. FINANCIAL PROJECTIONS (2026–2029)

11.1 Year 1 (2026)

+----------------------+-----------------+
| Metric               | Value           |
+----------------------+-----------------+
| Ambassadors          | 1,000           |
| Leads Generated      | 5,000           |
| Valid Leads          | 3,500           |
| Applications         | 1,200           |
| Offers               | 600             |
| Enrolments           | 300             |
| Average Commission   | £2,000          |
| Revenue              | £600,000        |
+----------------------+-----------------+

Programme Costs (Including Level Bonuses & Contingency):

+----------------------+-----------------+
| Cost Category        | Amount          |
+----------------------+-----------------+
| Review Rewards       | £30,000         |
| Lead Rewards         | £17,500         |
| Enrolment Rewards    | £150,000        |
| Level Bonuses        | £16,250         |
| App Development      | £57,500         |
| Administration       | £46,000         |
| Marketing            | £34,500         |
| Total Cost           | £351,750        |
| Net Contribution     | £248,250        |
+----------------------+-----------------+

Break-Even Analysis:

+----------------------+-----------------+
| Metric               | Value           |
+----------------------+-----------------+
| Enrolments needed    | 32              |
| Expected timeline    | Month 4–5       |
+----------------------+-----------------+

11.2 Year 2 (2027)

+----------------------+-----------------+
| Metric               | Value           |
+----------------------+-----------------+
| Enrolments           | 900             |
| Revenue              | £1,800,000      |
| Level Bonuses        | £76,500         |
| Other Costs          | £727,500        |
| Total Cost           | £804,000        |
| Net Contribution     | £996,000        |
+----------------------+-----------------+

11.3 Year 3 (2028)

+----------------------+-----------------+
| Metric               | Value           |
+----------------------+-----------------+
| Enrolments           | 1,800           |
| Revenue              | £3,600,000      |
| Level Bonuses        | £168,750        |
| Other Costs          | £1,365,000      |
| Total Cost           | £1,533,750      |
| Net Contribution     | £2,066,250      |
+----------------------+-----------------+


12. KEY PERFORMANCE INDICATORS (KPIs)

12.1 Lead Generation
- Cost per Lead (CPL)
- Lead Quality Score
- Valid Lead Percentage

12.2 Conversion
- Lead-to-Application Rate
- Application-to-Offer Rate
- Offer-to-Enrolment Rate

12.3 Financial
- Cost per Enrolment
- Revenue per Enrolment
- Programme ROI
- Ambassador Lifetime Value

12.4 Gamification KPIs

+--------------------------------------+-----------------+
| KPI                                  | Target (Year 1) |
+--------------------------------------+-----------------+
| % reaching Bronze                    | 15%             |
| % reaching Silver                    | 5%              |
| % reaching Gold                      | 2%              |
| % reaching Platinum                  | 0.5%            |
| Ambassador retention (6 months)      | 60%             |
| Hall of Fame inductees               | 5               |
+--------------------------------------+-----------------+

12.5 Engagement KPIs

+--------------------------------------+-----------------+
| KPI                                  | Target (Year 1) |
+--------------------------------------+-----------------+
| Active ambassadors (monthly)         | 70%             |
| Average leads per ambassador         | 5               |
| Reward redemption rate               | 80%             |
+--------------------------------------+-----------------+


13. EXPECTED BUSINESS OUTCOMES

For BHE Uni:
- Increased student recruitment
- Lower acquisition costs
- Improved reputation
- Stronger student engagement
- Sustainable growth model

For Students & Alumni:
- Financial rewards
- Career development opportunities
- Networking benefits
- Ambassador recognition
- Gamified achievement and status progression

For University Partners:
- Higher-quality applicants
- Increased enrolments
- Improved conversion performance
- Expanded market reach


14. CONCLUSION

The BHE Uni Ambassador & Rewards Programme is a strategic digital recruitment platform that combines student advocacy, referral marketing, reward incentives, gamified progression tiers, and advanced technology to create a scalable student acquisition ecosystem.

By integrating CRM systems, mobile technology, compliance controls, analytics, level-based recognition, and future AI capabilities, BHE Uni will establish a sustainable recruitment model capable of generating significant enrolment growth, measurable ROI, and long-term competitive advantage across the UK and international higher education market.

The programme is expected to break even within 4–5 months and deliver a cumulative net contribution of over £3.3 million by the end of Year 3.


END OF DOCUMENT