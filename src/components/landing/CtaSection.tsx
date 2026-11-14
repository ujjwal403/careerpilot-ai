import Link from 'next/link'

const CAPABILITIES = [
  {
    title: 'Deterministic ATS Scorer',
    desc: 'Audit your resume across 10 strict recruitment rules with instant percentage match feedback and actionable gap suggestions.',
    badge: 'Instant Audit',
    icon: '📊',
  },
  {
    title: 'Interactive Verification',
    desc: 'Review everything the AI extracts. Edit college names, adjust CGPA, and add verified skill tags before saving to your profile.',
    badge: 'Human Control',
    icon: '✍️',
  },
  {
    title: 'Verified Job Radar',
    desc: 'Live vacancies cross-referenced directly with your tech stack, seniority level, and target compensation. Zero recruiter spam.',
    badge: 'Smart Radar',
    icon: '🎯',
  },
  {
    title: 'Application Pipeline',
    desc: 'Structured 5-stage tracking: Saved ➔ Applied ➔ Screening ➔ Interview ➔ Offer. Never lose an opportunity.',
    badge: 'Full Visibility',
    icon: '📁',
  },
]

export function CtaSection() {
  return (
    <>
      {/* Pavitra Foundation Major Initiatives Section (.section.alt) */}
      <section id="initiatives" className="pavitra-section pavitra-section-alt">
        <div className="max-w-7xl mx-auto px-6">
          <div className="pavitra-section-head">
            <span className="pavitra-eyebrow">WHAT WE DO</span>
            <h2>Our Core Career Co-Pilot Capabilities</h2>
            <p>
              Every capability is designed to eliminate tedious manual work, showcase your true skills, and fast-track interviews.
            </p>
          </div>

          <div className="pavitra-cards-grid">
            {CAPABILITIES.map((cap) => (
              <div key={cap.title} className="pavitra-work-card">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{cap.icon}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#fff3df] text-[#d97706] border border-[#eadcc9]">
                      {cap.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#572d12] mb-2">{cap.title}</h3>
                  <p className="text-xs sm:text-sm text-[#635b52] leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#eadcc9]">
                  <Link
                    href="/resume"
                    className="text-xs font-bold text-[#d97706] hover:text-[#b45309]"
                  >
                    Learn More ↗
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pavitra Foundation Support / Registration Section */}
      <section className="pavitra-section bg-[#fffaf3]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white border border-[#eadcc9] rounded-3xl p-8 sm:p-14 shadow-xs text-center">
            <span className="pavitra-eyebrow">START FREE TODAY</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#572d12] mt-2 mb-4">
              Your next offer starts with clean, verified telemetry.
            </h2>
            <p className="text-base text-[#635b52] max-w-xl mx-auto mb-8 leading-relaxed font-normal">
              Audit your resume against Fortune 500 ATS criteria in under 60 seconds, uncover verified openings, and track every stage of your career.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="pavitra-btn w-full sm:w-auto"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="pavitra-btn pavitra-btn-light w-full sm:w-auto"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
