import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Message {
  role: 'user' | 'model' | 'assistant'
  content: string
}

interface AskAIRequest {
  message: string
  history?: Message[]
  userProfile?: {
    degree?: string
    field_of_study?: string
    college_name?: string
    skills?: string[]
    desired_roles?: string[]
    headline?: string
  }
}

// In-memory rate limiting & concurrency structures
// 1. Concurrency lock (Strict 1 question at a time per user)
const activeQuestions = new Set<string>()

// 2. Sliding window request history per client: timestamps array
const requestHistory = new Map<string, number[]>()

// 3. Cooldown between questions: minimum 1.5 seconds
const lastQuestionTimestamps = new Map<string, number>()

// Rate limit configuration:
const RATE_LIMITS = {
  maxPerMinute: 6, // max 6 questions per minute
  maxPerHour: 30, // max 30 questions per hour
  maxPerDay: 80, // max 80 questions per 24 hours
}

function checkRateLimit(clientId: string): { allowed: boolean; reason?: string; retryAfter?: number } {
  const now = Date.now()
  const timestamps = (requestHistory.get(clientId) || []).filter((t) => now - t < 24 * 60 * 60 * 1000)

  // Check 1-minute window
  const inLastMinute = timestamps.filter((t) => now - t < 60 * 1000).length
  if (inLastMinute >= RATE_LIMITS.maxPerMinute) {
    return {
      allowed: false,
      reason: 'Rate limit reached: Maximum 6 questions per minute. Please pause for a moment before asking another question.',
      retryAfter: 30,
    }
  }

  // Check 1-hour window
  const inLastHour = timestamps.filter((t) => now - t < 60 * 60 * 1000).length
  if (inLastHour >= RATE_LIMITS.maxPerHour) {
    return {
      allowed: false,
      reason: 'Hourly rate limit reached: Maximum 30 questions per hour. Please take a break and return shortly.',
      retryAfter: 300,
    }
  }

  // Check 24-hour window
  if (timestamps.length >= RATE_LIMITS.maxPerDay) {
    return {
      allowed: false,
      reason: 'Daily quota reached: Maximum 80 questions per day. Your quota will refresh tomorrow.',
      retryAfter: 3600,
    }
  }

  return { allowed: true }
}

function recordRequest(clientId: string) {
  const now = Date.now()
  const timestamps = (requestHistory.get(clientId) || []).filter((t) => now - t < 24 * 60 * 60 * 1000)
  timestamps.push(now)
  requestHistory.set(clientId, timestamps)
}

export async function POST(req: Request) {
  let clientId = 'client-session'

  try {
    const { message, history = [], userProfile }: AskAIRequest = await req.json()

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Identify user: check authenticated Supabase session first, then fallback to IP
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.id) {
        clientId = `user:${user.id}`
      }
    } catch {
      // Unauthenticated or auth error fallback
    }

    if (clientId === 'client-session') {
      const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      const clientIp = forwardedFor || req.headers.get('x-real-ip') || 'local-user'
      clientId = `ip:${clientIp}`
    }

    // 1. Strict Concurrency Rule: Exactly 1 question at a time per user
    if (activeQuestions.has(clientId)) {
      return NextResponse.json(
        {
          error:
            '1 Question at a Time: CareerPilot AI is already answering your previous question. Please wait for it to finish.',
        },
        { status: 429 }
      )
    }

    // 2. Throttling: Minimum 1.5s cooldown after the previous question completed
    const lastTimestamp = lastQuestionTimestamps.get(clientId) || 0
    const now = Date.now()
    if (now - lastTimestamp < 1500) {
      return NextResponse.json(
        {
          error:
            'Please wait a moment before sending your next question (1 question at a time limit).',
        },
        { status: 429 }
      )
    }

    // 3. Rate Limit Protection: Ensure fair access and prevent abuse
    const rateCheck = checkRateLimit(clientId)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: rateCheck.reason },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.retryAfter || 60),
          },
        }
      )
    }

    // Mark user as actively processing & record query timestamp
    activeQuestions.add(clientId)
    recordRequest(clientId)

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY

    // Build personalized profile context if available
    let profileContext = ''
    if (userProfile) {
      profileContext = `
Candidate Context:
- Degree: ${userProfile.degree || 'B.Tech/BE/BCA'} in ${userProfile.field_of_study || 'Computer Science / Engineering'}
- College: ${userProfile.college_name || 'Engineering College'}
- Target Roles: ${userProfile.desired_roles?.join(', ') || 'Software Engineer Intern, Web Developer'}
- Current Skills: ${userProfile.skills?.join(', ') || 'JavaScript, Python, React, Web Development'}
- Current Headline: ${userProfile.headline || 'None provided'}
`
    }

    const systemPrompt = `You are CareerPilot AI, an elite career mentor, technical recruiter, and internship advisor specializing in helping students, freshers, and software engineers in India land high-stipend tech internships and entry-level engineering jobs (at top startups like Blinkit, Swiggy, Zepto, Razorpay, CRED, and MNCs).

${profileContext}

CRITICAL RULES:
1. Never mention the name "Gemini" or "Google Gemini". Always identify as "CareerPilot AI".
2. Format answers with exceptional visual clarity:
   - Use "### Section Title" for clear structure.
   - Use bullet points with bold prefixes (* **Key Point:** Details).
   - Use short, digestible paragraphs (max 2-3 sentences).
   - If providing code or email templates, format them inside clean code blocks.
   - Keep answers practical, encouraging, and easy to read.
3. PORTAL NAVIGATION & ACTIONABLE LINKS:
   Always actively connect your answers to CareerPilot AI's internal portal pages so the candidate can take immediate action. Include clean markdown links [Portal Name](/path) wherever relevant:
   - For Resumes, ATS score checks, bullet points, Google Drive CV auditing: [Resume Scorer](/resume) or [Audit Your CV →](/resume)
   - For Job search, software internships, live startup openings (Blinkit, Swiggy, Zepto, Razorpay), stipends: [Job Radar](/jobs) or [Explore Openings →](/jobs)
   - For Application tracking, interview stages, follow-up status: [Application Pipeline](/applications) or [Track Pipeline →](/applications)
   - For Headline rewrite, skills audit, career bio editing: [Career Profile](/profile) or [Update Profile →](/profile)
   - For Career overview, pipeline metrics, telemetry: [Dashboard](/dashboard)
   Always format internal portal links with a leading slash, e.g. [Explore Openings →](/jobs) or [Audit Your CV →](/resume).
4. If asked about resume tips, emphasize action verbs, measurable impact (Google's X-Y-Z formula: "Accomplished [X] as measured by [Y], by doing [Z]"), and clean single-column ATS formatting.
5. If asked about projects, recommend realistic, modern full-stack / AI capstone projects with clear architecture and why recruiters love them.
6. If asked about cold emails/LinkedIn outreach, provide short, polite, high-converting templates.`

    if (apiKey) {
      try {
        // Format history for Gemini API
        const contents = [
          {
            role: 'user',
            parts: [{ text: systemPrompt }],
          },
          {
            role: 'model',
            parts: [
              {
                text: "Understood! I am CareerPilot AI, ready to answer 1 question at a time with personalized, high-agency career guidance, interview prep, resume improvements, and internship strategies.",
              },
            ],
          },
        ]

        // Add recent conversation history (last 6 messages)
        const recentHistory = history.slice(-6)
        for (const msg of recentHistory) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          })
        }

        // Add current user prompt
        contents.push({
          role: 'user',
          parts: [{ text: message.trim() }],
        })

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 1200,
              },
            }),
          }
        )

        if (response.ok) {
          const resJson = await response.json()
          const replyText = resJson.candidates?.[0]?.content?.parts?.[0]?.text
          if (replyText) {
            return NextResponse.json({
              reply: replyText.trim(),
              source: 'careerpilot_ai',
            })
          }
        }
      } catch {
        // Fallback below
      }
    }

    // High-quality deterministic fallback response engine if API key is not configured or fails
    const lower = message.toLowerCase()
    let fallbackReply = ''

    if (lower.includes('cold') || lower.includes('outreach') || lower.includes('linkedin') || lower.includes('message')) {
      fallbackReply = `### High-Converting LinkedIn / Cold Email Template

**Subject:** Quick note from a Final Year CS student | Passionate about [Company Name]

> "Hi [Founder/Engineering Lead's First Name],
>
> I've been following [Company Name]'s work on [specific product feature or milestone], especially how your engineering team solves [specific problem].
>
> I’m a CS undergrad skilled in **${userProfile?.skills?.slice(0, 3).join(', ') || 'React, Next.js, and TypeScript'}**. Recently, I built **[Project Name]**—a real-time full-stack web app that [describe core outcome, e.g. handles 500+ daily requests with Supabase & Redis caching].
>
> I would love to contribute to your engineering squad as a **Software Engineer Intern**. Here is my live portfolio: [Portfolio Link] and GitHub: [GitHub Link].
>
> Open to a 5-minute chat if you have bandwidth this week!
>
> Best regards,  
> **[Your Name]**"

**Pro-Tips:**
- Send between 8:30 AM – 9:30 AM on Tuesday or Wednesday for highest open rates.
- Keep the message under 120 words.
- Always link directly to deployed live projects.

**Next Steps in Portal:**
- Discover live founder & engineering openings: [Browse Job Radar →](/jobs)
- Track your outreach and responses: [Open Applications Pipeline →](/applications)`
    } else if (lower.includes('ats') || lower.includes('resume') || lower.includes('score')) {
      fallbackReply = `### How to Achieve a 90+ ATS Score

1. **Use Google's X-Y-Z Impact Formula**:
   - ❌ *Weak:* "Created backend APIs for the application."
   - ✅ *Strong:* "Architected 12 RESTful microservice endpoints using Go and PostgreSQL, reducing query latency by 35% for 1,000+ active sessions."

2. **Strict Single-Column Layout**:
   - ATS parsers struggle with multi-column tables, text boxes, and fancy graphics. Use clean headers: **Education**, **Technical Skills**, **Projects**, **Experience**, and **Certifications**.

3. **Match Keywords Exactly**:
   - If job descriptions mention *Next.js*, *TypeScript*, *REST APIs*, and *Tailwind CSS*, ensure these exact terms appear in both your **Skills** section and inside your **Project descriptions**.

4. **Google Drive Link Verification**:
   - Ensure your resume sharing permission is set to **"Anyone with the link can view"** so recruiters and automated screeners can access it with one click.

**Next Steps in Portal:**
- Run a live 10-point audit on your CV: [Open Resume Scorer →](/resume)
- Add missing technical keywords: [Update Career Profile →](/profile)`
    } else if (lower.includes('project') || lower.includes('build')) {
      fallbackReply = `### Top 3 Standout Projects to Land Tech Internships

1. **High-Throughput Collaborative Workspace (Full-Stack)**
   - **Tech Stack:** Next.js App Router, TypeScript, Supabase Realtime, Tailwind CSS.
   - **Why Recruiters Love It:** Proves you can manage live WebSockets, optimistic UI updates, and role-based row-level security (RLS).

2. **AI Document & Resume Intelligence Platform (GenAI + Vector Search)**
   - **Tech Stack:** Python / FastAPI, LangChain, LLM APIs (OpenAI / Anthropic / Groq), Pinecone/pgvector.
   - **Why Recruiters Love It:** Demonstrates hands-on Generative AI implementation beyond simple wrapper scripts.

3. **Distributed E-Commerce / Quick-Commerce Checkout Squad (Backend)**
   - **Tech Stack:** Node.js / Go, PostgreSQL, Redis Rate Limiting, BullMQ.
   - **Why Recruiters Love It:** Shows knowledge of caching, idempotency keys for payment gateways, and queue processing under load.

**Next Steps in Portal:**
- Showcase your projects and skills to recruiters: [Edit Career Profile →](/profile)
- Match your tech stack with live internship roles: [Browse Job Radar →](/jobs)`
    } else {
      fallbackReply = `### CareerPilot AI Strategic Advice

Here are the 4 highest-ROI steps you can take today to secure verified tech internships:

1. **Audit Your Profile Skills**:
   - Ensure your profile lists at least 6 core hard skills.
   - Action: [Edit Career Profile →](/profile)

2. **Target Verified Openings on Job Radar**:
   - Explore verified openings from **Blinkit, Swiggy Labs, Zepto, and Razorpay**.
   - Action: [Browse Job Radar →](/jobs)

3. **Test Resume ATS Compatibility**:
   - Run your Google Drive CV link against 10 strict ATS parsing rules.
   - Action: [Open Resume Scorer →](/resume)

4. **Monitor Interview Progress**:
   - Keep track of every screening, interview, and offer round in real-time.
   - Action: [View Applications Pipeline →](/applications)

Feel free to ask me for cold outreach templates, resume bullet rewrites, or interview preparation tips!`
    }

    return NextResponse.json({
      reply: fallbackReply,
      source: 'fallback',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to process AI request' },
      { status: 500 }
    )
  } finally {
    // Release active lock and record completion timestamp
    activeQuestions.delete(clientId)
    lastQuestionTimestamps.set(clientId, Date.now())
  }
}
