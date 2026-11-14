import Link from 'next/link'
import { Compass } from 'lucide-react'

export function Hero() {
  return (
    <section className="pavitra-hero">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.8fr] gap-12 lg:gap-16 items-center">
          {/* Left Column (Exact Pavitra Foundation hero copy & layout) */}
          <div>
            <span className="pavitra-eyebrow">
              CAREERPILOT AI • VALUES • DEDICATION • GROWTH
            </span>

            <h1>
              Respect Your Craft.<br />
              <span>Protect Your Career.</span>
            </h1>

            <p className="text-lg text-[#635b52] leading-relaxed max-w-2xl font-normal my-4">
              Every candidate deserves an honest, transparent evaluation. Automated ATS systems filter candidate resumes at TCS, Infosys, and global MNCs before any recruiter ever reviews them. CareerPilot audits your resume against 10 strict industry parsing rules, eliminates passive phrasing, and pairs you with verified technical vacancies.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 my-7">
              <Link className="pavitra-btn" href="/signup">
                Start Free ATS Audit
              </Link>
              <Link className="pavitra-btn pavitra-btn-light" href="/jobs">
                Find Verified Openings
              </Link>
            </div>

            <div className="pavitra-trust">
              <span>❤️ Dedication</span>
              <span>🎯 10-Point ATS Benchmark</span>
              <span>🇮🇳 Indian & MNC Recruiter Standard</span>
            </div>
          </div>

          {/* Right Column (.hero-card directly inspired by Pavitra Foundation) */}
          <div className="pavitra-hero-card">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#d97706] to-[#b45309] text-white shadow-md shadow-[#d97706]/20 mb-3">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#572d12] mt-2 mb-2">
              One small step for your career
            </h3>
            <p className="text-sm text-[#635b52] leading-relaxed mb-5">
              If you are submitting applications this season, please do not blast unverified resumes into silent applicant tracking portals. Run an instant 60-second ATS audit first.
            </p>

            <Link className="pavitra-btn pavitra-btn-full text-center" href="/resume">
              📍 Start 60-Second Resume Audit
            </Link>

            <div className="pavitra-office-details">
              <span className="pavitra-eyebrow text-[11px]">ARCHITECTURE & VERIFICATION</span>
              <p><strong>Platform:</strong> CareerPilot AI Engineering</p>
              <p><strong>Recruiter Hub:</strong> Bengaluru • Hyderabad • Delhi NCR</p>
              <p className="text-xs text-[#78716c] mt-1">Benchmarked against Fortune 500 ATS Algorithms</p>
              <Link
                href="/jobs"
                className="inline-block text-xs font-bold text-[#d97706] hover:underline mt-2"
              >
                View verified engineering radar on CareerPilot ↗
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
