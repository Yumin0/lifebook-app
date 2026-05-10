'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.signInAnonymously().then(() => {
      router.push('/questions')
    })
  }, [router])

  return (
    <div className="min-h-screen bg-[#FBF7F2] flex items-center justify-center">
      <p className="text-[#9A8577] text-sm">載入中...</p>
    </div>
  )
}
