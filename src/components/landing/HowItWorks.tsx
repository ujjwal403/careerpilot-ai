import Link from 'next/link'

export function HowItWorks() {
  return (
    <section id="about" className="pavitra-section bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left Column (Pavitra Foundation .about copy & structure) */}
          <div>
            <span className="pavitra-eyebrow">WHO WE ARE</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#572d12] mt-2 mb-4 leading-tight">
              Turning career search into a culture of disciplined telemetry.
            </h2>
            <p className="text-base text-[#635b52] leading-relaxed mb-4 font-normal">
              Indian tech hiring is one of the most competitive landscapes in the world. Between high-volume recruitment drives at service firms and hyper-specific filters at product startups, hundreds of qualified candidates get silently filtered by parsing software before an engineer ever reads their work.
            </p>
            <p className="text-base text-[#635b52] leading-relaxed mb-6 font-normal">
              CareerPilot was built on a simple principle: give every candidate complete visibility into how applicant tracking systems evaluate their resume, provide human-in-the-loop verification, and connect them with genuine opportunities.
            </p>

            <div className="flex items-center gap-3">
              <Link className="pavitra-btn" href="/signup">
                Join CareerPilot Free
              </Link>
              <Link className="pavitra-btn pavitra-btn-light" href="/jobs">
                View Job Radar
              </Link>
            </div>
          </div>

          {/* Right Column (.about-box with stats exactly like Pavitra Foundation) */}
          <div className="space-y-6">
            <div className="pavitra-about-box">
              <div className="pavitra-stat">
                <b>94%</b>
                <span>Average ATS Score</span>
              </div>
              <div className="pavitra-stat">
                <b>3.4×</b>
                <span>Interview Velocity</span>
              </div>
              <div className="pavitra-stat">
                <b>12k+</b>
                <span>Offers Tracked</span>
              </div>
            </div>

            {/* Core Values Box */}
            <div className="p-6 rounded-2xl bg-[#fffaf3] border border-[#eadcc9] space-y-3">
              <span className="pavitra-eyebrow text-[11px]">OUR CORE PRINCIPLES</span>
              <div className="space-y-2 text-sm text-[#572d12]">
                <div className="flex items-start gap-2">
                  <span className="text-[#2563eb] font-bold">✓</span>
                  <div>
                    <strong>Human-in-the-Loop Verification:</strong> AI extracts, but you always have final authority to edit your verified profile before it is saved.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#2563eb] font-bold">✓</span>
                  <div>
                    <strong>Zero Spam Radar:</strong> Every role match is scored dynamically against your verified skills, location, and compensation target.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#2563eb] font-bold">✓</span>
                  <div>
                    <strong>Complete Privacy:</strong> Your resume data and verified metrics are never sold or shared without your explicit consent.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
