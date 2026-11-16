'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  RotateCcw,
  Maximize2,
  Minimize2,
  Loader2,
  Clock,
  ShieldAlert,
  Copy,
  Check,
} from 'lucide-react'
import { ChatMessageContent } from './ChatMessageContent'

interface ChatMessage {
  id: string
  role: 'user' | 'model'
  text: string
  timestamp: string
}

interface AskAICopilotProps {
  initialOpen?: boolean
  userProfile?: {
    degree?: string
    field_of_study?: string
    college_name?: string
    skills?: string[]
    desired_roles?: string[]
    headline?: string
  }
}

const QUICK_SUGGESTIONS = [
  '🎯 How to reach 90+ ATS score on my resume?',
  '🚀 Top 3 projects to build for Full-Stack internships',
  '✉️ Cold email template for startup founders',
  '💡 Tips to crack Blinkit & Swiggy technical rounds',
  '📝 How do I explain low CGPA or gap year in interviews?',
]

export function AskAICopilot({ initialOpen = false, userProfile }: AskAICopilotProps) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello! I'm your **CareerPilot AI Copilot**.\n\n⚠️ **Usage Rule:** Every user can ask **1 question at a time**. Once answered, you can ask your next question!\n\nAsk me about resume impact bullets, cold email templates to founders, standout project architectures, or interview roadmaps!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleCopyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // fallback
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      if (!loading && cooldown === 0) {
        setTimeout(() => inputRef.current?.focus(), 150)
      }
    }
  }, [isOpen, messages, loading, cooldown])

  // Cooldown timer: 1 question at a time throttle
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleSend = async (messageToSend?: string) => {
    const text = messageToSend || input.trim()
    if (!text || loading || cooldown > 0) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.text,
      }))

      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          userProfile,
        }),
      })

      const data = await res.json()

      const replyText =
        data.reply ||
        data.error ||
        "I'm sorry, I couldn't process your request right now. Please try again!"

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prev) => [...prev, botMsg])
      // 3-second cooldown to enforce 1 question at a time
      setCooldown(3)
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'model',
          text: 'Network error connecting to CareerPilot AI. Please check your internet connection.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (loading) return
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        text: `Chat cleared! You can ask 1 question at a time. What would you like help with?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }

  const isLocked = loading || cooldown > 0

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-xl border border-[#eadcc9] bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white font-bold text-xs sm:text-sm hover:scale-105 transition-all duration-200 cursor-pointer active:scale-95 group"
          title="Ask CareerPilot AI Copilot"
        >
          <div className="relative">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#166534] border border-white" />
          </div>
          <span className="text-xs sm:text-sm">Ask AI Copilot</span>
          <span className="bg-white/20 px-1.5 py-0.2 sm:py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider">
            AI
          </span>
        </button>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div
          className={`fixed z-[9999] transition-all duration-200 flex flex-col bg-white border border-[#eadcc9] shadow-2xl overflow-hidden ${
            isExpanded
              ? 'inset-2 sm:inset-6 md:inset-12 rounded-2xl sm:rounded-3xl'
              : 'inset-x-2 bottom-16 top-14 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[580px] sm:max-h-[85vh] rounded-2xl sm:rounded-3xl'
          }`}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-[#eadcc9] bg-[#fffaf3] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-black text-[#572d12]">
                    CareerPilot AI Copilot
                  </h3>
                  <span className="text-[10px] font-bold text-[#1d4ed8] bg-[#eff6ff] border border-[#eadcc9] px-1.5 py-0.2 rounded-full">
                    1 Question at a Time
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#78716c]">
                  Personalized career &amp; internship mentor
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="p-1.5 rounded-lg border border-[#eadcc9] hover:bg-white text-[#78716c] hover:text-[#572d12] transition-colors cursor-pointer disabled:opacity-40"
                title="Clear conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg border border-[#eadcc9] hover:bg-white text-[#78716c] hover:text-[#572d12] transition-colors cursor-pointer hidden sm:block"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg border border-[#eadcc9] hover:bg-white text-[#78716c] hover:text-[#572d12] transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Suggestions Pills (Disabled when locked) */}
          {messages.length <= 2 && (
            <div className="p-3 bg-[#eff6ff]/60 border-b border-[#eadcc9] shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#1d4ed8] mb-1.5 flex items-center justify-between">
                <span>Suggested Questions:</span>
                <span className="text-[10px] text-[#78716c] font-normal">Click any 1</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={isLocked}
                    onClick={() => handleSend(suggestion)}
                    className="text-[11px] font-medium text-[#572d12] bg-white hover:bg-[#fffaf3] border border-[#eadcc9] hover:border-[#2563eb] px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-left"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#fffaf3]/40">
            {messages.map((m) => {
              const isUser = m.role === 'user'
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border text-xs ${
                      isUser
                        ? 'bg-[#572d12] text-white border-[#572d12]'
                        : 'bg-[#eff6ff] text-[#2563eb] border-[#eadcc9]'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-[13px] shadow-2xs ${
                      isUser
                        ? 'bg-[#572d12] text-white rounded-tr-xs'
                        : 'bg-white text-[#29231e] border border-[#eadcc9] rounded-tl-xs'
                    }`}
                  >
                    <ChatMessageContent content={m.text} isUser={isUser} />
                    <div
                      className={`flex items-center justify-between text-[9px] mt-2 pt-1 border-t ${
                        isUser
                          ? 'border-white/20 text-white/60'
                          : 'border-[#eadcc9]/60 text-[#78716c]'
                      }`}
                    >
                      {!isUser ? (
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(m.id, m.text)}
                          className="inline-flex items-center gap-1 hover:text-[#2563eb] transition-colors cursor-pointer text-[10px]"
                          title="Copy message"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                              <span className="text-emerald-600 font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-2.5 h-2.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span />
                      )}
                      <span>{m.timestamp}</span>
                    </div>
                  </div>
                </div>
              )
            })}

            {loading && (
              <div className="flex items-center gap-2.5 text-[#78716c] text-xs py-1">
                <div className="w-7 h-7 rounded-lg bg-[#eff6ff] border border-[#eadcc9] flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-[#2563eb]" />
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-[#eadcc9] px-3 py-2 rounded-2xl rounded-tl-xs shadow-2xs">
                  <Loader2 className="w-3.5 h-3.5 text-[#2563eb] animate-spin" />
                  <span className="text-[11px] text-[#635b52] font-semibold">
                    Answering your question... (1 question at a time)
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Active Status & Rate Limit Notice */}
          {loading && (
            <div className="px-4 py-1.5 bg-[#eff6ff] border-t border-[#eadcc9] flex items-center justify-between text-[11px] text-[#1d4ed8] font-semibold animate-pulse">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#2563eb]" />
                Processing question... please wait before asking next
              </span>
              <span className="font-mono text-[10px] uppercase font-bold">1/1 Active</span>
            </div>
          )}

          {cooldown > 0 && (
            <div className="px-4 py-1.5 bg-[#f0fdf4] border-t border-[#bbf7d0] flex items-center justify-between text-[11px] text-[#166534] font-semibold">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Next question ready in {cooldown}s...
              </span>
              <span className="font-mono text-[10px] uppercase font-bold">Cooldown</span>
            </div>
          )}

          {/* Bottom Input Form */}
          <div className="p-3 sm:p-4 border-t border-[#eadcc9] bg-white shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  loading
                    ? 'Answering your question... please wait'
                    : cooldown > 0
                    ? `Please wait ${cooldown}s before next question...`
                    : 'Type 1 question (e.g. resume tips, cold email, projects)...'
                }
                disabled={isLocked}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#eadcc9] text-xs sm:text-sm text-[#29231e] placeholder:text-[#78716c] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] bg-white disabled:bg-[#fbf7f0] disabled:cursor-not-allowed transition-colors"
                style={{ colorScheme: 'light' }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLocked}
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white hover:opacity-95 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-xs"
                title={isLocked ? 'Please wait for current question to finish' : 'Send question'}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-[#78716c] mt-2 px-1">
              <span>CareerPilot Intelligence Engine</span>
              <span className="font-bold text-[#1d4ed8]">Limit: 1 question at a time</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
