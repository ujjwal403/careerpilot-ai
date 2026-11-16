'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  Send,
  Bot,
  User,
  RotateCcw,
  Loader2,
  FileText,
  Mail,
  HelpCircle,
  Briefcase,
  Code2,
  Clock,
  ShieldAlert,
} from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'model'
  text: string
  timestamp: string
}

interface AskAICopilotViewProps {
  userProfile?: {
    degree?: string
    field_of_study?: string
    college_name?: string
    skills?: string[]
    desired_roles?: string[]
    headline?: string
  }
}

const CATEGORY_PROMPTS = [
  {
    icon: FileText,
    label: 'Resume & ATS',
    prompt: 'Review my resume strategy: How do I achieve a 95+ score on ATS scanners for software engineering internships?',
  },
  {
    icon: Mail,
    label: 'Cold Outreach',
    prompt: 'Write a high-converting cold email template to reach out to founders of high-growth tech startups in Bangalore.',
  },
  {
    icon: Code2,
    label: 'Portfolio Projects',
    prompt: 'What are the top 3 modern full-stack web projects that recruiters at top tech startups actually care about?',
  },
  {
    icon: Briefcase,
    label: 'Internship Strategy',
    prompt: 'What is the best weekly roadmap for a pre-final / final year CS student to land a ₹35k - ₹50k/month tech internship?',
  },
]

export function AskAICopilotView({ userProfile }: AskAICopilotViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello! I am **CareerPilot AI**, your dedicated career copilot and engineering mentor powered by Google Gemini.\n\n⚠️ **Usage Rule:** Every user can ask **1 question at a time**. Once I finish answering, you can ask your next question!\n\nWhether you need help with resume bullets, cold email templates to founders, standout project ideas, or interview prep—ask your question below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading, cooldown])

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
      setCooldown(3)
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'model',
          text: 'Network error connecting to CareerPilot AI. Please try again.',
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
        text: `Chat cleared! What 1 career or engineering question would you like help with?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }

  const isLocked = loading || cooldown > 0

  return (
    <div className="bg-white border border-[#eadcc9] rounded-3xl shadow-xs overflow-hidden flex flex-col h-[78vh] min-h-[600px]">
      {/* Header */}
      <div className="p-5 border-b border-[#eadcc9] bg-[#fffaf3] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#572d12]">
                CareerPilot AI Copilot
              </h2>
              <span className="text-[10px] font-bold text-[#1d4ed8] bg-[#eff6ff] border border-[#eadcc9] px-2 py-0.5 rounded-full">
                1 Question at a Time
              </span>
            </div>
            <p className="text-xs text-[#78716c]">
              Personalized technical recruiter &amp; career coach tailored for Indian tech talent
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#eadcc9] bg-white hover:bg-[#fffaf3] text-xs font-bold text-[#635b52] hover:text-[#572d12] transition-colors cursor-pointer disabled:opacity-40"
          title="Reset chat"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Suggested Categories Bar (Disabled when question is active) */}
      {messages.length <= 2 && (
        <div className="p-4 bg-[#eff6ff]/50 border-b border-[#eadcc9] shrink-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#1d4ed8] mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Recommended Topics (Choose 1):</span>
            </span>
            <span className="text-[10px] text-[#78716c] font-normal">Click any topic to ask</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {CATEGORY_PROMPTS.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.label}
                  type="button"
                  disabled={isLocked}
                  onClick={() => handleSend(cat.prompt)}
                  className="p-2.5 rounded-xl border border-[#eadcc9] bg-white hover:bg-[#fffaf3] hover:border-[#2563eb] text-left transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group flex items-start gap-2"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#eff6ff] border border-[#eadcc9] flex items-center justify-center shrink-0 group-hover:border-[#2563eb] transition-colors mt-0.5">
                    <Icon className="w-3 h-3 text-[#2563eb]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-[#572d12] group-hover:text-[#2563eb] transition-colors">
                      {cat.label}
                    </span>
                    <span className="block text-[11px] text-[#78716c] line-clamp-1">
                      {cat.prompt}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#fffaf3]/30">
        {messages.map((m) => {
          const isUser = m.role === 'user'
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border text-xs shadow-2xs ${
                  isUser
                    ? 'bg-[#572d12] text-white border-[#572d12]'
                    : 'bg-[#eff6ff] text-[#2563eb] border-[#eadcc9]'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                  isUser
                    ? 'bg-[#572d12] text-white rounded-tr-xs'
                    : 'bg-white text-[#29231e] border border-[#eadcc9] rounded-tl-xs'
                }`}
              >
                <div className="space-y-2 whitespace-pre-wrap leading-relaxed">
                  {m.text}
                </div>
                <span
                  className={`block text-[10px] mt-2 text-right ${
                    isUser ? 'text-white/60' : 'text-[#78716c]'
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
            </div>
          )
        })}

        {loading && (
          <div className="flex items-center gap-3 text-[#78716c] text-xs py-2">
            <div className="w-8 h-8 rounded-xl bg-[#eff6ff] border border-[#eadcc9] flex items-center justify-center shadow-2xs">
              <Bot className="w-4 h-4 text-[#2563eb]" />
            </div>
            <div className="flex items-center gap-2 bg-white border border-[#eadcc9] px-4 py-2.5 rounded-2xl rounded-tl-xs shadow-2xs">
              <Loader2 className="w-4 h-4 text-[#2563eb] animate-spin" />
              <span className="text-xs text-[#635b52] font-semibold">
                Answering your question... (1 question at a time)
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Active Question Banner */}
      {loading && (
        <div className="px-6 py-2 bg-[#eff6ff] border-t border-[#eadcc9] flex items-center justify-between text-xs text-[#1d4ed8] font-bold animate-pulse shrink-0">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2563eb]" />
            1 Question at a Time: Answering current question, please wait...
          </span>
          <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded-md border border-[#eadcc9]">
            Active
          </span>
        </div>
      )}

      {cooldown > 0 && (
        <div className="px-6 py-2 bg-[#f0fdf4] border-t border-[#bbf7d0] flex items-center justify-between text-xs text-[#166534] font-bold shrink-0">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Please review answer. Next question ready in {cooldown}s...
          </span>
          <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded-md border border-[#bbf7d0]">
            Ready soon
          </span>
        </div>
      )}

      {/* Input Bar */}
      <div className="p-4 sm:p-5 border-t border-[#eadcc9] bg-white shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2.5"
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
                ? `Please wait ${cooldown}s before asking next question...`
                : 'Ask 1 question at a time (e.g. resume review, cold emails, interview prep)...'
            }
            disabled={isLocked}
            className="flex-1 px-4 py-3 rounded-2xl border border-[#eadcc9] text-xs sm:text-sm text-[#29231e] placeholder:text-[#78716c] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] bg-white disabled:bg-[#fbf7f0] disabled:cursor-not-allowed transition-colors"
            style={{ colorScheme: 'light' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLocked}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white hover:opacity-95 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-bold text-xs sm:text-sm flex items-center gap-2 shrink-0 shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <span>Send</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
        <div className="flex items-center justify-between text-[11px] text-[#78716c] mt-2.5 px-1">
          <span>Powered by Google Gemini 1.5 Flash</span>
          <span className="font-bold text-[#1d4ed8]">Policy: Exactly 1 question at a time</span>
        </div>
      </div>
    </div>
  )
}
