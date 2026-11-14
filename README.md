# CareerPilot AI 🧭

> **Autonomous AI Career Navigation & ATS Optimization Platform**  
> Tailored for Indian engineering students, tech graduates, and working professionals targeting premier Indian MNCs and high-growth product companies.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-emerald?style=flat&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)

---

## 🌟 Key Features

### ⚡ 1-Click ATS Resume Scanner & Gap Detector
- **Instant ATS Scoring (0–100):** Real-time heuristic scoring modeled against Indian product and service-based recruitment standards.
- **Categorized Gap Analysis:**
  - **Critical Gaps:** Identifies missing sections (Work Experience, Projects, Skills, Education), lack of contact information, or missing GitHub/LinkedIn links.
  - **Actionable Fixes:** Flags passive bullet points, suggests metric-driven quantification (e.g., *X% improvement*, *reduced latency by Y ms*), and highlights formatting risks.

### 🎯 Job Profile Radar & Skills Matcher
- **Target Role Evaluation:** Automatically matches uploaded CV content against **8 core Indian tech job profiles**:
  - Full Stack Developer (MERN / Next.js)
  - Frontend Engineer (React / TypeScript)
  - Backend Engineer (Node.js / Python / Go)
  - Java / Spring Boot Developer (Enterprise MNC)
  - AI / ML Engineer (Python / PyTorch / LLMs)
  - Data Analyst (SQL / Python / BI)
  - Cloud / DevOps Engineer (AWS / Docker / Kubernetes)
  - Mobile App Developer (Flutter / React Native)
- **Match Breakdown:** Visual progress indicators highlighting matched skills, missing critical requirements, and direct one-click links to active jobs on the job board.

### 🏛️ Indian Higher Education & Regional Hierarchy
- **Cascading Regional Selectors:** Dynamic Country $\rightarrow$ State (all 28 States & 8 UTs) $\rightarrow$ City cascading.
- **450+ Accredited Institutions:** Extensive database of IITs, NITs, IIITs, Central Universities, State Technical Universities (AKTU, VTU, SPPU, Anna Univ, MAKAUT, etc.), and premier private universities.
- **City-Smart Sorting:** When a city is selected (e.g., Bengaluru, Pune, Hyderabad, Noida), colleges physically located in that city appear at the top of the list.
- **Custom Searchable `<CollegeCombobox>`:** Interactive popover dropdown with live text filtering, college count badges, and one-click `+ Use custom: "[Name]"` option.
- **Academic Degree & Branch Mapping:** Standard Indian degree options (B.Tech, BCA, MCA, M.Tech, MBA, B.Sc) with automatic specialization cascades (CSE, AI/ML, Data Science, ECE, IT, etc.).
- **Salary Benchmarks in LPA:** CTC expectations formatted in Lakhs Per Annum (₹ LPA) customized for the Indian job ecosystem.

### 💼 Application Pipeline & Job Radar
- **Kanban-Style Application Funnel:** Track application lifecycles from *Saved* $\rightarrow$ *Applied* $\rightarrow$ *Interviewing* $\rightarrow$ *Offered* $\rightarrow$ *Rejected*.
- **Integrated Job Board:** Search and filter active job opportunities with profile-matched compatibility scores.

### 🎨 Pavitra Editorial Aesthetic
- **Warm Editorial Theme:** Warm alabaster (`#fffaf3`), soft amber badges (`#fff3df`), rich terracotta buttons (`#d97706`), deep espresso typography (`#572d12`), and subtle linen borders (`#eadcc9`).
- **Clean Accessibility:** High-contrast readability with zero noisy glassmorphism or distracting UI gimmicks.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Server & Client Components) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict mode, zero TypeScript errors) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with custom compiled editorial typography & themes |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL, Row-Level Security, Auth) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **PDF Extraction** | Deterministic client-side & server-side regex extraction heuristics |

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.17 or later)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### 2. Clone the Repository
```bash
git clone https://github.com/ujjwal403/careerpilot-ai.git
cd careerpilot-ai
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional AI Integration (OpenAI or Gemini)
GOOGLE_AI_API_KEY=your_google_ai_key
```

### 5. Setup Database Schema
Run the migration script located at [`supabase/migrations/20261031_001_initial_schema.sql`](supabase/migrations/20261031_001_initial_schema.sql) in your **Supabase SQL Editor** to create:
- `profiles` table (with user info, higher education hierarchy, and target roles)
- `resumes` table (with extracted ATS data, scores, and skills)
- `applications` table (with status tracking)
- Row Level Security (RLS) policies for complete user data isolation

### 6. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```text
careerpilot-ai/
├── src/
│   ├── app/
│   │   ├── (auth)/             # Login, Signup, Auth Callbacks
│   │   ├── (dashboard)/        # Protected User Workspace
│   │   │   ├── dashboard/      # Overview & Application Funnel
│   │   │   ├── profile/        # Indian Higher-Ed Academic Profile
│   │   │   ├── resume/         # ATS Scanner & Job Match Radar
│   │   │   ├── jobs/           # Curated Job Opportunities
│   │   │   └── applications/   # Application Tracker
│   │   ├── api/                # Serverless Next.js Route Handlers
│   │   ├── onboarding/         # 4-Step Academic & Career Wizard
│   │   ├── globals.css         # Compiled Theme Styles
│   │   └── page.tsx            # Landing Page with Hero & Features
│   ├── components/
│   │   ├── common/             # Reusable UI (CollegeCombobox, etc.)
│   │   ├── resume/             # SimpleATSScanner, ATSCompatibilityReport
│   │   ├── profile/            # ProfileForm & Regional Selectors
│   │   ├── dashboard/          # Funnel, Metrics & Recommendations
│   │   └── landing/            # Landing Page Sections
│   ├── lib/
│   │   ├── data/india-data.ts  # Indian States, Cities & 450+ Colleges
│   │   ├── ats-scorer.ts       # 10-Point ATS Audit Engine
│   │   ├── job-profile-matcher.ts # 8-Role Skill Matcher
│   │   └── supabase/           # Client, Server & Middleware instances
│   └── types/                  # TypeScript Data & Database Models
├── supabase/
│   └── migrations/             # Canonical PostgreSQL schema
├── scripts/
│   └── compile-css.mjs         # Tailwind theme compiler script
└── .env.example                # Safe environment variable template
```

---

## 🚢 Deployment (Vercel)

1. Push your code to GitHub (`git push origin main`).
2. Import the repository in [Vercel](https://vercel.com/new).
3. Under **Environment Variables**, paste the variables from your `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`).
4. Click **Deploy**. Vercel will build the Next.js project and deploy it to a live production URL.

---

## 📄 License
This project is licensed under the MIT License — feel free to customize and expand it.
