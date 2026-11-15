import { NextResponse } from 'next/server'

interface ProfileData {
  headline?: string
  bio?: string
  college_name?: string
  degree?: string
  field_of_study?: string
  cgpa?: string
  passing_year?: number | string
  skills?: string[]
  desired_roles?: string[]
  location?: string
}

export async function POST(req: Request) {
  try {
    const data: ProfileData = await req.json()

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY

    const userProfileText = `
Candidate Profile Details:
- Degree & Branch: ${data.degree || 'B.Tech / Bachelor'} in ${data.field_of_study || 'Computer Science / Engineering'}
- College / University: ${data.college_name || 'Engineering Institution'}
- CGPA / Score: ${data.cgpa || 'Not specified'}
- Passing Year: ${data.passing_year || '2025/2026'}
- Current Skills: ${data.skills?.length ? data.skills.join(', ') : 'JavaScript, Python, Web Development, Problem Solving'}
- Desired Roles / Internships: ${data.desired_roles?.length ? data.desired_roles.join(', ') : 'Software Engineer Intern, Web Developer, AI/ML Intern'}
- Current Headline: ${data.headline || 'None provided'}
- Current Bio: ${data.bio || 'None provided'}
- Target Location: ${data.location || 'India (Bengaluru, Remote, Hybrid)'}
`

    if (apiKey) {
      try {
        const prompt = `You are CareerPilot AI, an elite career coach and technical recruiter specializing in helping Indian engineering students and freshers land top internships and tech jobs (like on Internshala, AngelList, and MNC campus drives).

Analyze the following candidate profile:
${userProfileText}

Respond ONLY with a valid JSON object (no markdown quotes, no triple backticks, just pure raw JSON) containing the following fields:
{
  "profileStrengthScore": <number between 55 and 95 based on their skills and credentials completeness>,
  "recommendedHeadline": "<crisp, impactful 1-line professional headline, e.g. 'Aspiring Full-Stack Developer | React & Node.js | Final Year CS @ XYZ'>",
  "aiBioFresher": "<compelling 3-sentence summary highlighting academic rigor, enthusiasm, and eagerness to contribute during an internship>",
  "aiBioTech": "<action-oriented technical summary highlighting core programming languages, modern frameworks, and problem-solving capability>",
  "criticalMissingSkills": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>"],
  "suggestedProjects": [
    {
      "title": "<project title>",
      "techStack": "<tech stack>",
      "description": "<what it builds and why recruiters love it>"
    },
    {
      "title": "<project title 2>",
      "techStack": "<tech stack 2>",
      "description": "<why recruiters love it>"
    }
  ],
  "internshipStrategy": [
    "<actionable tip 1 for getting shortlisted>",
    "<actionable tip 2 for reaching out to founders>",
    "<actionable tip 3 for technical interview prep>"
  ]
}`

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 1000,
              },
            }),
          }
        )

        if (response.ok) {
          const resJson = await response.json()
          const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text
          if (rawText) {
            // Strip markdown formatting if any was returned
            const cleanText = rawText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim()
            try {
              const parsed = JSON.parse(cleanText)
              return NextResponse.json({ success: true, source: 'gemini', data: parsed })
            } catch {
              // fallback below
            }
          }
        }
      } catch {
        // Fall back to heuristic rule-based engine below
      }
    }

    // High-agency Fallback Heuristic Profile Optimizer (zero downtime, zero 500 errors)
    const skillsList = data.skills || []
    const desired = data.desired_roles?.[0] || 'Software Engineer Intern'
    const branch = data.field_of_study || 'Computer Science'
    const college = data.college_name || 'Engineering Institute'

    const baseScore = Math.min(
      92,
      Math.max(
        62,
        50 +
          (skillsList.length > 0 ? Math.min(25, skillsList.length * 4) : 10) +
          (data.cgpa ? 10 : 0) +
          (data.bio ? 10 : 0)
      )
    )

    const fallbackRecommendations = {
      profileStrengthScore: baseScore,
      recommendedHeadline: `${desired} | ${skillsList.slice(0, 3).join(' • ') || 'Full Stack & Problem Solving'} | ${college}`,
      aiBioFresher: `Dedicated ${branch} student at ${college} with a rigorous foundation in software development and data structures. Actively building production-grade web applications and looking to drive high impact as a ${desired}. Quick learner eager to contribute immediately to sprint goals and team success.`,
      aiBioTech: `Software engineer skilled in ${skillsList.slice(0, 4).join(', ') || 'modern web development and modern backend architecture'}. Passionate about clean code, low-latency APIs, and scalable distributed systems with hands-on full-stack project experience.`,
      criticalMissingSkills: [
        'TypeScript',
        'Docker & Containerization',
        'PostgreSQL & Prisma ORM',
        'Next.js App Router',
        'RESTful API Testing (Postman/Jest)',
      ].filter((s) => !skillsList.some((userS) => userS.toLowerCase() === s.toLowerCase())).slice(0, 5),
      suggestedProjects: [
        {
          title: 'Full-Stack Multi-Tenant SaaS or Marketplace',
          techStack: 'Next.js, TypeScript, Tailwind CSS, Supabase / PostgreSQL',
          description: 'A complete end-to-end platform with authentication, role-based access, and real-time database subscriptions to showcase production engineering readiness.',
        },
        {
          title: 'AI Workflow Assistant or Search Tool',
          techStack: 'Python, FastAPI, Gemini API / OpenAI, Vector Database',
          description: 'Demonstrates modern AI integration capabilities, prompt chaining, and asynchronous background task processing.',
        },
      ],
      internshipStrategy: [
        'Tailor your Google Drive resume link with ATS-optimized bullet points focusing on measurable project metrics.',
        'Apply within the first 6 hours of an internship posting on Internshala and Job Radar to reach the top 5% of candidate reviews.',
        'Include your live deployed project links and GitHub repositories prominently so recruiters can inspect real code immediately.',
      ],
    }

    return NextResponse.json({
      success: true,
      source: 'heuristic',
      data: fallbackRecommendations,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to analyze profile'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

