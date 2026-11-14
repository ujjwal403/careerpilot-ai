export interface ExtractedContact {
  name: string | null
  email: string | null
  phone: string | null
  city: string | null
  linkedin_url: string | null
  github_url?: string | null
  portfolio_url?: string | null
}

export interface ExtractedEducation {
  college_name: string
  degree: string
  graduation_year: string | null
  score: string | null // e.g. "8.6 CGPA", "84%", "9.1 CPI", "3.8/4.0"
  field_of_study?: string | null
}

export interface ExtractedSkills {
  hard_skills: string[]
  soft_skills: string[]
}

export interface ExtractedExperience {
  company_name: string
  role_title: string
  duration: string
  bullet_points: string[]
  location?: string | null
}

export interface ExtractedProject {
  title: string
  description: string
  technologies: string[]
  link?: string | null
}

export interface ExtractedCertification {
  name: string
  issuer: string | null
  year: string | null
}

export interface ResumeExtractedData {
  contact: ExtractedContact
  education: ExtractedEducation[]
  skills: ExtractedSkills
  experience: ExtractedExperience[]
  projects: ExtractedProject[]
  certifications: ExtractedCertification[]
  raw_text_summary?: string
  extracted_at: string
}

