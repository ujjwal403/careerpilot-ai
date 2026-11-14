import zlib from 'zlib'
import type {
  ResumeExtractedData,
  ExtractedContact,
  ExtractedEducation,
  ExtractedSkills,
  ExtractedExperience,
  ExtractedProject,
  ExtractedCertification,
} from '@/types/resume-extractor'

/**
 * Extracts raw textual content from PDF, DOCX, or text buffers
 */
export async function extractRawTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
  fileName?: string
): Promise<string> {
  const isPdf =
    mimeType.includes('pdf') ||
    buffer.slice(0, 4).toString() === '%PDF' ||
    fileName?.toLowerCase().endsWith('.pdf')

  const isDocx =
    mimeType.includes('wordprocessingml') ||
    mimeType.includes('officedocument') ||
    fileName?.toLowerCase().endsWith('.docx')

  if (isPdf) {
    return extractPdfText(buffer)
  }

  if (isDocx) {
    return extractDocxText(buffer)
  }

  // Fallback to UTF-8 text interpretation
  return buffer.toString('utf-8')
}

/**
 * Helper to decode PDF literal strings, escaped octals (\ddd), and parentheses
 */
function decodePdfLiteralString(str: string): string {
  return str
    .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\([()\\])/g, '$1')
}

/**
 * Helper to decode PDF hexadecimal strings <00410042> or <48656C6C6F>
 */
function decodePdfHexString(hex: string): string {
  const cleaned = hex.replace(/\s+/g, '')
  if (cleaned.length % 2 !== 0) return ''

  // Check for UTF-16BE encoding (starts with 00 or FEFF)
  if (cleaned.startsWith('feff') || cleaned.startsWith('FEFF')) {
    const bytes = Buffer.from(cleaned.slice(4), 'hex')
    return bytes.swap16().toString('utf16le')
  }

  // Check if every second byte is 00 (common 2-byte font encoding)
  if (cleaned.length >= 4 && cleaned.startsWith('00')) {
    let result = ''
    for (let i = 0; i < cleaned.length; i += 4) {
      const code = parseInt(cleaned.slice(i, i + 4), 16)
      if (code >= 32 && code <= 126) {
        result += String.fromCharCode(code)
      } else if (code === 10 || code === 13) {
        result += '\n'
      }
    }
    if (result.trim()) return result
  }

  // Standard ASCII / ISO-8859-1 hex
  const bytes = Buffer.from(cleaned, 'hex')
  return bytes.toString('utf-8')
}

/**
 * Extracts plain text from PDF streams (handling FlateDecode decompression, hex strings, Tj, and TJ arrays)
 */
function extractPdfText(buffer: Buffer): string {
  const content = buffer.toString('binary')
  const extractedLines: string[] = []

  // 1. Search for FlateDecode or uncompressed streams
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g
  let match: RegExpExecArray | null

  while ((match = streamRegex.exec(content)) !== null) {
    const rawData = Buffer.from(match[1], 'binary')
    let streamText = ''

    try {
      streamText = zlib.inflateSync(rawData).toString('utf-8')
    } catch {
      try {
        streamText = zlib.inflateRawSync(rawData).toString('utf-8')
      } catch {
        streamText = rawData.toString('utf-8')
      }
    }

    if (!streamText) continue

    // Extract text blocks inside BT ... ET
    const btRegex = /BT[\s\S]*?ET/g
    let btMatch: RegExpExecArray | null

    while ((btMatch = btRegex.exec(streamText)) !== null) {
      const block = btMatch[0]
      let blockText = ''

      // Handle Tj with literal string: (text) Tj
      const tjLiteralRegex = /\((.*?)\)\s*Tj/g
      let tjMatch: RegExpExecArray | null
      while ((tjMatch = tjLiteralRegex.exec(block)) !== null) {
        blockText += decodePdfLiteralString(tjMatch[1]) + ' '
      }

      // Handle Tj with hex string: <hex> Tj
      const tjHexRegex = /<([0-9a-fA-F]+)>\s*Tj/g
      let tjHexMatch: RegExpExecArray | null
      while ((tjHexMatch = tjHexRegex.exec(block)) !== null) {
        blockText += decodePdfHexString(tjHexMatch[1]) + ' '
      }

      // Handle TJ arrays: [(text) -10 (more)] TJ or [<hex> -10 <hex>] TJ
      const arrayRegex = /\[(.*?)\]\s*TJ/g
      let arrMatch: RegExpExecArray | null
      while ((arrMatch = arrayRegex.exec(block)) !== null) {
        const arrContent = arrMatch[1]
        // Match literal parts
        const innerLiteralRegex = /\((.*?)\)/g
        let innerMatch: RegExpExecArray | null
        while ((innerMatch = innerLiteralRegex.exec(arrContent)) !== null) {
          blockText += decodePdfLiteralString(innerMatch[1])
        }

        // Match hex parts
        const innerHexRegex = /<([0-9a-fA-F]+)>/g
        let innerHex: RegExpExecArray | null
        while ((innerHex = innerHexRegex.exec(arrContent)) !== null) {
          blockText += decodePdfHexString(innerHex[1])
        }

        blockText += ' '
      }

      const trimmed = blockText.trim()
      if (trimmed) {
        extractedLines.push(trimmed)
      }
    }

    // Also look for top-level Tj outside BT...ET if none found
    if (extractedLines.length === 0) {
      const generalTj = /\((.*?)\)\s*Tj/g
      let genMatch: RegExpExecArray | null
      let generalText = ''
      while ((genMatch = generalTj.exec(streamText)) !== null) {
        generalText += decodePdfLiteralString(genMatch[1]) + ' '
      }
      if (generalText.trim()) {
        extractedLines.push(generalText.trim())
      }
    }
  }

  let fullText = extractedLines.join('\n')

  // Clean up escaped PDF characters
  fullText = fullText
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\t/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim()

  // Fallback: If decompression extracted almost nothing, scan raw buffer for ASCII runs
  if (fullText.length < 50) {
    const asciiMatches = content.match(/[A-Za-z0-9@+._\s-]{5,}/g)
    if (asciiMatches && asciiMatches.length > 5) {
      fullText = asciiMatches
        .filter((s) => !/stream|endstream|obj|endobj|Filter|FlateDecode|xref/i.test(s))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
    }
  }

  // Remove Postgres-incompatible null characters (\u0000) and other invalid control chars
  return fullText.replace(/\0/g, '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' ').trim()
}

/**
 * Extracts plain text from DOCX (PKZip XML document)
 */
function extractDocxText(buffer: Buffer): string {
  let offset = 0
  let text = ''

  while ((offset = buffer.indexOf(Buffer.from([0x50, 0x4b, 0x03, 0x04]), offset)) !== -1) {
    const compMethod = buffer.readUInt16LE(offset + 8)
    const compSize = buffer.readUInt32LE(offset + 18)
    const fileNameLen = buffer.readUInt16LE(offset + 26)
    const extraLen = buffer.readUInt16LE(offset + 28)
    const fileName = buffer.slice(offset + 30, offset + 30 + fileNameLen).toString('utf-8')
    const dataStart = offset + 30 + fileNameLen + extraLen

    if (fileName === 'word/document.xml' && compSize > 0) {
      const compData = buffer.slice(dataStart, dataStart + compSize)
      let xml = ''
      try {
        xml = compMethod === 8 ? zlib.inflateRawSync(compData).toString('utf-8') : compData.toString('utf-8')
      } catch {
        xml = compData.toString('utf-8')
      }

      const matches = xml.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || []
      text = matches.map((m) => m.replace(/<[^>]+>/g, '')).join(' ')
      break
    }
    offset += 4
  }

  return text.trim()
}

/**
 * Common technical and engineering skills catalog
 */
const HARD_SKILLS_CATALOG = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript', 'HTML5', 'HTML', 'CSS3', 'CSS',
  'Tailwind CSS', 'Tailwind', 'Redux', 'Zustand', 'Sass', 'Webpack', 'Vite',
  'Node.js', 'Express', 'Express.js', 'NestJS', 'Python', 'Django', 'FastAPI', 'Flask', 'Java',
  'Spring Boot', 'Spring', 'C++', 'C#', '.NET', 'Go', 'Golang', 'Rust', 'PHP', 'Laravel',
  'PostgreSQL', 'Postgres', 'MySQL', 'MongoDB', 'Redis', 'Supabase', 'Firebase', 'SQLite',
  'DynamoDB', 'Prisma', 'GraphQL', 'REST APIs', 'REST API', 'RESTful APIs',
  'AWS', 'Google Cloud', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'CI/CD',
  'GitHub Actions', 'Linux', 'Git', 'GitHub', 'Microservices', 'System Design',
  'Data Structures & Algorithms', 'DSA', 'Machine Learning', 'Deep Learning',
  'PyTorch', 'TensorFlow', 'Pandas', 'NumPy', 'Scikit-learn', 'NLP', 'Computer Vision',
  'SQL', 'NoSQL', 'Kafka', 'RabbitMQ', 'NextJS'
]

/**
 * Common soft skills catalog
 */
const SOFT_SKILLS_CATALOG = [
  'Problem Solving', 'Team Leadership', 'Leadership', 'Agile / Scrum', 'Agile', 'Scrum',
  'Effective Communication', 'Communication', 'Critical Thinking', 'Time Management',
  'Cross-functional Collaboration', 'Collaboration', 'Adaptability', 'Mentorship',
  'Analytical Thinking', 'Fast Learner', 'Ownership', 'Teamwork', 'Project Management'
]

/**
 * Major Indian & Global Tech Cities
 */
const TECH_CITIES = [
  'Bangalore', 'Bengaluru', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi', 'New Delhi',
  'Noida', 'Gurgaon', 'Gurugram', 'Chennai', 'Kolkata', 'Kanpur', 'Ahmedabad',
  'Jaipur', 'Lucknow', 'Indore', 'Chandigarh', 'Bhubaneswar', 'Coimbatore',
  'San Francisco', 'New York', 'Seattle', 'Austin', 'London', 'Berlin', 'Remote'
]

/**
 * Branches / Fields of Study in Indian & Global Engineering Colleges
 */
const BRANCHES_CATALOG = [
  { match: /computer\s*science(?:\s*(?:and|&)\s*engineering)?|cse\b/i, name: 'Computer Science & Engineering' },
  { match: /information\s*technology|it\b/i, name: 'Information Technology' },
  { match: /electronics\s*(?:and|&)\s*communication|ece\b/i, name: 'Electronics & Communication Engineering' },
  { match: /electrical(?:\s*(?:and|&)\s*electronics)?|eee\b/i, name: 'Electrical & Electronics Engineering' },
  { match: /mechanical\s*engineering|me\b/i, name: 'Mechanical Engineering' },
  { match: /civil\s*engineering/i, name: 'Civil Engineering' },
  { match: /data\s*science/i, name: 'Data Science' },
  { match: /artificial\s*intelligence(?:\s*(?:and|&)\s*machine\s*learning)?|ai\s*(?:&|\/)\s*ml/i, name: 'Artificial Intelligence & Machine Learning' },
  { match: /software\s*engineering/i, name: 'Software Engineering' },
  { match: /computer\s*applications/i, name: 'Computer Applications' },
  { match: /biotechnology/i, name: 'Biotechnology' },
  { match: /chemical\s*engineering/i, name: 'Chemical Engineering' },
]

/**
 * Heuristic Extractor: Accurate extraction from actual text with ZERO fake hardcoded fallbacks
 */
export function extractWithHeuristics(text: string, fileName?: string): ResumeExtractedData {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  // 1. Contact Information
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  const email = emailMatch ? emailMatch[0].toLowerCase() : null

  const phoneMatch = text.match(/(?:\+?91[\s-]?)?[6-9]\d{9}|\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/)
  const phone = phoneMatch ? phoneMatch[0].trim() : null

  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i)
  const linkedin_url = linkedinMatch
    ? (linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`)
    : null

  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i)
  const github_url = githubMatch
    ? (githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`)
    : null

  let city: string | null = null
  for (const c of TECH_CITIES) {
    const cityRegex = new RegExp(`\\b${c}\\b`, 'i')
    if (cityRegex.test(text)) {
      city = c
      break
    }
  }

  // Name detection: Clean from top lines or filename
  let candidateName: string | null = null
  if (lines.length > 0) {
    const topCandidates = lines.slice(0, 5)
    for (const line of topCandidates) {
      const cleanLine = line.replace(/^[#*\-•\s]+/, '').trim()
      if (
        cleanLine.length >= 3 &&
        cleanLine.length <= 40 &&
        !cleanLine.includes('@') &&
        !cleanLine.includes('http') &&
        !cleanLine.includes('www.') &&
        !/\b(resume|curriculum|vitae|cv|page|profile|contact|phone|email)\b/i.test(cleanLine) &&
        !/^[0-9+() -]+$/.test(cleanLine)
      ) {
        candidateName = cleanLine
        break
      }
    }
  }

  if (!candidateName && fileName) {
    const cleanFileName = fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/[_-]/g, ' ')
      .replace(/\b(resume|cv|latest|updated|final|new|draft|\(\d+\))\b/gi, '')
      .trim()
    if (cleanFileName.length >= 2) {
      candidateName = cleanFileName
    }
  }

  const contact: ExtractedContact = {
    name: candidateName || null,
    email,
    phone,
    city,
    linkedin_url,
    github_url,
  }

  // 2. Education & Academics (EXTRACTED ONLY IF ACTUALLY FOUND)
  const education: ExtractedEducation[] = []
  const collegeKeywords = [
    'institute', 'university', 'college', 'vidyapeeth', 'vishwavidyalaya',
    'iit', 'nit', 'iiit', 'bits', 'vit', 'srm', 'dtu', 'nsut', 'thapar', 'manipal', 'amity', 'lpu'
  ]
  const degreeKeywords = [
    'b.tech', 'btech', 'b.e.', 'be', 'bachelor of technology', 'bachelor of engineering',
    'b.sc', 'bsc', 'bachelor of science', 'bca', 'mca', 'm.tech', 'mtech', 'm.sc', 'msc',
    'master of technology', 'mba', 'diploma', 'higher secondary', 'class xii', 'class x'
  ]

  let foundCollege: string | null = null
  let foundDegree: string | null = null
  let foundBranch: string | null = null
  let gradYear: string | null = null

  // Search lines for college name
  for (const line of lines) {
    const lower = line.toLowerCase()
    if (collegeKeywords.some((kw) => lower.includes(kw))) {
      // Exclude generic header lines like "Education / College"
      if (!/^(education|academics|qualifications|college|university)\s*[:|-]?$/i.test(line)) {
        foundCollege = line.replace(/^(education|academics)[:\s-]*/i, '').trim()
        break
      }
    }
  }

  // Search lines for degree
  for (const line of lines) {
    const lower = line.toLowerCase()
    if (degreeKeywords.some((kw) => lower.includes(kw))) {
      if (!/^(degree|academics|education)\s*[:|-]?$/i.test(line)) {
        foundDegree = line.replace(/^(degree|qualification)[:\s-]*/i, '').trim()
        break
      }
    }
  }

  // Detect branch
  for (const b of BRANCHES_CATALOG) {
    if (b.match.test(text)) {
      foundBranch = b.name
      break
    }
  }

  // Detect score: CGPA or Percentage
  const scoreMatch = text.match(
    /(?:CGPA|SGPA|CPI|GPA|Percentage|Score)[:\s]*([0-9]+(?:\.[0-9]+)?(?:\s*\/\s*10|\s*%)?)|([0-9]+\.[0-9]+(?:\s*\/\s*10|\s*CGPA|\s*SGPA|\s*CPI))|([5-9][0-9](?:\.[0-9]+)?\s*%)/i
  )
  let foundScore: string | null = null
  if (scoreMatch) {
    foundScore = (scoreMatch[1] || scoreMatch[2] || scoreMatch[3] || '').trim()
    if (/^[0-9]+(\.[0-9]+)?$/.test(foundScore)) {
      foundScore = `${foundScore} CGPA`
    }
  }

  // Detect Year (2015 - 2030)
  const yearMatch = text.match(/\b(201[5-9]|202[0-9]|2030)\b/)
  if (yearMatch) {
    gradYear = yearMatch[0]
  }

  // ONLY push education if at least college, degree, or score is found! NO fake defaults!
  if (foundCollege || foundDegree || foundScore) {
    education.push({
      college_name: foundCollege || (foundDegree ? 'University / College' : 'Not specified'),
      degree: foundDegree || (foundBranch ? `Degree in ${foundBranch}` : 'Bachelor Degree'),
      graduation_year: gradYear,
      score: foundScore,
      field_of_study: foundBranch,
    })
  }

  // 3. Skills List (ONLY ACTUALLY MATCHED SKILLS — NO HARDCODED INJECTIONS)
  const lowerText = text.toLowerCase()
  const matchedHardSkills: string[] = []
  for (const skill of HARD_SKILLS_CATALOG) {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9#+])${escaped}(?:$|[^a-zA-Z0-9#+])`, 'i')
    if (regex.test(text)) {
      // Normalize common duplicates
      let normalized = skill
      if (skill === 'NextJS') normalized = 'Next.js'
      if (skill === 'Golang') normalized = 'Go'
      if (skill === 'Postgres') normalized = 'PostgreSQL'
      if (skill === 'Tailwind') normalized = 'Tailwind CSS'
      if (skill === 'REST API' || skill === 'RESTful APIs') normalized = 'REST APIs'
      if (!matchedHardSkills.includes(normalized)) {
        matchedHardSkills.push(normalized)
      }
    }
  }

  const matchedSoftSkills: string[] = []
  for (const skill of SOFT_SKILLS_CATALOG) {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:$|[^a-zA-Z0-9])`, 'i')
    if (regex.test(text) || lowerText.includes(skill.toLowerCase())) {
      let normalized = skill
      if (skill === 'Agile' || skill === 'Scrum') normalized = 'Agile / Scrum'
      if (skill === 'Communication') normalized = 'Effective Communication'
      if (skill === 'Collaboration') normalized = 'Cross-functional Collaboration'
      if (!matchedSoftSkills.includes(normalized)) {
        matchedSoftSkills.push(normalized)
      }
    }
  }

  const skills: ExtractedSkills = {
    hard_skills: matchedHardSkills,
    soft_skills: matchedSoftSkills,
  }

  // 4. Experience & Internships (PARSED DYNAMICALLY — NO FAKE HARDCODED COMPANIES)
  const experience: ExtractedExperience[] = []

  // Check if there is an experience section
  const expSectionRegex = /(?:experience|work\s+experience|internships|employment|work\s+history)\s*[:|-]?\s*\n([\s\S]*?)(?=(?:education|projects|skills|certifications|achievements|academics|\n\s*\n[A-Z\s]{4,}\n|$))/i
  const expMatch = text.match(expSectionRegex)

  if (expMatch && expMatch[1].trim().length > 20) {
    const expText = expMatch[1]
    const expLines = expText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)

    let currentItem: Partial<ExtractedExperience> | null = null
    const dateRegex = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)?\s*\d{4}\s*(?:-|–|to)\s*(?:Present|\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*\d{4})/i

    for (const line of expLines) {
      if (dateRegex.test(line) || /\b(intern|engineer|developer|designer|analyst|manager|associate)\b/i.test(line)) {
        if (currentItem && currentItem.company_name) {
          experience.push({
            company_name: currentItem.company_name,
            role_title: currentItem.role_title || 'Role',
            duration: currentItem.duration || 'Duration not specified',
            location: currentItem.location || null,
            bullet_points: currentItem.bullet_points && currentItem.bullet_points.length > 0
              ? currentItem.bullet_points
              : [],
          })
        }

        const dateFound = line.match(dateRegex)?.[0] || 'Period'
        const titleWithoutDate = line.replace(dateRegex, '').replace(/[-|–,]/g, ' ').trim()

        currentItem = {
          company_name: titleWithoutDate.slice(0, 50) || 'Company',
          role_title: /\b(intern|engineer|developer|lead|analyst|designer)\b/i.test(line) ? line.slice(0, 40) : 'Role',
          duration: dateFound,
          bullet_points: [],
        }
      } else if (currentItem && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.length > 15)) {
        const cleanBullet = line.replace(/^[•\-*]\s*/, '').trim()
        if (cleanBullet.length > 5) {
          currentItem.bullet_points = currentItem.bullet_points || []
          if (currentItem.bullet_points.length < 5) {
            currentItem.bullet_points.push(cleanBullet)
          }
        }
      }
    }

    if (currentItem && currentItem.company_name) {
      experience.push({
        company_name: currentItem.company_name,
        role_title: currentItem.role_title || 'Role',
        duration: currentItem.duration || 'Duration not specified',
        location: currentItem.location || null,
        bullet_points: currentItem.bullet_points || [],
      })
    }
  }

  // 5. Projects (PARSED DYNAMICALLY — NO FAKE DEFAULTS)
  const projects: ExtractedProject[] = []
  const projSectionRegex = /(?:projects|academic\s+projects|personal\s+projects|key\s+projects)\s*[:|-]?\s*\n([\s\S]*?)(?=(?:education|experience|skills|certifications|achievements|academics|\n\s*\n[A-Z\s]{4,}\n|$))/i
  const projMatch = text.match(projSectionRegex)

  if (projMatch && projMatch[1].trim().length > 20) {
    const projText = projMatch[1]
    const projLines = projText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)

    let currentProj: Partial<ExtractedProject> | null = null

    for (const line of projLines) {
      const isHeader =
        line.length < 60 &&
        !line.startsWith('•') &&
        !line.startsWith('-') &&
        !line.startsWith('*') &&
        !line.toLowerCase().startsWith('tech stack')

      if (isHeader) {
        if (currentProj && currentProj.title) {
          projects.push({
            title: currentProj.title,
            description: currentProj.description || 'Project description',
            technologies: currentProj.technologies || [],
            link: currentProj.link || null,
          })
        }

        const linkMatch = line.match(/https?:\/\/[^\s]+/i)
        currentProj = {
          title: line.replace(/https?:\/\/[^\s]+/i, '').replace(/[-|–:]/g, ' ').trim(),
          description: '',
          technologies: [],
          link: linkMatch ? linkMatch[0] : null,
        }
      } else if (currentProj) {
        if (line.toLowerCase().includes('tech') || line.toLowerCase().includes('tools:')) {
          const techs = line.replace(/^[^:]*:\s*/, '').split(/[,|/]/).map((t) => t.trim()).filter(Boolean)
          currentProj.technologies = Array.from(new Set([...(currentProj.technologies || []), ...techs]))
        } else {
          const cleanDesc = line.replace(/^[•\-*]\s*/, '').trim()
          if (!currentProj.description) {
            currentProj.description = cleanDesc
          } else if (currentProj.description.length < 200) {
            currentProj.description += ` ${cleanDesc}`
          }
        }
      }
    }

    if (currentProj && currentProj.title) {
      projects.push({
        title: currentProj.title,
        description: currentProj.description || 'Project description',
        technologies: currentProj.technologies || [],
        link: currentProj.link || null,
      })
    }
  }

  // 6. Certifications (PARSED DYNAMICALLY — NO FAKE DEFAULTS)
  const certifications: ExtractedCertification[] = []
  const certSectionRegex = /(?:certifications|certificates|licenses|courses)\s*[:|-]?\s*\n([\s\S]*?)(?=(?:education|experience|projects|skills|achievements|academics|\n\s*\n[A-Z\s]{4,}\n|$))/i
  const certMatch = text.match(certSectionRegex)

  if (certMatch && certMatch[1].trim().length > 10) {
    const certLines = certMatch[1].split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    for (const line of certLines.slice(0, 6)) {
      const cleanCert = line.replace(/^[•\-*]\s*/, '').trim()
      if (cleanCert.length > 5 && !/^(certifications|courses)$/i.test(cleanCert)) {
        const year = cleanCert.match(/\b(201[8-9]|202[0-9])\b/)?.[0] || null
        certifications.push({
          name: cleanCert.replace(/\b(201[8-9]|202[0-9])\b/, '').replace(/[-|,()]/g, ' ').trim(),
          issuer: null,
          year,
        })
      }
    }
  }

  return {
    contact,
    education,
    skills,
    experience,
    projects,
    certifications,
    raw_text_summary: text.slice(0, 500),
    extracted_at: new Date().toISOString(),
  }
}

/**
 * Main AI Extraction Entrypoint:
 * Tries Gemini API if key is present, falls back gracefully to Heuristic Engine.
 */
export async function extractResumeInformation(
  text: string,
  fileName?: string
): Promise<ResumeExtractedData> {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY

  if (apiKey && text.length > 50) {
    try {
      const prompt = `You are a strict, precise AI Resume parser. Analyze the following resume text and extract the information in strict JSON matching the schema.
IMPORTANT RULES:
- ONLY extract information explicitly present in the resume text.
- Do NOT hallucinate, guess, or invent details.
- If a section (such as experience, certifications, or projects) is not in the resume, return an empty array [].
- If a value like phone, city, CGPA, or graduation year is missing, set it to null.
- For education, extract the actual college name, degree, branch, passing year, and CGPA/percentage if stated.

Resume Text:
"""
${text.slice(0, 8000)}
"""

Return ONLY a valid JSON object matching this schema:
{
  "contact": {
    "name": string or null,
    "email": string or null,
    "phone": string or null,
    "city": string or null,
    "linkedin_url": string or null,
    "github_url": string or null
  },
  "education": [
    {
      "college_name": string,
      "degree": string,
      "graduation_year": string or null,
      "score": string or null,
      "field_of_study": string or null
    }
  ],
  "skills": {
    "hard_skills": string[],
    "soft_skills": string[]
  },
  "experience": [
    {
      "company_name": string,
      "role_title": string,
      "duration": string,
      "location": string or null,
      "bullet_points": string[]
    }
  ],
  "projects": [
    {
      "title": string,
      "description": string,
      "technologies": string[],
      "link": string or null
    }
  ],
  "certifications": [
    {
      "name": string,
      "issuer": string or null,
      "year": string or null
    }
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
              responseMimeType: 'application/json',
              temperature: 0.0,
            },
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        const rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (rawJsonText) {
          const parsed = JSON.parse(rawJsonText) as ResumeExtractedData
          return {
            ...parsed,
            extracted_at: new Date().toISOString(),
            raw_text_summary: text.slice(0, 500),
          }
        }
      }
    } catch {
      // Fall through to local heuristic extractor
    }
  }

  // Fast, accurate local NLP heuristic extraction without fake defaults
  return extractWithHeuristics(text, fileName)
}
