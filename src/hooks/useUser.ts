'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

export function useUser() {
  const [state, setState] = useState<{ user: User | null; session: Session | null; loading: boolean }>({
    user: null,
    session: null,
    loading: true,
  })

  useEffect(() => {
    const supabase = createClient()
    const sync = (session: Session | null, loading = false) =>
      setState({ session, user: session?.user ?? null, loading })

    supabase.auth.getSession().then(({ data: { session } }) => sync(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => sync(session))

    return () => subscription.unsubscribe()
  }, [])

  return state
}
