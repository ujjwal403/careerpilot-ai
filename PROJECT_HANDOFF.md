# CareerPilot AI — Project Continuity & Developer Handoff Guide

This document contains everything needed to resume, run, develop, and deploy **CareerPilot AI** locally and in production.

---

## 1. Quickstart: Running Locally

### Prerequisites
- **Node.js**: v18.18 or higher (v20+ recommended)
- **Package Manager**: npm (or pnpm / yarn)
- **Git**: Installed and configured

### Installation & Startup Commands
```bash
# 1. Clone repository (if cloning to a new machine)
git clone https://github.com/ujjwal403/careerpilot-ai.git
cd careerpilot-ai

# 2. Install all dependencies
npm install

# 3. Create your local environment file
cp .env.example .env.local

# 4. Start local development server (with automatic Tailwind CSS compilation)
npm run dev
```

The application will be live at: **`http://localhost:3000`**

---

## 2. Environment Variables Configuration (`.env.local`)

Create or update `.env.local` in the project root:

```ini
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key

# App URL (Local / Production)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Career Intelligence AI (Google AI / Gemini 1.5 Flash API Key)
GEMINI_API_KEY=your_google_ai_studio_api_key
GOOGLE_AI_API_KEY=your_google_ai_studio_api_key
```

> **Note on Security:** `.env` and `.env.local` are automatically gitignored in `.gitignore`. Never commit API keys or private keys to version control.

---

## 3. Database Setup (Supabase PostgreSQL)

CareerPilot AI uses Supabase with PostgreSQL and strict **Row Level Security (RLS)**.

### How to Apply the Database Schema:
1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. Go to the **SQL Editor** tab on the left sidebar.
3. Open the migration file stored locally in this project at:
   `supabase/migrations/20261031_001_initial_schema.sql`
4. Copy the entire contents and paste it into the Supabase SQL Editor.
5. Click **Run**.

### The 6 Core Tables Created:
1. **`users`**: Automatically mirrors `auth.users` on signup via a database trigger (`handle_new_user`).
2. **`profiles`**: Stores candidate college name, degree, branch, CGPA, graduation year, core technical skills, and target roles.
3. **`resumes`**: Stores Google Drive CV links, ATS compatibility scores (0–100), keywords breakdown, and extracted JSON.
4. **`jobs`**: Stores verified tech openings and internships (Swiggy, Blinkit, Zepto, Razorpay, etc.) with stipends and application URLs.
5. **`applications`**: Tracks candidate pipeline status (`saved` → `applied` → `screening` → `interview` → `offer`).
6. **`notifications`**: Real-time alerts for application reviews and status changes.

---

## 4. Key Architectural Features & Business Logic

### A. Ask AI Career Copilot (`src/app/api/ai/ask/route.ts`)
- **Rate Limiting & Anti-Abuse**:
  - Concurrency lock: Strict limit of **1 question at a time** per user.
  - Per-minute cap: Maximum **6 questions / minute**.
  - Hourly cap: Maximum **30 questions / hour**.
  - Daily cap: Maximum **80 questions / day**.
  - Identification: Authenticated users are tracked by Supabase `user.id`; unauthenticated visitors by client IP.
- **Interactive Portal Links**:
  - The AI includes direct Markdown links to internal portals:
    - `[Job Radar](/jobs)`
    - `[Resume Scorer](/resume)`
    - `[Applications Pipeline](/applications)`
    - `[Career Profile](/profile)`
    - `[Dashboard](/dashboard)`
  - Rendered in [`ChatMessageContent.tsx`](file:///src/components/ai/ChatMessageContent.tsx) as interactive clickable pill buttons.
- **Formatting**:
  - Subheadings (`###`), bullet points, numbered steps, callout tips, and 1-click **"Copy Response"** buttons.

### B. Google Drive CV Policy
- Direct server file uploads (`<input type="file">`) are restricted to maintain lightweight, serverless compliance.
- Candidates provide a **Google Drive link** with "Anyone with the link can view" permissions.
- The ATS Scorer audits the CV link, verifies accessibility, parses text, and scores against 10 strict ATS rules.

### C. Zero-Crash Fallback Architecture
- If the Supabase database is ever paused or has no seeded jobs, [`getAllDefaultJobs()`](file:///src/lib/services/job-aggregators.ts) automatically populates verified real-world opportunities so the dashboard and Job Radar never break.

### D. Design System & Editorial Palette
- **Canvas / Background**: Warm linen (`#fffaf3`)
- **Card Backgrounds**: Crisp clean white (`#ffffff`)
- **Borders**: Sandstone (`#eadcc9`)
- **Primary Typography**: Deep umber / bronze (`#572d12` & `#29231e`)
- **Accent Primary**: Royal Blue (`#2563eb` & `#1d4ed8`)
- **Accent Badges & Highlights**: Soft ice blue (`#eff6ff` & `#bfdbfe`)

---

## 5. Project Directory Map

```text
careerpilot-ai/
├── .env.example                       # Template for environment variables
├── .env.local                         # Local environment secrets (gitignored)
├── supabase/
│   └── migrations/
│       └── 20261031_001_initial_schema.sql  # Complete PostgreSQL schema & RLS policies
├── scripts/
│   └── compile-css.mjs                # Compiles globals.src.css -> globals.css with Tailwind v4
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Login, Signup, Forgot Password
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/             # Main dashboard (4-KPI top row, 2-column layout)
│   │   │   ├── jobs/                  # Verified Job Radar & search filters
│   │   │   ├── resume/                # ATS Resume Scorer & Drive CV auditor
│   │   │   ├── applications/          # Kanban application pipeline
│   │   │   ├── profile/               # Career Profile & AI Profile Coach
│   │   │   └── ask-ai/                # Dedicated full-page AI Career Copilot
│   │   └── api/
│   │       ├── ai/ask/                # AI Copilot API with rate limiter & portal navigation
│   │       ├── ai/optimize-profile/   # AI Profile Coach audit endpoint
│   │       ├── resume/                # Resume import, ATS verify & text extraction
│   │       └── jobs/sync/             # Background job sync aggregator
│   ├── components/
│   │   ├── ai/                        # AskAICopilot, AskAICopilotView, ChatMessageContent
│   │   ├── dashboard/                 # StatCard, ApplicationFunnel, QuickRecommendations, QuickActions
│   │   ├── jobs/                      # JobsBoard (details modal, filters, direct apply links)
│   │   ├── resume/                    # ResumeManager, SimpleATSScanner, VerificationModal
│   │   ├── profile/                   # ProfileForm, AIProfileOptimizer, CollegeCombobox
│   │   ├── applications/              # ApplicationsPipeline
│   │   └── layout/                    # DashboardSidebar, DashboardMobileBottomNav
│   └── lib/
│       ├── ats-scorer.ts              # 10-point ATS compliance algorithm
│       ├── job-profile-matcher.ts     # Profile matching against 8 tech domains
│       ├── services/job-aggregators.ts# Verified startup jobs & aggregators
│       └── supabase/                  # SSR Supabase client, server, and middleware
├── PROJECT_HANDOFF.md                 # This file
└── README.md                          # Main repository documentation
```

---

## 6. Git & Deployment Commands

```bash
# Check git status
git status

# Commit any future updates
git add .
git commit -m "feat: description of change"

# Push to GitHub (automatically triggers Vercel deployment)
git push origin main
```

- **GitHub Repository**: [https://github.com/ujjwal403/careerpilot-ai.git](https://github.com/ujjwal403/careerpilot-ai.git)
- **Production URL**: [https://careerpilot-ai-gamma-roan.vercel.app](https://careerpilot-ai-gamma-roan.vercel.app)
