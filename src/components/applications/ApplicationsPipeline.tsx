'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Application, Job } from '@/types'
import { formatDate } from '@/lib/utils'
import {
  Building2,
  MapPin,
  Sparkles,
  ChevronDown,
  Trash2,
  Clock,
  Layers,
} from 'lucide-react'

type ApplicationWithJob = Application & { job?: Job }

interface ApplicationsPipelineProps {
  initialApplications: ApplicationWithJob[]
  userId?: string
}

const STATUS_OPTIONS = [
  { value: 'saved', label: 'Saved', color: 'text-[#635b52] bg-[#fffaf3] border-[#eadcc9]' },
  { value: 'applied', label: 'Applied', color: 'text-[#d97706] bg-[#fff3df] border-[#eadcc9]' },
  { value: 'screening', label: 'Screening', color: 'text-[#b45309] bg-[#fff3df] border-[#eadcc9]' },
  { value: 'interview', label: 'Interview', color: 'text-sky-800 bg-sky-50 border-sky-200' },
  { value: 'offer', label: 'Offer', color: 'text-[#166534] bg-[#f0fdf4] border-[#bbf7d0]' },
  { value: 'rejected', label: 'Rejected', color: 'text-rose-700 bg-rose-50 border-rose-200' },
] as const

export function ApplicationsPipeline({ initialApplications }: ApplicationsPipelineProps) {
  const [applications, setApplications] = useState<ApplicationWithJob[]>(initialApplications)
  const [filter, setFilter] = useState<string>('all')

  const handleStatusChange = async (appId: string, newStatus: string) => {
    const supabase = createClient()
    await supabase
      .from('applications')
      .update({ status: newStatus as Application['status'] })
      .eq('id', appId)

    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus as Application['status'] } : app))
    )
  }

  const handleDelete = async (appId: string) => {
    if (!confirm('Remove this application from your tracker?')) return
    const supabase = createClient()
    await supabase.from('applications').delete().eq('id', appId)
    setApplications((prev) => prev.filter((app) => app.id !== appId))
  }

  const filtered = filter === 'all' ? applications : applications.filter((app) => app.status === filter)

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-[#29231e]">
      {/* Status Filter Tabs */}
      <div className="rounded-2xl border border-[#eadcc9] bg-white p-3 sm:p-4 shadow-xs flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-xs'
              : 'bg-[#fff3df] border border-[#eadcc9] text-[#635b52] hover:text-[#572d12]'
          }`}
        >
          All ({applications.length})
        </button>

        {STATUS_OPTIONS.map(({ value, label }) => {
          const count = applications.filter((a) => a.status === value).length
          const isActive = filter === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-xs'
                  : 'bg-[#fff3df] border border-[#eadcc9] text-[#635b52] hover:text-[#572d12]'
              }`}
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#eadcc9] bg-white p-12 text-center shadow-xs">
            <Layers className="w-10 h-10 text-[#d97706] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#572d12]">No applications found in this stage.</p>
            <p className="text-xs text-[#635b52] mt-1">Browse the Job Radar and apply to populate your career pipeline.</p>
          </div>
        ) : (
          filtered.map((app) => {
            const currentOption = STATUS_OPTIONS.find((s) => s.value === app.status) || STATUS_OPTIONS[0]
            return (
              <div
                key={app.id}
                className="rounded-2xl border border-[#eadcc9] bg-white p-6 shadow-xs hover:border-[#d97706] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-base font-extrabold text-[#572d12]">
                      {app.job?.title || 'Engineering Role'}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534]">
                      <Sparkles className="w-3 h-3 text-[#166534]" />
                      <span>{app.ai_match_score || 94}% Fit</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[#635b52]">
                    <span className="inline-flex items-center gap-1.5 font-bold text-[#572d12]">
                      <Building2 className="w-3.5 h-3.5 text-[#d97706]" />
                      {app.job?.company || 'Partner Company'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#78716c]" />
                      {app.job?.location || 'Remote'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[#78716c]" suppressHydrationWarning>
                      <Clock className="w-3.5 h-3.5 text-[#78716c]" />
                      {app.applied_at ? `Applied ${formatDate(app.applied_at)}` : 'Saved recently'}
                    </span>
                  </div>
                </div>

                {/* Status Switcher & Remove */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="relative">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className={`appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-bold border cursor-pointer focus:outline-none ${currentOption.color}`}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-white text-[#29231e]">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(app.id)}
                    className="p-2 rounded-xl border border-[#eadcc9] hover:border-rose-300 hover:bg-rose-50 text-[#78716c] hover:text-rose-600 transition-colors cursor-pointer"
                    title="Remove from pipeline"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
