'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { BookOpen, Search, Check, ChevronDown, Plus, School, X, Lock } from 'lucide-react'

interface CollegeComboboxProps {
  value: string
  onChange: (value: string) => void
  colleges: string[]
  selectedState?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function CollegeCombobox({
  value,
  onChange,
  colleges,
  selectedState,
  placeholder = 'Select or search your college...',
  className = '',
  disabled = false,
}: CollegeComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep search query synced with value when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery(value)
    }
  }, [value, isOpen])

  // Close on outside click
  useEffect(() => {
    if (disabled) return
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        // If user typed something and blurred, keep their typed input as custom college
        if (searchQuery.trim() && searchQuery.trim() !== value) {
          onChange(searchQuery.trim())
        }
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [searchQuery, value, onChange, disabled])

  // Filter colleges based on search query
  const filteredColleges = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      return colleges
    }
    return colleges.filter((c) => c.toLowerCase().includes(query))
  }, [colleges, searchQuery])

  const handleSelect = (collegeName: string) => {
    if (disabled) return
    onChange(collegeName)
    setSearchQuery(collegeName)
    setIsOpen(false)
  }

  const handleUseCustom = () => {
    if (disabled) return
    if (searchQuery.trim()) {
      onChange(searchQuery.trim())
      setIsOpen(false)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    if (disabled) return
    e.stopPropagation()
    onChange('')
    setSearchQuery('')
    inputRef.current?.focus()
  }

  const exactMatch = colleges.some(
    (c) => c.toLowerCase() === searchQuery.trim().toLowerCase()
  )

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Combobox Input Trigger */}
      <div className="relative">
        <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c] pointer-events-none" />
        
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          disabled={disabled}
          readOnly={disabled}
          onChange={(e) => {
            if (disabled) return
            setSearchQuery(e.target.value)
            onChange(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => {
            if (!disabled) setIsOpen(true)
          }}
          placeholder={placeholder}
          className={`w-full pl-10 pr-20 py-2.5 rounded-xl border border-[#eadcc9] text-xs sm:text-sm transition-colors ${
            disabled
              ? 'bg-[#f7f2eb] text-[#635b52] cursor-not-allowed select-none'
              : 'bg-[#fffaf3] text-[#29231e] focus:outline-hidden focus:border-[#2563eb]'
          }`}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {disabled ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#78716c] bg-[#ede3d7] px-2 py-0.5 rounded-md">
              <Lock className="w-3 h-3 text-[#78716c]" />
              Locked
            </span>
          ) : (
            <>
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 text-[#78716c] hover:text-[#572d12] rounded-lg hover:bg-[#eff6ff] transition-colors cursor-pointer"
                  title="Clear input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsOpen(!isOpen)
                  if (!isOpen) inputRef.current?.focus()
                }}
                className="p-1 text-[#78716c] hover:text-[#2563eb] rounded-lg transition-colors cursor-pointer"
                title="Toggle college list"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#2563eb]' : ''}`} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Popover Dropdown */}
      {!disabled && isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-[#eadcc9] rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header count info */}
          <div className="px-4 py-2 bg-[#fffaf3] border-b border-[#eadcc9] flex items-center justify-between text-[11px] font-bold text-[#78716c]">
            <span className="flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-[#2563eb]" />
              {selectedState ? `${selectedState} Institutions` : 'All Accredited Colleges'}
            </span>
            <span className="bg-[#eff6ff] text-[#2563eb] px-2 py-0.5 rounded-full border border-[#eadcc9]">
              {filteredColleges.length} listed
            </span>
          </div>

          {/* College Options List */}
          <div className="max-h-64 overflow-y-auto p-1 divide-y divide-[#f5ede3]/60">
            {filteredColleges.length > 0 ? (
              filteredColleges.map((college) => {
                const isSelected = value.toLowerCase() === college.toLowerCase()
                return (
                  <button
                    key={college}
                    type="button"
                    onClick={() => handleSelect(college)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#eff6ff] text-[#2563eb] font-bold'
                        : 'text-[#29231e] hover:bg-[#fffaf3] hover:text-[#572d12]'
                    }`}
                  >
                    <span className="truncate">{college}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#2563eb] shrink-0" />}
                  </button>
                )
              })
            ) : (
              <div className="p-4 text-center">
                <p className="text-xs text-[#78716c] mb-2">No institution matching &ldquo;{searchQuery}&rdquo;</p>
              </div>
            )}
          </div>

          {/* Add Custom College Footer Option */}
          {searchQuery.trim() && !exactMatch && (
            <div className="p-2 border-t border-[#eadcc9] bg-[#fffaf3]">
              <button
                type="button"
                onClick={handleUseCustom}
                className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold text-[#2563eb] hover:bg-[#eff6ff] border border-dashed border-[#2563eb]/40 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4 text-[#2563eb] shrink-0" />
                <span className="truncate">Use custom: &ldquo;{searchQuery.trim()}&rdquo;</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
