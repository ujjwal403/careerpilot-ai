import type { Metadata } from 'next'
import { SignupForm } from '@/components/auth/SignupForm'

export const metadata: Metadata = {
  title: 'Sign Up – CareerPilot AI',
  description: 'Create your CareerPilot AI account and accelerate your job search',
}

export default function SignupPage() {
  return <SignupForm />
}
