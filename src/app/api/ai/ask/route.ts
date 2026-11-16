import { NextResponse } from 'next/server'

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

// In-memory concurrency tracker: exactly 1 question at a time per user / client
const activeQuestions = new Set<string>()
const lastQuestionTimestamps = new Map<string, number>()

export async function POST(req: Request) {
  let clientId = 'client-session'

  try {
    const { message, history = [], userProfile }: AskAIRequest = await req.json()

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Determine unique client identifier from headers or profile
    const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    const clientIp = forwardedFor || req.headers.get('x-real-ip') || 'local'
    clientId = userProfile?.headline || userProfile?.college_name || clientIp

    // Strict Rule: Every user only gets 1 question at a time
    if (activeQuestions.has(clientId)) {
      return NextResponse.json(
        {
          error:
            '1 Question at a Time Limit: CareerPilot AI is already generating an answer for your previous question. Please wait for it to complete.',
        },
        { status: 429 }
      )
    }

    // Throttling: Must be at least 1.5s since the last question completed
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

    // Mark user as actively processing
    activeQuestions.add(clientId)

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

Your guidance rules:
1. Be concise, actionable, and encouraging. Give structured answers with bullet points and bold highlights.
2. If asked about resume tips, emphasize action verbs, measurable impact (Google's X-Y-Z formula: "Accomplished [X] as measured by [Y], by doing [Z]"), and clean single-column ATS formatting.
3. If asked about projects, recommend realistic, modern full-stack / AI capstone projects with clear architecture and why recruiters love them.
4. If asked about cold emails/LinkedIn outreach, provide short, polite, high-converting templates.
5. If asked about interviews, give practical preparation roadmaps (DSA, system design basics, core CS subjects, behavioral questions).
6. Format your responses with clean GitHub Markdown (headings, bullet points, code blocks). Do not be overly verbose.`

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
              source: 'gemini',
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
- Always link directly to deployed live projects.`
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
   - Ensure your resume sharing permission is set to **"Anyone with the link can view"** so recruiters and automated screeners can access it with one click.`
    } else if (lower.includes('project') || lower.includes('build')) {
      fallbackReply = `### Top 3 Standout Projects to Land Tech Internships

1. **High-Throughput Collaborative Workspace (Full-Stack)**
   - **Tech Stack:** Next.js App Router, TypeScript, Supabase Realtime, Tailwind CSS.
   - **Why Recruiters Love It:** Proves you can manage live WebSockets, optimistic UI updates, and role-based row-level security (RLS).

2. **AI Document & Resume Intelligence Platform (GenAI + Vector Search)**
   - **Tech Stack:** Python / FastAPI, LangChain, Gemini API, Pinecone/pgvector.
   - **Why Recruiters Love It:** Demonstrates hands-on Generative AI implementation beyond simple wrapper scripts.

3. **Distributed E-Commerce / Quick-Commerce Checkout Squad (Backend)**
   - **Tech Stack:** Node.js / Go, PostgreSQL, Redis Rate Limiting, BullMQ.
   - **Why Recruiters Love It:** Shows knowledge of caching, idempotency keys for payment gateways, and queue processing under load.`
    } else {
      fallbackReply = `### CareerPilot AI Advice

Here are the 3 highest-ROI steps you can take today to secure verified tech internships:

1. **Audit Your Profile Skills**:
   - Ensure your profile lists at least 6 core hard skills (languages, frameworks, databases, tools).
   - Use the **Gemini Profile Coach** in your Profile tab to rewrite your headline and professional bio.

2. **Target Verified Openings on Job Radar**:
   - Explore verified openings from **Blinkit, Swiggy Labs, Zepto, and Razorpay** in the **Job Radar** tab.
   - Check your ATS Match score before applying.

3. **Deploy 2 Production-Grade Projects**:
   - Make sure your GitHub projects have a clear \`README.md\`, architecture diagram, and live deployed URL (e.g. on Vercel). Recruiters click live links within 10 seconds!

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
