/**
 * Deterministic Job Profile Matcher for Indian Tech & Corporate Placements
 * Evaluates candidate CV content and extracted skills against high-demand industry profiles.
 */

export interface JobProfileDefinition {
  id: string
  title: string
  category: string
  description: string
  salaryRangeINR: string
  requiredSkills: string[]
  preferredSkills: string[]
}

export interface JobProfileMatchResult {
  profile: JobProfileDefinition
  matchScore: number // 0 to 100
  matchedSkills: string[]
  missingSkills: string[]
  recommendation: string
}

export const TARGET_JOB_PROFILES: JobProfileDefinition[] = [
  {
    id: 'full-stack',
    title: 'Full Stack Engineer',
    category: 'Software Engineering',
    description: 'Develops end-to-end web architectures, combining modern React/Next.js frontends with robust backend APIs.',
    salaryRangeINR: '₹7 - ₹18 LPA',
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'SQL', 'Git', 'REST APIs'],
    preferredSkills: ['Next.js', 'PostgreSQL', 'Docker', 'Tailwind CSS', 'AWS', 'Redis', 'GraphQL'],
  },
  {
    id: 'frontend-dev',
    title: 'Frontend Developer',
    category: 'Web & UI Engineering',
    description: 'Builds responsive, high-performance web applications, interactive components, and accessible user flows.',
    salaryRangeINR: '₹6 - ₹15 LPA',
    requiredSkills: ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS'],
    preferredSkills: ['Next.js', 'Redux', 'Responsive Design', 'Web Performance', 'Jest', 'UI/UX'],
  },
  {
    id: 'backend-dev',
    title: 'Backend Engineer',
    category: 'Backend & Systems',
    description: 'Architects scalable microservices, relational databases, caching layers, and high-throughput APIs.',
    salaryRangeINR: '₹8 - ₹20 LPA',
    requiredSkills: ['Node.js', 'Python', 'SQL', 'PostgreSQL', 'REST APIs', 'Git'],
    preferredSkills: ['Docker', 'Redis', 'Microservices', 'MongoDB', 'System Design', 'Kafka', 'FastAPI'],
  },
  {
    id: 'java-spring',
    title: 'Java / Spring Boot Developer',
    category: 'Enterprise Engineering',
    description: 'Builds mission-critical enterprise systems and financial transaction engines for top Indian MNCs and product firms.',
    salaryRangeINR: '₹7 - ₹18 LPA',
    requiredSkills: ['Java', 'Spring Boot', 'SQL', 'REST APIs', 'Git', 'Object-Oriented Programming'],
    preferredSkills: ['Microservices', 'Hibernate', 'Kafka', 'Docker', 'JUnit', 'Maven', 'PostgreSQL'],
  },
  {
    id: 'ai-ml-engineer',
    title: 'AI / Machine Learning Engineer',
    category: 'Data Science & AI',
    description: 'Develops predictive machine learning models, fine-tunes LLMs, and deploys high-scale neural network pipelines.',
    salaryRangeINR: '₹9 - ₹24 LPA',
    requiredSkills: ['Python', 'Machine Learning', 'Pandas', 'NumPy', 'Scikit-learn', 'SQL'],
    preferredSkills: ['PyTorch', 'TensorFlow', 'Deep Learning', 'FastAPI', 'NLP', 'Computer Vision', 'Docker'],
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst / Business Intelligence',
    category: 'Data & Analytics',
    description: 'Extracts strategic business insights, constructs automated SQL pipelines, and designs executive dashboards.',
    salaryRangeINR: '₹5 - ₹14 LPA',
    requiredSkills: ['SQL', 'Python', 'Excel', 'Data Analysis', 'Statistics'],
    preferredSkills: ['PowerBI', 'Tableau', 'Pandas', 'Data Visualization', 'ETL', 'PostgreSQL'],
  },
  {
    id: 'devops-cloud',
    title: 'Cloud & DevOps Engineer',
    category: 'Cloud & Infrastructure',
    description: 'Automates CI/CD delivery pipelines, manages Kubernetes clusters, and guarantees 99.9% cloud infrastructure uptime.',
    salaryRangeINR: '₹8 - ₹22 LPA',
    requiredSkills: ['Docker', 'AWS', 'Linux', 'Git', 'CI/CD', 'Shell Scripting'],
    preferredSkills: ['Kubernetes', 'Terraform', 'Nginx', 'PostgreSQL', 'Monitoring', 'Python'],
  },
  {
    id: 'mobile-dev',
    title: 'Mobile App Developer (Flutter / React Native)',
    category: 'Mobile Engineering',
    description: 'Crafts fluid native and cross-platform mobile apps for millions of Android and iOS users in India.',
    salaryRangeINR: '₹6 - ₹16 LPA',
    requiredSkills: ['Flutter', 'React Native', 'JavaScript', 'Mobile UI', 'Git'],
    preferredSkills: ['Dart', 'TypeScript', 'Firebase', 'State Management', 'REST APIs', 'Android Studio'],
  },
]

/**
 * Calculates match percentage, matched skills, and missing skills for each job profile
 */
export function evaluateJobProfileMatches(
  resumeText: string,
  candidateSkills: string[] = []
): JobProfileMatchResult[] {
  const normalizedText = (resumeText || '').toLowerCase()
  const normalizedCandidateSkills = candidateSkills.map((s) => s.toLowerCase().trim())

  const results: JobProfileMatchResult[] = TARGET_JOB_PROFILES.map((profile) => {
    const allProfileSkills = [...profile.requiredSkills, ...profile.preferredSkills]
    const matchedSkills: string[] = []
    const missingSkills: string[] = []

    for (const skill of allProfileSkills) {
      const skillLower = skill.toLowerCase()
      // Check if candidate listed it directly or text contains it as whole word/phrase
      const isPresentInCandidateList = normalizedCandidateSkills.some(
        (cs) => cs === skillLower || cs.includes(skillLower) || skillLower.includes(cs)
      )
      const isPresentInText =
        normalizedText.includes(` ${skillLower} `) ||
        normalizedText.includes(skillLower)

      if (isPresentInCandidateList || isPresentInText) {
        matchedSkills.push(skill)
      } else {
        missingSkills.push(skill)
      }
    }

    // Weight required skills heavier (70% weight) than preferred skills (30% weight)
    const matchedRequired = profile.requiredSkills.filter((s) => matchedSkills.includes(s)).length
    const matchedPreferred = profile.preferredSkills.filter((s) => matchedSkills.includes(s)).length

    const requiredScore = (matchedRequired / profile.requiredSkills.length) * 70
    const preferredScore = profile.preferredSkills.length > 0
      ? (matchedPreferred / profile.preferredSkills.length) * 30
      : 30

    let matchScore = Math.round(requiredScore + preferredScore)
    if (matchScore > 100) matchScore = 100
    if (matchScore < 15) matchScore = 15

    let recommendation = ''
    if (matchScore >= 80) {
      recommendation = `High competitive match! Your profile is strong for ${profile.title} openings. Highlight projects matching ${profile.requiredSkills.slice(0, 3).join(', ')}.`
    } else if (matchScore >= 55) {
      recommendation = `Moderate match. You have core fundamentals. Adding ${missingSkills.slice(0, 2).join(' & ')} will boost your interview callback rate.`
    } else {
      recommendation = `Gap in key competencies. Build a standalone portfolio project demonstrating ${missingSkills.slice(0, 3).join(', ')} to qualify for screening.`
    }

    return {
      profile,
      matchScore,
      matchedSkills,
      missingSkills,
      recommendation,
    }
  })

  // Sort descending by match score
  return results.sort((a, b) => b.matchScore - a.matchScore)
}

