'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Loader2 } from 'lucide-react'

interface LogoutButtonProps {
  className?: string
  showIcon?: boolean
  label?: string
}

export function LogoutButton({
  className = '',
  showIcon = true,
  label = 'Log Out',
}: LogoutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch {
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`inline-flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title="Sign out of CareerPilot AI"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
      ) : showIcon ? (
        <LogOut className="w-4 h-4" />
      ) : null}
      <span>{loading ? 'Signing out...' : label}</span>
    </button>
  )
}

