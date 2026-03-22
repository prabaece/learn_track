'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const router = useRouter()
  const [userId,   setUserId]   = useState('')
  const [userName, setUserName] = useState('')
  const [email,    setEmail]    = useState('')
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      setEmail(user.email || '')
      setUserName(
        user.user_metadata?.full_name ||
        user.email?.split('@')[0]     ||
        'there'
      )
      setLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.push('/login')
    })
    return () => subscription.unsubscribe()
  }, [router])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return { userId, userName, email, loading, logout }
}
