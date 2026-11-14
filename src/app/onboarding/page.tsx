import type { Metadata } from 'next'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export const metadata: Metadata = {
  title: 'Set Up Your Profile – CareerPilot AI',
  description: 'Choose your target roles, skills, and upload your resume to personalize CareerPilot AI',
}

export default function OnboardingPage() {
  return <OnboardingWizard />
}

