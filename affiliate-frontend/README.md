# BHE Uni Ambassador & Rewards Programme - Frontend

This is the Next.js frontend application for the **BHE Uni Ambassador & Rewards Programme Affiliate Portal**. It features a modern, premium blue-and-orange theme tailored with curated typography, custom interactive components, responsive dashboards, and micro-animations.

---

## 🎨 Key Features

- **Interactive Landing Page**:
  - Animated Hero section with call-to-actions.
  - **Ambassador Levels**: Relocated stats/progress tracker showing Bronze, Silver, Gold, and Platinum status requirements.
  - **Reward Levels**: Features Level 1 (£5/lead referral) and Level 2 (£500/enrolment reward).
  - Testimonial carousel, quick registration application, and login modals.
- **Student/Ambassador Dashboard**:
  - Mobile-responsive layout with slide-out sidebar drawer.
  - Sticky top header featuring profile avatar, current tier badge, and logout action.
  - Lead submission form, statistics cards, and real-time payout requests.
- **Admin Portal**:
  - Global ambassador list, referrals management, and tier settings.
  - **Statutory Reversal (Clawback)**: Interface to reverse enrolment rewards for students within the 14-day cooling-off window.
  - **Clean Expired Leads**: Button to trigger automatic system maintenance of stale leads with a breakdown summary banner.
  - Responsive layout with a sticky top header showing profile details and responsive sidebar drawer.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS & Custom Vanilla CSS modules
- **Icons**: FontAwesome Icons
- **Animation**: CSS animations & custom JS state transitions

---

## 📂 Project Structure

```
affiliate-frontend/
├── src/
│   ├── app/
│   │   ├── admin/            # Admin Panel Pages (referrals, settings, dashboard)
│   │   ├── dashboard/        # Ambassador Dashboard Pages
│   │   ├── gdpr-policy/      # Compliance Policy Pages
│   │   ├── he-regulations/   # Higher Education Regulations Page
│   │   ├── page.tsx          # Landing Page
│   │   ├── layout.tsx        # Global Layout
│   │   └── globals.css       # Core Style Tokens and Animations
│   └── components/           # Shared UI components
├── public/                   # Static assets
├── package.json              # Frontend npm package dependencies
└── README.md                 # Frontend Documentation
```

---

## ⚙️ Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory (if not already present):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the landing page.

---

## 🔧 Production Build
To build the application for production:
```bash
npm run build
npm start
```
