'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('帳號或密碼錯誤，請再試一次。')
      else router.push('/questions')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else router.push('/questions')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#FBF7F2] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#3D2011] tracking-tight">Lifebook</h1>
          <p className="text-sm text-[#9A8577] mt-2">用 10 個問題，拼湊你的人生故事</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F0E8DF]">
          <h2 className="text-base font-semibold text-[#3D2011] mb-5">
            {mode === 'login' ? '登入帳號' : '建立帳號'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#5C4033] block mb-1.5">電子信箱</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-[#E8DDD5] rounded-xl px-3.5 py-3 text-sm text-[#3D2011] placeholder:text-[#C4A882] focus:outline-none focus:ring-2 focus:ring-[#8B5535]/20 focus:border-[#8B5535]"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#5C4033] block mb-1.5">密碼</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-[#E8DDD5] rounded-xl px-3.5 py-3 text-sm text-[#3D2011] placeholder:text-[#C4A882] focus:outline-none focus:ring-2 focus:ring-[#8B5535]/20 focus:border-[#8B5535]"
                placeholder="至少 6 個字元"
                required
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8B5535] text-white rounded-xl py-3.5 text-sm font-medium disabled:opacity-60 transition-opacity mt-2"
            >
              {loading ? '處理中...' : mode === 'login' ? '登入' : '建立帳號'}
            </button>
          </form>
        </div>

        <button
          onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError('') }}
          className="mt-5 w-full text-center text-sm text-[#9A8577]"
        >
          {mode === 'login' ? '還沒有帳號？立即註冊' : '已有帳號？登入'}
        </button>
      </div>
    </div>
  )
}
