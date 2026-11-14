# CareerPilot AI 🧭

> **Autonomous AI Career Navigation & ATS Optimization Platform**  
> Tailored for engineering students, tech graduates, and working professionals targeting premier MNCs and high-growth product companies.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)

---

## 🌟 Key Features

### ⚡ 1-Click ATS Resume Scanner & Gap Detector
- **Instant ATS Scoring (0–100):** Real-time heuristic scoring modeled against modern recruitment standards.
- **Categorized Gap Analysis:**
  - **Critical Gaps:** Identifies missing sections (Work Experience, Projects, Skills, Education), lack of contact information, or missing GitHub/portfolio links.
  - **Actionable Fixes:** Flags passive bullet points, suggests metric-driven quantification (e.g., *X% improvement*, *reduced latency by Y ms*), and highlights formatting risks.

### 🎯 Job Profile Radar & Skills Matcher
- **Target Role Evaluation:** Automatically matches uploaded CV content against **8 core tech job profiles**:
  - Full Stack Developer (MERN / Next.js)
  - Frontend Engineer (React / TypeScript)
  - Backend Engineer (Node.js / Python / Go)
  - Java / Spring Boot Developer (Enterprise)
  - AI / ML Engineer (Python / PyTorch / LLMs)
  - Data Analyst (SQL / Python / BI)
  - Cloud / DevOps Engineer (AWS / Docker / Kubernetes)
  - Mobile App Developer (Flutter / React Native)
- **Match Breakdown:** Visual progress indicators highlighting matched skills, missing critical requirements, and direct links to active jobs.

### 🏛️ Higher Education & Regional Hierarchy
- **Cascading Regional Selectors:** Dynamic Country $\rightarrow$ State $\rightarrow$ City cascading.
- **450+ Accredited Institutions:** Extensive directory of universities, technical institutes, and premier engineering colleges.
- **City-Smart Sorting:** When a city is selected, colleges physically located in that city appear at the top of the list.
- **Custom Searchable `<CollegeCombobox>`:** Interactive popover dropdown with live text filtering, college count badges, and one-click custom college option.
- **Academic Degree & Branch Mapping:** Standard degree options with automatic specialization cascades (CSE, AI/ML, Data Science, ECE, IT, etc.).
- **Salary Benchmarks in LPA:** CTC expectations formatted in Lakhs Per Annum (₹ LPA).

### 💼 Application Pipeline & Job Radar
- **Kanban-Style Application Funnel:** Track application lifecycles from *Saved* $\rightarrow$ *Applied* $\rightarrow$ *Interviewing* $\rightarrow$ *Offered* $\rightarrow$ *Rejected*.
- **Integrated Job Board:** Search and filter active job opportunities with profile-matched compatibility scores.

### 🎨 Editorial Aesthetic
- **Warm Theme:** Warm alabaster, soft amber accents, rich terracotta buttons, deep espresso typography, and subtle linen borders.
- **Clean Accessibility:** High-contrast readability with zero noisy glassmorphism or distracting UI gimmicks.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Server & Client Components) |
| **Language** | TypeScript (Strict mode, zero errors) |
| **Styling** | Tailwind CSS v4 with custom compiled editorial typography & themes |
| **Icons** | Lucide React |
| **PDF Extraction** | Client-side & server-side regex extraction heuristics |

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.17 or later)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### 2. Clone the Repository
```bash
git clone https://github.com/<your-username>/careerpilot-ai.git
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

Configure your environment variables as outlined in `.env.example`.

### 5. Run the Development Server
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
│   │   ├── (dashboard)/        # User Workspace
│   │   │   ├── dashboard/      # Overview & Application Funnel
│   │   │   ├── profile/        # Academic & Regional Profile
│   │   │   ├── resume/         # ATS Scanner & Job Match Radar
│   │   │   ├── jobs/           # Curated Job Opportunities
│   │   │   └── applications/   # Application Tracker
│   │   ├── api/                # Route Handlers
│   │   ├── onboarding/         # 4-Step Academic & Career Wizard
│   │   ├── globals.css         # Compiled Theme Styles
│   │   └── page.tsx            # Landing Page
│   ├── components/
│   │   ├── common/             # Reusable UI (CollegeCombobox, etc.)
│   │   ├── resume/             # SimpleATSScanner, ATSCompatibilityReport
│   │   ├── profile/            # ProfileForm & Regional Selectors
│   │   ├── dashboard/          # Funnel, Metrics & Recommendations
│   │   └── landing/            # Landing Page Sections
│   ├── lib/
│   │   ├── data/india-data.ts  # Regional Datasets & College Directory
│   │   ├── ats-scorer.ts       # 10-Point ATS Audit Engine
│   │   └── job-profile-matcher.ts # 8-Role Skill Matcher
│   └── types/                  # TypeScript Data Models
├── scripts/
│   └── compile-css.mjs         # CSS compile script
└── .env.example                # Environment variable template
```

---

## 📄 License
This project is licensed under the MIT License.
