import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#fffaf3] border-t border-[#eadcc9] pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-[#eadcc9]">
          <div>
            <b className="text-xl font-bold text-[#572d12] block">
              <span className="text-[#2563eb]">CareerPilot</span> AI
            </b>
            <p className="text-xs text-[#635b52] mt-1 font-semibold uppercase tracking-wider">
              Precision • Telemetry • Growth
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-[#572d12]">
            <Link href="#collection" className="hover:text-[#2563eb] transition-colors">
              ATS Benchmark
            </Link>
            <Link href="#about" className="hover:text-[#2563eb] transition-colors">
              Who We Are
            </Link>
            <Link href="#initiatives" className="hover:text-[#2563eb] transition-colors">
              Capabilities
            </Link>
            <Link href="/jobs" className="hover:text-[#2563eb] transition-colors">
              Job Radar
            </Link>
            <Link href="/resume" className="hover:text-[#2563eb] transition-colors">
              Resume Audit
            </Link>
            <Link href="/login" className="hover:text-[#2563eb] transition-colors">
              Dashboard
            </Link>
          </div>
        </div>

        <div className="pt-8 text-center sm:text-left text-xs text-[#635b52]">
          © {new Date().getFullYear()} CareerPilot AI. All rights reserved. Built for candidates who mean business.
        </div>
      </div>
    </footer>
  )
}
