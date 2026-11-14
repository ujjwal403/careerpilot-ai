'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { BookOpen, Search, Check, ChevronDown, Plus, School, X } from 'lucide-react'

interface CollegeComboboxProps {
  value: string
  onChange: (value: string) => void
  colleges: string[]
  selectedState?: string
  placeholder?: string
  className?: string
}

export function CollegeCombobox({
  value,
  onChange,
  colleges,
  selectedState,
  placeholder = 'Select or search your college...',
  className = '',
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
  }, [searchQuery, value, onChange])

  // Filter colleges based on search query
  const filteredColleges = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      return colleges
    }
    return colleges.filter((c) => c.toLowerCase().includes(query))
  }, [colleges, searchQuery])

  const handleSelect = (collegeName: string) => {
    onChange(collegeName)
    setSearchQuery(collegeName)
    setIsOpen(false)
  }

  const handleUseCustom = () => {
    if (searchQuery.trim()) {
      onChange(searchQuery.trim())
      setIsOpen(false)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
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
          onChange={(e) => {
            setSearchQuery(e.target.value)
            onChange(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] focus:outline-hidden focus:border-[#d97706] transition-colors"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-[#78716c] hover:text-[#572d12] rounded-lg hover:bg-[#fff3df] transition-colors cursor-pointer"
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
            className="p-1 text-[#78716c] hover:text-[#d97706] rounded-lg transition-colors cursor-pointer"
            title="Toggle college list"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#d97706]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-80 overflow-y-auto rounded-2xl border border-[#eadcc9] bg-white shadow-xl shadow-[#572d12]/10 p-2 space-y-1 text-left animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Header indicator */}
          <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-[#78716c] border-b border-[#f3e8d8] mb-1">
            <span className="flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-[#d97706]" />
              {selectedState ? `Colleges in ${selectedState}` : 'All Premier Indian Institutions'}
            </span>
            <span className="text-[#d97706] font-extrabold bg-[#fff3df] px-2 py-0.5 rounded-md border border-[#eadcc9]">
              {filteredColleges.length} listed
            </span>
          </div>

          {/* If user typed custom text that isn't exact match */}
          {searchQuery.trim() && !exactMatch && (
            <button
              type="button"
              onClick={handleUseCustom}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#d97706] bg-[#fff3df] border border-[#eadcc9] hover:bg-[#ffedd5] transition-colors flex items-center justify-between cursor-pointer mb-1.5"
            >
              <span className="flex items-center gap-2 truncate">
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Use custom: &quot;{searchQuery.trim()}&quot;</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-[#b45309] shrink-0 pl-2">Select</span>
            </button>
          )}

          {/* List items */}
          {filteredColleges.length > 0 ? (
            <div className="space-y-0.5">
              {filteredColleges.map((college) => {
                const isSelected = value === college
                return (
                  <button
                    key={college}
                    type="button"
                    onClick={() => handleSelect(college)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-[#fff3df] text-[#d97706] font-bold border border-[#eadcc9]'
                        : 'text-[#29231e] hover:bg-[#fffaf3] hover:text-[#572d12]'
                    }`}
                  >
                    <span className="truncate">{college}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#d97706] shrink-0" />}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="py-6 px-4 text-center">
              <p className="text-xs font-bold text-[#572d12] mb-1">
                No matching college found for &quot;{searchQuery}&quot;
              </p>
              <p className="text-[11px] text-[#78716c] mb-3">
                You can still add and use your exact college name below:
              </p>
              <button
                type="button"
                onClick={handleUseCustom}
                className="pavitra-btn pavitra-btn-primary pavitra-btn-sm font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer mx-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Use &quot;{searchQuery.trim()}&quot; as my College</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

