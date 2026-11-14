import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Login – CareerPilot AI',
  description: 'Sign in to your CareerPilot AI account',
}

export default function LoginPage() {
  return <LoginForm />
}
