'use client'

import { useState } from 'react'
import type { ATSScorerResult } from '@/lib/ats-scorer'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Edit3,
  Award,
} from 'lucide-react'

interface ATSCompatibilityReportProps {
  report: ATSScorerResult
  onOpenVerification?: () => void
  onReanalyze?: () => void
  isAnalyzing?: boolean
}

export function ATSCompatibilityReport({
  report,
  onOpenVerification,
  onReanalyze,
  isAnalyzing,
}: ATSCompatibilityReportProps) {
  const [filter, setFilter] = useState<'all' | 'passed' | 'warning' | 'failed'>('all')
  const [expandedRule, setExpandedRule] = useState<string | null>(null)

  const { totalScore, ratingTier, ratingSummary, targetReadiness, rules } = report

  const passedCount = rules.filter((r) => r.status === 'passed').length
  const warningCount = rules.filter((r) => r.status === 'warning').length
  const failedCount = rules.filter((r) => r.status === 'failed').length

  const filteredRules = rules.filter((r) => {
    if (filter === 'all') return true
    return r.status === filter
  })

  // Theme styling matching Pavitra Foundation editorial palette
  const getScoreTheme = (score: number) => {
    if (score >= 85) {
      return {
        text: 'text-[#166534]',
        bg: 'bg-[#f0fdf4]',
        border: 'border-[#bbf7d0]',
        badge: 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]',
      }
    }
    if (score >= 60) {
      return {
        text: 'text-[#2563eb]',
        bg: 'bg-[#eff6ff]',
        border: 'border-[#eadcc9]',
        badge: 'bg-[#eff6ff] text-[#2563eb] border-[#eadcc9]',
      }
    }
    return {
      text: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
    }
  }

  const theme = getScoreTheme(totalScore)

  return (
    <div className="bg-white border border-[#eadcc9] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 text-[#29231e]">
      {/* Header & Overall Score */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#eadcc9]">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-[#eadcc9] bg-[#eff6ff] text-[#2563eb]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2563eb]" />
              <span>ATS Compatibility Benchmark (0–100)</span>
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
              {ratingTier}
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#572d12]">
            Indian Recruiter & MNC ATS Evaluation
          </h3>

          <p className="text-xs sm:text-sm text-[#635b52] leading-relaxed">
            {ratingSummary}
          </p>

          <div className="pt-1 flex items-center gap-2 text-xs text-[#572d12]">
            <Award className="w-4 h-4 text-[#2563eb] shrink-0" />
            <span className="font-semibold">{targetReadiness}</span>
          </div>
        </div>

        {/* Big Score Summary Box (Clean Warm Sand - No dark background) */}
        <div className="flex items-center justify-center sm:justify-start gap-6 p-5 rounded-2xl border border-[#eadcc9] bg-[#fffaf3] shrink-0 shadow-xs">
          <div className="text-center">
            <div className={`text-4xl sm:text-5xl font-black tracking-tight font-mono ${theme.text}`}>
              {totalScore}
              <span className="text-xl sm:text-2xl text-[#78716c] font-normal">/100</span>
            </div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#635b52] mt-1 font-bold">
              ATS Match Rating
            </p>
          </div>

          <div className="h-12 w-[1px] bg-[#eadcc9]" />

          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2 text-[#166534] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{passedCount} Passed</span>
            </div>
            <div className="flex items-center gap-2 text-[#1d4ed8] font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{warningCount} Warnings</span>
            </div>
            {failedCount > 0 && (
              <div className="flex items-center gap-2 text-rose-700 font-bold">
                <XCircle className="w-3.5 h-3.5" />
                <span>{failedCount} Gaps</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Quick Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Segmented Filter Pills */}
        <div className="inline-flex items-center gap-1.5 p-1 rounded-xl border border-[#eadcc9] bg-[#eff6ff] text-xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white shadow-xs'
                : 'text-[#635b52] hover:text-[#572d12]'
            }`}
          >
            All 10 Rules ({rules.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('passed')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filter === 'passed'
                ? 'bg-white text-[#166534] border border-[#eadcc9] shadow-xs'
                : 'text-[#635b52] hover:text-[#166534]'
            }`}
          >
            Passed ({passedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('warning')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filter === 'warning'
                ? 'bg-white text-[#1d4ed8] border border-[#eadcc9] shadow-xs'
                : 'text-[#635b52] hover:text-[#1d4ed8]'
            }`}
          >
            Action Needed ({warningCount + failedCount})
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onReanalyze && (
            <button
              type="button"
              onClick={onReanalyze}
              disabled={isAnalyzing}
              className="pavitra-btn pavitra-btn-light pavitra-btn-sm inline-flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#2563eb] ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Scanning...' : 'Re-scan CV'}</span>
            </button>
          )}

          {onOpenVerification && (
            <button
              type="button"
              onClick={onOpenVerification}
              className="pavitra-btn pavitra-btn-sm inline-flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Fix Gaps in Verification Screen</span>
            </button>
          )}
        </div>
      </div>

      {/* 10 Rules Structured Evaluation Table (Clean Pavitra Foundation style - NOT 10 heavy dark cards!) */}
      <div className="border border-[#eadcc9] rounded-2xl overflow-hidden shadow-xs bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#eff6ff] border-b border-[#eadcc9] text-xs font-bold uppercase tracking-wider text-[#572d12]">
                <th className="py-3.5 px-5">Rule Dimension</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Evaluation Findings</th>
                <th className="py-3.5 px-5 text-center">Score</th>
                <th className="py-3.5 px-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eadcc9] text-xs">
              {filteredRules.map((rule) => {
                const isPassed = rule.status === 'passed'
                const isWarning = rule.status === 'warning'
                const isExpanded = expandedRule === rule.id

                return (
                  <tr
                    key={rule.id}
                    onClick={() => setExpandedRule(isExpanded ? null : rule.id)}
                    className="hover:bg-[#fffaf3] transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-5 font-bold text-[#572d12] whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        {isPassed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-4 h-4 text-[#1d4ed8] shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span>{rule.name}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5 font-mono text-[#78716c] whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-[#fffaf3] border border-[#eadcc9] text-[11px] font-semibold text-[#635b52]">
                        {rule.category}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-[#635b52] leading-relaxed max-w-md">
                      <div>{rule.details}</div>
                      {isExpanded && (
                        <div className="mt-2 pt-2 border-t border-[#eadcc9] space-y-1.5 animate-in fade-in duration-150">
                          <p className="text-[11px] text-[#78716c]">{rule.description}</p>
                          {rule.suggestion && (
                            <div className="p-2.5 rounded-lg bg-[#eff6ff] border border-[#eadcc9] text-[#572d12] font-medium text-[11px] flex items-start gap-1.5">
                              <span className="text-[#2563eb] font-bold">💡 Fix:</span>
                              <span>{rule.suggestion}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-5 text-center whitespace-nowrap">
                      <span
                        className={`font-mono font-bold px-2.5 py-1 rounded-md border text-xs ${
                          isPassed
                            ? 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]'
                            : isWarning
                            ? 'bg-[#eff6ff] text-[#1d4ed8] border-[#eadcc9]'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {rule.score}/{rule.maxScore}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        className="text-[#635b52] hover:text-[#2563eb] inline-flex items-center gap-1 font-semibold"
                      >
                        <span>{isExpanded ? 'Less' : 'Review'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recruiter Insights Callout (Matching Warm Dashboard) */}
      <div className="p-4 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs text-[#635b52] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span>
          <span>
            Evaluated against strict screening benchmarks from <strong className="text-[#572d12]">TCS, Infosys, Wipro, Swiggy, Flipkart, Razorpay</strong>, and tier-1 product MNCs.
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#78716c] font-bold shrink-0">
          10-Rule ATS Engine v2.0
        </span>
      </div>
    </div>
  )
}
