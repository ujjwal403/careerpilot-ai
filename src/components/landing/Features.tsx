'use client'

import { useState } from 'react'
import Link from 'next/link'

const ALL_RULES = [
  {
    dimension: 'Contact Completeness',
    category: 'Contact',
    rule: 'Phone, email, and location clearly visible for automated text parsers without graphical noise.',
    standard: 'Mandatory',
    score: '10/10 Score',
    status: 'Verified',
  },
  {
    dimension: 'LinkedIn & Portfolio Links',
    category: 'Contact',
    rule: 'Direct links to GitHub, LinkedIn, or portfolio. Auto-formatted for one-click recruiter viewing.',
    standard: 'High Priority',
    score: '10/10 Score',
    status: 'Verified',
  },
  {
    dimension: 'Skill Density & Tagging',
    category: 'Technical',
    rule: 'At least 5+ verified in-demand skills mapped directly against target job role taxonomy.',
    standard: 'Critical',
    score: '14 Tags',
    status: 'Verified',
  },
  {
    dimension: 'Academic Metrics (CGPA / %)',
    category: 'Academics',
    rule: 'Explicit percentage or CGPA score included to satisfy strict TCS, Infosys, and MNC screening filters.',
    standard: 'Fresher Filter',
    score: '8.5+ Verified',
    status: 'Verified',
  },
  {
    dimension: 'Action-Driven Phrasing',
    category: 'Content',
    rule: 'Strong verbs ("Engineered", "Optimized", "Architected") replacing passive phrasing ("Helped with").',
    standard: 'Content Quality',
    score: 'Zero Passive',
    status: 'Verified',
  },
  {
    dimension: 'Quantifiable Metrics & Numbers',
    category: 'Impact',
    rule: 'Measurable numbers ("Reduced latency by 40%", "Scaled service to 50k users") for high-signal proof.',
    standard: 'Impact Score',
    score: 'Quantified',
    status: 'Verified',
  },
  {
    dimension: 'Standard Section Headings',
    category: 'Structure',
    rule: 'Standard section titles (Experience, Education, Skills, Projects) so parsers do not choke.',
    standard: 'Parsing Architecture',
    score: 'Clean Standard',
    status: 'Verified',
  },
  {
    dimension: 'Format Cleanliness & Scannability',
    category: 'Structure',
    rule: 'Clean, sequential text flow with zero encoding errors, complex tables, or multi-column layout breaks.',
    standard: 'Syntax Scan',
    score: 'Zero Encoding Noise',
    status: 'Verified',
  },
  {
    dimension: 'Resume Length & Conciseness',
    category: 'Format',
    rule: 'Strictly 1 page for freshers, 1–2 pages for professionals with over 4 years experience.',
    standard: 'Length Threshold',
    score: '1 Page Target',
    status: 'Verified',
  },
  {
    dimension: 'Certifications & Extra-Curriculars',
    category: 'Distinction',
    rule: 'Recognized industry credentials and leadership roles that make candidates stand out in Indian applicant pools.',
    standard: 'Final Distinction',
    score: '3 Verified',
    status: 'Verified',
  },
]

export function Features() {
  const [search, setSearch] = useState('')

  const filteredRules = ALL_RULES.filter(
    (r) =>
      r.dimension.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase()) ||
      r.rule.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <section id="collection" className="pavitra-section bg-[#fffaf3]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Head (Pavitra Foundation .section-head style) */}
        <div className="pavitra-section-head">
          <span className="pavitra-eyebrow">OUR SIGNATURE INITIATIVE</span>
          <h2>10-Point Deterministic ATS Recruiter Benchmark</h2>
          <p>
            See all 10 automated screening filters used across Indian tech companies and MNC applicant tracking systems, sorted by recruiter priority.
          </p>
        </div>

        {/* Toolbar & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3 flex-1 max-w-lg bg-white border border-[#eadcc9] rounded-xl px-4 py-3 shadow-xs">
            <span className="text-[#2563eb] text-lg">🔍</span>
            <input
              type="text"
              placeholder="Search ATS rules e.g. CGPA, Skills, Verbs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-0 outline-hidden text-sm text-[#29231e] placeholder:text-[#9b9186]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-xs text-[#635b52] hover:text-[#2563eb]"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-xs font-semibold text-[#635b52] sm:text-right">
            Showing {filteredRules.length} of 10 Evaluated ATS Dimensions
          </div>
        </div>

        {/* Pavitra Foundation Points Table */}
        <div className="pavitra-table-wrap">
          <table className="pavitra-points-table">
            <thead>
              <tr>
                <th>Rule Dimension</th>
                <th>Category</th>
                <th>Recruiter Criteria</th>
                <th>Industry Standard</th>
                <th>Benchmark Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.map((rule) => (
                <tr key={rule.dimension}>
                  <td className="font-bold text-[#572d12] whitespace-nowrap">
                    {rule.dimension}
                  </td>
                  <td className="text-xs font-mono text-[#635b52] whitespace-nowrap">
                    {rule.category}
                  </td>
                  <td className="text-xs leading-relaxed max-w-md text-[#635b52]">
                    {rule.rule}
                  </td>
                  <td className="whitespace-nowrap">
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#eff6ff] text-[#2563eb] border border-[#eadcc9]">
                      {rule.standard}
                    </span>
                  </td>
                  <td className="whitespace-nowrap">
                    <span className="text-xs font-bold text-[#166534]">
                      ✓ {rule.score}
                    </span>
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <Link
                      href="/resume"
                      className="pavitra-btn pavitra-btn-sm text-xs py-1.5 px-3"
                    >
                      Audit Rule
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Banner */}
        <div className="mt-8 p-4 rounded-xl bg-[#eff6ff] border border-[#eadcc9] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#572d12]">
          <div>
            <strong>Interactive Verification:</strong> Before saving to your database, inspect and edit extracted skills, academic scores, and contact details with full human control.
          </div>
          <Link
            href="/resume"
            className="pavitra-btn pavitra-btn-sm shrink-0"
          >
            Open Verification Screen
          </Link>
        </div>
      </div>
    </section>
  )
}
