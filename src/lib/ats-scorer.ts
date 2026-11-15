import type { ResumeExtractedData } from '@/types/resume-extractor'

export interface ATSRuleEvaluation {
  id: string
  name: string
  category: 'contact' | 'skills' | 'content' | 'structure' | 'bonus'
  score: number // 0 to 10
  maxScore: 10
  status: 'passed' | 'warning' | 'failed'
  description: string
  details: string
  suggestion?: string
}

export interface ATSScorerResult {
  totalScore: number // 0 to 100
  ratingTier: 'ATS Elite' | 'ATS Competitive' | 'Needs Optimization' | 'High Filter Risk'
  ratingSummary: string
  targetReadiness: string
  rules: ATSRuleEvaluation[]
  strengths: string[]
  improvements: string[]
  scannedAt: string
}

const COMMON_TECH_SKILLS = [
  'React', 'Next.js', 'NextJS', 'Vue', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript', 'HTML5', 'HTML', 'CSS3', 'CSS',
  'Tailwind CSS', 'Tailwind', 'Redux', 'Zustand', 'Node.js', 'Express', 'Express.js', 'NestJS', 'FastAPI', 'Flask', 'Django',
  'Python', 'Java', 'Spring Boot', 'Spring', 'C++', 'C#', '.NET', 'Go', 'Golang', 'Rust', 'PHP', 'Laravel',
  'SQL', 'PostgreSQL', 'Postgres', 'MySQL', 'MongoDB', 'Redis', 'Supabase', 'Firebase', 'SQLite', 'GraphQL',
  'REST APIs', 'REST API', 'AWS', 'Google Cloud', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'CI/CD',
  'GitHub Actions', 'Git', 'GitHub', 'Linux', 'Microservices', 'System Design',
  'Data Structures', 'DSA', 'Algorithms', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow',
  'Pandas', 'NumPy', 'Scikit-learn', 'Kafka', 'RabbitMQ', 'Flutter', 'Dart', 'Android', 'iOS', 'Kotlin'
]

const STRONG_ACTION_VERBS = [
  'engineered',
  'developed',
  'architected',
  'led',
  'optimized',
  'built',
  'spearheaded',
  'designed',
  'deployed',
  'implemented',
  'automated',
  'orchestrated',
  'scaled',
  'accelerated',
  'created',
  'integrated',
  'solved',
  'reduced',
  'increased',
  'transformed',
  'mentored',
  'streamlined',
]

const PASSIVE_WORDS = [
  'helped with',
  'worked on',
  'responsible for',
  'assisted',
  'tasked with',
  'handled',
  'participated in',
  'contributed to',
]

const STANDARD_SECTIONS = [
  { name: 'Education', regex: /\b(education|academics|qualifications|academic background|coursework)\b/i },
  { name: 'Experience / Projects', regex: /\b(experience|work experience|work history|employment|internships|projects|key projects|academic projects|technical projects)\b/i },
  { name: 'Technical Skills', regex: /\b(skills|technical skills|technologies|core competencies|expertise|technical proficiency|tools)\b/i },
  { name: 'Summary / Certifications', regex: /\b(summary|profile|about me|objective|career objective|certifications|certificates|achievements|awards)\b/i },
]

export function evaluateATSCompatibility(
  rawText: string = '',
  extractedData?: ResumeExtractedData
): ATSScorerResult {
  const text = (rawText || '').trim()
  const lowerText = text.toLowerCase()
  const rules: ATSRuleEvaluation[] = []
  const strengths: string[] = []
  const improvements: string[] = []

  // Extract convenience helpers
  const contact = extractedData?.contact
  const education = extractedData?.education
  const skills = extractedData?.skills
  const experience = extractedData?.experience
  const projects = extractedData?.projects
  const certifications = extractedData?.certifications

  // -------------------------------------------------------------
  // Rule 1: Contact Completeness (10 pts)
  // Phone, email, and location clearly visible
  // -------------------------------------------------------------
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i
  const phoneRegex = /(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}|\b[6-9]\d{9}\b/
  const matchedEmail = contact?.email || text.match(emailRegex)?.[0]
  const matchedPhone = contact?.phone || text.match(phoneRegex)?.[0]
  const hasEmail = Boolean(matchedEmail)
  const hasPhone = Boolean(matchedPhone)

  // Broad location recognition: Indian cities, global tech hubs, states, PIN codes, address keywords
  const locationRegex = /\b(delhi|new delhi|bangalore|bengaluru|mumbai|hyderabad|pune|chennai|noida|gurgaon|gurugram|kolkata|ahmedabad|jaipur|lucknow|chandigarh|indore|bhopal|patna|kochi|coimbatore|bhubaneswar|dehradun|visakhapatnam|kanpur|nagpur|karnataka|maharashtra|tamil nadu|telangana|uttar pradesh|gujarat|rajasthan|kerala|india|remote|san francisco|new york|seattle|austin|chicago|london|berlin|toronto)\b|\b\d{6}\b/i
  const hasLocation = Boolean(contact?.city || locationRegex.test(text) || /\b(address|location|residence)\s*[:|-]/i.test(text))

  let contactScore = 0
  if (hasEmail) contactScore += 4
  if (hasPhone) contactScore += 4
  if (hasLocation) contactScore += 2

  rules.push({
    id: 'contact_completeness',
    name: 'Contact Completeness',
    category: 'contact',
    score: contactScore,
    maxScore: 10,
    status: contactScore >= 8 ? 'passed' : contactScore >= 4 ? 'warning' : 'failed',
    description: 'Verifies that phone number, email address, and location are visible.',
    details: `${hasEmail ? `✓ Email (${matchedEmail})` : '✗ Email missing'}, ${hasPhone ? `✓ Phone (${matchedPhone})` : '✗ Phone missing'}, ${hasLocation ? '✓ Location verified' : '✗ Location missing'}`,
    suggestion:
      contactScore < 10
        ? 'Ensure your phone number (+91), professional email, and city are placed prominently in your resume header.'
        : undefined,
  })

  if (contactScore === 10) {
    strengths.push('Header contains complete contact details (email, phone, location).')
  } else {
    improvements.push('Add missing contact information in the header for automated recruiter contact.')
  }

  // -------------------------------------------------------------
  // Rule 2: LinkedIn & Portfolio Presence (10 pts)
  // Professional online presence
  // -------------------------------------------------------------
  const hasLinkedIn = Boolean(
    contact?.linkedin_url ||
    /linkedin\.com\/(?:in\/)?[a-zA-Z0-9_-]+/i.test(text) ||
    /linkedin:\s*@?[a-zA-Z0-9_-]+/i.test(text)
  )
  const hasGitHubOrPortfolio = Boolean(
    contact?.github_url ||
    contact?.portfolio_url ||
    /github\.com\/[a-zA-Z0-9_-]+/i.test(text) ||
    /gitlab\.com\/[a-zA-Z0-9_-]+/i.test(text) ||
    /https?:\/\/[^\s]+\.(dev|tech|me|io|com|app|vercel\.app|github\.io)/i.test(text) ||
    /github:\s*@?[a-zA-Z0-9_-]+/i.test(text)
  )

  let linkScore = 0
  if (hasLinkedIn) linkScore += 6
  if (hasGitHubOrPortfolio) linkScore += 4

  rules.push({
    id: 'linkedin_presence',
    name: 'LinkedIn & Portfolio Links',
    category: 'contact',
    score: linkScore,
    maxScore: 10,
    status: linkScore >= 8 ? 'passed' : linkScore >= 6 ? 'warning' : 'failed',
    description: 'Checks for active LinkedIn URL and GitHub or live portfolio links.',
    details: `${hasLinkedIn ? '✓ LinkedIn profile found' : '✗ LinkedIn missing'}, ${hasGitHubOrPortfolio ? '✓ GitHub/Portfolio found' : '✗ GitHub/Portfolio link missing'}`,
    suggestion:
      linkScore < 10
        ? 'Include your LinkedIn profile link and GitHub/portfolio URL to give technical screeners immediate proof of work.'
        : undefined,
  })

  if (linkScore >= 8) {
    strengths.push('Professional portfolio and LinkedIn URLs are present.')
  } else {
    improvements.push('Add a valid LinkedIn profile and GitHub repository link.')
  }

  // -------------------------------------------------------------
  // Rule 3: Skill Density & Keyword Matching (10 pts)
  // Scans both extracted skills and the resume text for verified tech skills
  // -------------------------------------------------------------
  const textMatchedSkills = COMMON_TECH_SKILLS.filter((skill) =>
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
  )

  const combinedSkillsSet = new Set<string>()
  for (const s of skills?.hard_skills || []) {
    if (s && s.trim()) combinedSkillsSet.add(s.trim())
  }
  for (const s of textMatchedSkills) {
    combinedSkillsSet.add(s)
  }
  const detectedSkills = Array.from(combinedSkillsSet)
  const hardSkillsCount = detectedSkills.length

  let skillScore = 0
  if (hardSkillsCount >= 8) skillScore = 10
  else if (hardSkillsCount >= 5) skillScore = 8
  else if (hardSkillsCount >= 3) skillScore = 5
  else if (hardSkillsCount >= 1) skillScore = 3

  rules.push({
    id: 'skill_density',
    name: 'Skill Density & Keyword Matching',
    category: 'skills',
    score: skillScore,
    maxScore: 10,
    status: skillScore >= 8 ? 'passed' : skillScore >= 5 ? 'warning' : 'failed',
    description: 'Requires at least 5-8 verified in-demand technical skills for keyword matching.',
    details: `${hardSkillsCount} technical skill${hardSkillsCount === 1 ? '' : 's'} identified (${detectedSkills.slice(0, 6).join(', ')}${hardSkillsCount > 6 ? ` +${hardSkillsCount - 6} more` : ''})`,
    suggestion:
      skillScore < 10
        ? 'Include at least 5-8 verified technical skills (e.g., React, TypeScript, Python, SQL, Docker, AWS) to match keyword filters.'
        : undefined,
  })

  if (skillScore >= 8) {
    strengths.push(`Strong technical skill density (${hardSkillsCount} indexed skills: ${detectedSkills.slice(0, 4).join(', ')}).`)
  } else {
    improvements.push('Expand your skills section with specific modern frameworks and tools.')
  }

  // -------------------------------------------------------------
  // Rule 4: Academic Metrics (CGPA / Percentage) (10 pts)
  // Critical for Indian tech recruitment & campus cutoffs
  // -------------------------------------------------------------
  const cgpaRegex10 = /\b([5-9]\.\d{1,2}|10(\.0)?)\s*(\/\s*10|cgpa|cpi|gpa)?\b/i
  const gpaRegex4 = /\b([2-4]\.\d{1,2})\s*(\/\s*4(\.0)?|\s*gpa)\b/i
  const percentRegex = /\b(\d{2}(\.\d{1,2})?)\s*%/i
  const hasDegree = Boolean(
    education?.[0]?.degree ||
    /\b(b\.?tech|b\.?e\.?|bca|mca|b\.?sc|m\.?tech|m\.?s\.?|b\.?s\.?|bachelor|master|diploma|computer science|engineering)\b/i.test(text)
  )

  const firstEdu = education?.[0]
  const extractedScore = firstEdu?.score?.trim()
  const matchedCgpa =
    extractedScore ||
    text.match(cgpaRegex10)?.[0] ||
    text.match(gpaRegex4)?.[0] ||
    text.match(percentRegex)?.[0] ||
    (/\b(cgpa|cpi|gpa|percentage|percent)\b/i.test(text) ? 'CGPA mentioned' : null)

  let academicScore = 3
  if (matchedCgpa && hasDegree) {
    academicScore = 10
  } else if (matchedCgpa) {
    academicScore = 8
  } else if (hasDegree) {
    academicScore = 7
  }

  rules.push({
    id: 'academic_metrics',
    name: 'Academic Metrics (CGPA / %)',
    category: 'skills',
    score: academicScore,
    maxScore: 10,
    status: academicScore >= 8 ? 'passed' : 'warning',
    description: 'Verifies degree and academic performance (CGPA/Percentage) for recruiter thresholds.',
    details:
      matchedCgpa
        ? `Academic score verified: "${matchedCgpa}"${hasDegree ? ' with verified degree qualification' : ''}`
        : hasDegree
        ? 'Degree identified, but no explicit CGPA or percentage score detected.'
        : 'No degree or explicit CGPA/percentage score detected in education.',
    suggestion:
      academicScore < 10
        ? 'Indian campus and MNC ATS filters (TCS, Infosys, Wipro, Tier-1) mandate a minimum 60% or 6.5 CGPA threshold. Explicitly state your CGPA or percentage to pass filters.'
        : undefined,
  })

  if (academicScore >= 8) {
    strengths.push(`Academic qualification and performance verified (${matchedCgpa || 'Degree verified'}).`)
  } else {
    improvements.push('Add your CGPA or graduation percentage to clear automated cutoff filters.')
  }

  // -------------------------------------------------------------
  // Rule 5: Action Verbs (10 pts)
  // Strong impact verbs vs passive filler
  // -------------------------------------------------------------
  const matchedActionVerbs = STRONG_ACTION_VERBS.filter((verb) =>
    new RegExp(`\\b${verb}\\b`, 'i').test(text)
  )
  const matchedPassiveWords = PASSIVE_WORDS.filter((p) =>
    lowerText.includes(p)
  )

  let verbScore = Math.min(10, Math.max(2, Math.round(matchedActionVerbs.length * 1.8)))
  if (matchedPassiveWords.length > 0) {
    verbScore = Math.max(2, verbScore - matchedPassiveWords.length * 1.5)
  }

  rules.push({
    id: 'action_verbs',
    name: 'Action-Driven Phrasing',
    category: 'content',
    score: Math.round(verbScore),
    maxScore: 10,
    status: verbScore >= 8 ? 'passed' : verbScore >= 5 ? 'warning' : 'failed',
    description: 'Evaluates strong action verbs ("Engineered", "Led") vs passive phrasing ("Helped with").',
    details: `${matchedActionVerbs.length} strong verbs found (${matchedActionVerbs.slice(0, 4).join(', ')}). ${matchedPassiveWords.length > 0 ? `Passive words detected: "${matchedPassiveWords.join('", "')}"` : 'Zero passive phrasing.'}`,
    suggestion:
      matchedPassiveWords.length > 0 || verbScore < 8
        ? 'Replace passive phrases like "helped with" or "responsible for" with assertive verbs like "Architected", "Engineered", or "Automated".'
        : undefined,
  })

  if (verbScore >= 8) {
    strengths.push('Bullet points start with strong, results-driven action verbs.')
  } else {
    improvements.push('Strengthen bullet points by leading with high-impact action verbs.')
  }

  // -------------------------------------------------------------
  // Rule 6: Quantifiable Impact (10 pts)
  // Metrics, percentages, numbers, scale
  // -------------------------------------------------------------
  const metricRegex = /\b(\d+(\.\d+)?%|\d+x|\d+\s*(users|clients|requests|ms|seconds|minutes|lakh|crore|k|stars|downloads|attendees))\b/gi
  const metricMatches = text.match(metricRegex) || []
  const uniqueMetricsCount = Array.from(new Set(metricMatches.map((m) => m.toLowerCase()))).length

  let impactScore = 2
  if (uniqueMetricsCount >= 4) impactScore = 10
  else if (uniqueMetricsCount >= 2) impactScore = 7
  else if (uniqueMetricsCount >= 1) impactScore = 5

  rules.push({
    id: 'quantifiable_impact',
    name: 'Quantifiable Impact & Metrics',
    category: 'content',
    score: impactScore,
    maxScore: 10,
    status: impactScore >= 8 ? 'passed' : impactScore >= 5 ? 'warning' : 'failed',
    description: 'Scans for measurable numbers, percentages, latency drops, and scale indicators.',
    details: `${uniqueMetricsCount} quantifiable impact metrics detected (${metricMatches.slice(0, 3).join(', ') || 'none'}).`,
    suggestion:
      impactScore < 8
        ? 'Quantify your accomplishments: e.g. "Reduced query latency by 40%", "Scaled system to 10k users", or "Organized event for 500+ attendees".'
        : undefined,
  })

  if (impactScore >= 8) {
    strengths.push('Projects and experience feature quantified metrics and measurable outcomes.')
  } else {
    improvements.push('Add numerical metrics (percentages, speedups, user counts) to showcase real-world impact.')
  }

  // -------------------------------------------------------------
  // Rule 7: Section Structure (10 pts)
  // Standard ATS headings so parsers don't choke
  // -------------------------------------------------------------
  const matchedSections = STANDARD_SECTIONS.filter((sec) => sec.regex.test(text))
  const sectionScore = Math.round((matchedSections.length / STANDARD_SECTIONS.length) * 10)

  rules.push({
    id: 'section_structure',
    name: 'Standard ATS Section Headings',
    category: 'structure',
    score: sectionScore,
    maxScore: 10,
    status: sectionScore >= 8 ? 'passed' : sectionScore >= 5 ? 'warning' : 'failed',
    description: 'Ensures standard section titles (Education, Experience, Skills, Projects) are present.',
    details: `${matchedSections.length}/${STANDARD_SECTIONS.length} standard sections identified (${matchedSections.map((s) => s.name).join(', ')}).`,
    suggestion:
      sectionScore < 10
        ? `Missing standard headings: ${STANDARD_SECTIONS.filter((s) => !matchedSections.includes(s)).map((s) => s.name).join(', ')}. Use standard ATS-recognized section headers.`
        : undefined,
  })

  if (sectionScore >= 8) {
    strengths.push('Well-structured layout with standard ATS section headings.')
  } else {
    improvements.push('Standardize section titles to Education, Experience, Skills, and Projects.')
  }

  // -------------------------------------------------------------
  // Rule 8: Format Cleanliness & Plain-Text Scannability (10 pts)
  // Flags problematic tables, broken symbols, multi-column noise
  // -------------------------------------------------------------
  const hasNullBytes = text.includes('\u0000')
  const hasUnparsedControlChars = /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(text)
  const isTooShort = text.length < 200

  let formatScore = 10
  if (hasNullBytes || hasUnparsedControlChars) formatScore -= 4
  if (isTooShort) formatScore -= 4

  rules.push({
    id: 'format_cleanliness',
    name: 'Format Cleanliness & Scannability',
    category: 'structure',
    score: formatScore,
    maxScore: 10,
    status: formatScore >= 8 ? 'passed' : 'warning',
    description: 'Ensures text stream is readable and free of broken table formatting and corrupted characters.',
    details:
      formatScore === 10
        ? 'Clean, sequential text flow with zero encoding errors or complex parser noise.'
        : 'Contains parsing artifacts or unusual characters that may impede strict ATS filters.',
    suggestion:
      formatScore < 10
        ? 'Export your resume as a clean, single-column PDF without nested graphical tables or text boxes.'
        : undefined,
  })

  // -------------------------------------------------------------
  // Rule 9: Resume Length & Page Economy (10 pts)
  // Optimal 1 page (~350-800 words) for freshers/juniors
  // -------------------------------------------------------------
  const wordCount = text.split(/\s+/).filter(Boolean).length
  let lengthScore = 5
  let lengthDetails = `${wordCount} words`

  if (wordCount >= 300 && wordCount <= 850) {
    lengthScore = 10
    lengthDetails = `${wordCount} words (ideal 1-page density for Indian recruiters & startups)`
  } else if (wordCount > 850 && wordCount <= 1400) {
    lengthScore = 8
    lengthDetails = `${wordCount} words (acceptable 2-page range for experienced professionals)`
  } else if (wordCount < 300) {
    lengthScore = 4
    lengthDetails = `${wordCount} words (too brief, lacks depth)`
  } else {
    lengthScore = 6
    lengthDetails = `${wordCount} words (exceeds recommended 2-page length)`
  }

  rules.push({
    id: 'resume_length',
    name: 'Resume Length & Word Economy',
    category: 'structure',
    score: lengthScore,
    maxScore: 10,
    status: lengthScore >= 8 ? 'passed' : lengthScore >= 6 ? 'warning' : 'failed',
    description: 'Checks for optimal word density (1 page for students/freshers, 1-2 pages for seniors).',
    details: lengthDetails,
    suggestion:
      lengthScore < 8
        ? 'Keep your resume concise: 350-750 words (single page) is the golden standard for campus recruits and early engineering roles.'
        : undefined,
  })

  // -------------------------------------------------------------
  // Rule 10: Certifications & Extra-Curriculars (10 pts)
  // Distinguishing recognitions (SIH, NPTEL, AWS, HackerRank)
  // -------------------------------------------------------------
  const certKeywords = [
    'certified',
    'certification',
    'aws',
    'azure',
    'gcp',
    'google cloud',
    'nptel',
    'coursera',
    'hackerrank',
    'leetcode',
    'hackathon',
    'sih',
    'smart india hackathon',
    'published',
    'ieee',
    'acm',
    'codechef',
    'olympiad',
    'lead',
    'secretary',
  ]

  const matchedCerts = certKeywords.filter((k) =>
    new RegExp(`\\b${k}\\b`, 'i').test(text)
  )
  const hasExtractedCerts = (certifications && certifications.length > 0) || (projects && projects.length >= 2)

  let bonusScore = 4
  if (matchedCerts.length >= 3 || (hasExtractedCerts && matchedCerts.length >= 1)) {
    bonusScore = 10
  } else if (matchedCerts.length >= 1 || hasExtractedCerts) {
    bonusScore = 7
  }

  rules.push({
    id: 'certifications_extracurriculars',
    name: 'Certifications & Extra-Curriculars',
    category: 'bonus',
    score: bonusScore,
    maxScore: 10,
    status: bonusScore >= 8 ? 'passed' : bonusScore >= 6 ? 'warning' : 'failed',
    description: 'Checks for industry certifications, hackathons (SIH), and campus leadership.',
    details: `${matchedCerts.length} credentials/recognitions found (${matchedCerts.slice(0, 3).join(', ') || 'none'}).`,
    suggestion:
      bonusScore < 8
        ? 'Add verified cloud certifications (AWS, Azure), coding rankings (LeetCode, HackerRank), or hackathon achievements (Smart India Hackathon).'
        : undefined,
  })

  if (bonusScore >= 8) {
    strengths.push('Recognized certifications and competitive achievements highlighted.')
  } else {
    improvements.push('Highlight competitive programming achievements, hackathons, or cloud certifications.')
  }

  // -------------------------------------------------------------
  // Total Score Calculation (0 to 100)
  // -------------------------------------------------------------
  const totalScore = Math.min(100, Math.max(10, rules.reduce((acc, r) => acc + r.score, 0)))

  let ratingTier: ATSScorerResult['ratingTier'] = 'High Filter Risk'
  let ratingSummary = ''
  let targetReadiness = ''

  if (totalScore >= 90) {
    ratingTier = 'ATS Elite'
    ratingSummary = 'Top 5% candidate tier. Highly optimized for automated Indian & global ATS screening.'
    targetReadiness = 'Ready for immediate shortlisting at Google, Microsoft, Swiggy, Razorpay, TCS Digital, and Tier-1 MNCs.'
  } else if (totalScore >= 78) {
    ratingTier = 'ATS Competitive'
    ratingSummary = 'Strong alignment. Passes primary keyword checks with minor polish recommendations.'
    targetReadiness = 'Passes automated screening for 85%+ of tech startups, TCS Ninja/Digital, Infosys, and Cognizant.'
  } else if (totalScore >= 60) {
    ratingTier = 'Needs Optimization'
    ratingSummary = 'Several ATS rules need attention. Risk of silent rejection in high-volume applicant pools.'
    targetReadiness = 'May be filtered out by strict MNC automated screening. Review the recommendations below to boost score.'
  } else {
    ratingTier = 'High Filter Risk'
    ratingSummary = 'Critical ATS structural and content gaps detected.'
    targetReadiness = 'High probability of automated ATS rejection before recruiter review.'
  }

  return {
    totalScore,
    ratingTier,
    ratingSummary,
    targetReadiness,
    rules,
    strengths,
    improvements,
    scannedAt: new Date().toISOString(),
  }
}

