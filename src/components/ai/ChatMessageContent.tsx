'use client'

import React, { useState } from 'react'
import { Copy, Check, Terminal, Lightbulb, AlertCircle } from 'lucide-react'

interface ChatMessageContentProps {
  content: string
  isUser?: boolean
}

// Helper to format inline markdown (bold, code, links)
function renderInline(text: string, isUser = false) {
  // Regex to match **bold**, `code`, and plain text
  const parts: React.ReactNode[] = []
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const token = match[0]
    if (token.startsWith('**') && token.endsWith('**')) {
      const boldText = token.slice(2, -2)
      parts.push(
        <strong
          key={`${match.index}-bold`}
          className={isUser ? 'font-bold text-white' : 'font-extrabold text-[#572d12]'}
        >
          {boldText}
        </strong>
      )
    } else if (token.startsWith('`') && token.endsWith('`')) {
      const codeText = token.slice(1, -1)
      parts.push(
        <code
          key={`${match.index}-code`}
          className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
            isUser
              ? 'bg-white/20 text-white'
              : 'bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]/60 font-semibold'
          }`}
        >
          {codeText}
        </code>
      )
    } else if (token.startsWith('*') && token.endsWith('*')) {
      const italicText = token.slice(1, -1)
      parts.push(
        <em key={`${match.index}-italic`} className="italic">
          {italicText}
        </em>
      )
    }

    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="my-2.5 rounded-xl border border-[#eadcc9] bg-[#29231e] text-[#f5f0ea] overflow-hidden shadow-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1f1a16] border-b border-[#3d342d] text-[10px] text-[#a8a29e]">
        <div className="flex items-center gap-1.5 font-mono">
          <Terminal className="w-3 h-3 text-[#60a5fa]" />
          <span>{language || 'code'}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded bg-white/10"
        >
          {copied ? (
            <>
              <Check className="w-2.5 h-2.5 text-emerald-400" />
              <span className="text-[9px] text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-2.5 h-2.5" />
              <span className="text-[9px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 text-[11px] font-mono leading-relaxed overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export function ChatMessageContent({ content, isUser = false }: ChatMessageContentProps) {
  if (isUser) {
    return <div className="leading-relaxed whitespace-pre-wrap">{content}</div>
  }

  // Split content into blocks by code fences first
  const blocks: React.ReactNode[] = []
  const lines = content.split('\n')
  let currentList: { type: 'bullet' | 'number'; items: string[] } | null = null
  let inCodeBlock = false
  let codeBuffer: string[] = []
  let codeLanguage = ''

  const flushList = () => {
    if (!currentList || currentList.items.length === 0) return

    if (currentList.type === 'bullet') {
      blocks.push(
        <ul key={`list-${blocks.length}`} className="my-2 space-y-1.5 pl-0.5">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs sm:text-[13px] leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] shrink-0 mt-1.5" />
              <span className="flex-1">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      )
    } else {
      blocks.push(
        <ol key={`list-${blocks.length}`} className="my-2 space-y-1.5 pl-0.5">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs sm:text-[13px] leading-relaxed">
              <span className="w-4 h-4 rounded-md bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]/60 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="flex-1">{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      )
    }
    currentList = null
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    const trimmed = rawLine.trim()

    // Handle code fence
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        blocks.push(
          <CodeBlock
            key={`code-${blocks.length}`}
            code={codeBuffer.join('\n')}
            language={codeLanguage}
          />
        )
        codeBuffer = []
        codeLanguage = ''
        inCodeBlock = false
      } else {
        flushList()
        inCodeBlock = true
        codeLanguage = trimmed.replace(/^```/, '').trim()
      }
      continue
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine)
      continue
    }

    // Check for empty line
    if (!trimmed) {
      flushList()
      continue
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList()
      const headingText = trimmed.replace(/^###\s+/, '')
      blocks.push(
        <div key={`h3-${i}`} className="mt-3.5 mb-1.5 first:mt-0 flex items-center gap-1.5">
          <div className="w-1 h-3.5 rounded-full bg-[#2563eb]" />
          <h4 className="text-xs sm:text-[13px] font-extrabold text-[#572d12] tracking-tight">
            {renderInline(headingText)}
          </h4>
        </div>
      )
      continue
    }

    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      flushList()
      const headingText = trimmed.replace(/^#+\s+/, '')
      blocks.push(
        <div key={`h2-${i}`} className="mt-4 mb-2 first:mt-0 pb-1 border-b border-[#eadcc9]">
          <h3 className="text-sm font-black text-[#572d12] tracking-tight">
            {renderInline(headingText)}
          </h3>
        </div>
      )
      continue
    }

    // Callout / Warning / Tip Box
    if (
      trimmed.startsWith('⚠️') ||
      trimmed.toLowerCase().startsWith('note:') ||
      trimmed.toLowerCase().startsWith('warning:') ||
      trimmed.startsWith('💡') ||
      trimmed.toLowerCase().startsWith('tip:')
    ) {
      flushList()
      const isTip = trimmed.startsWith('💡') || trimmed.toLowerCase().startsWith('tip:')
      blocks.push(
        <div
          key={`callout-${i}`}
          className={`my-2.5 p-2.5 rounded-xl border flex items-start gap-2 text-xs leading-relaxed ${
            isTip
              ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]'
              : 'bg-[#eff6ff] border-[#bfdbfe] text-[#1e40af]'
          }`}
        >
          {isTip ? (
            <Lightbulb className="w-4 h-4 text-[#166534] shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#2563eb] shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{renderInline(trimmed)}</div>
        </div>
      )
      continue
    }

    // Bullet list items (*, -, •)
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/)
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'bullet') {
        flushList()
        currentList = { type: 'bullet', items: [] }
      }
      currentList.items.push(bulletMatch[1])
      continue
    }

    // Numbered list items (1., 2., etc.)
    const numberMatch = trimmed.match(/^\d+\.\s+(.*)$/)
    if (numberMatch) {
      if (!currentList || currentList.type !== 'number') {
        flushList()
        currentList = { type: 'number', items: [] }
      }
      currentList.items.push(numberMatch[1])
      continue
    }

    // Plain paragraph text
    flushList()
    blocks.push(
      <p key={`p-${i}`} className="text-xs sm:text-[13px] leading-relaxed text-[#29231e]">
        {renderInline(trimmed)}
      </p>
    )
  }

  flushList()

  // Catch unclosed code block if any
  if (inCodeBlock && codeBuffer.length > 0) {
    blocks.push(
      <CodeBlock
        key={`code-end`}
        code={codeBuffer.join('\n')}
        language={codeLanguage}
      />
    )
  }

  return <div className="space-y-2">{blocks}</div>
}

