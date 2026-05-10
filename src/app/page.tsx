import { createClient } from '@/lib/supabase/server'
import { OWNER_USER_ID } from '@/lib/config'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: questions }, { data: answers }] = await Promise.all([
    supabase.from('questions').select('id').eq('level', 1),
    supabase.from('answers').select('question_id').eq('user_id', OWNER_USER_ID),
  ])

  const total = questions?.length ?? 10
  const completed = answers?.length ?? 0
  const hasStarted = completed > 0

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F5EDE0]">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-14">
        <button className="text-[#5C4033] text-2xl leading-none font-light">≡</button>
        <button className="text-[#5C4033]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </button>
      </div>

      {/* Hero text */}
      <div className="relative z-10 px-6 mt-10">
        <h1 className="text-[2rem] font-bold text-[#3D2011] leading-tight tracking-tight">
          每個人都值得<br />擁有自己的故事。
        </h1>
        <p className="text-sm text-[#7A5C44] mt-3 leading-relaxed">
          回答 10 個問題，<br />AI 幫你生成專屬的人生傳記。
        </p>
      </div>

      {/* Bottom card */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-6 pt-8 pb-12 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-11 h-11 rounded-full bg-[#FBF7F2] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5535" strokeWidth="1.5">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
        </div>

        {hasStarted ? (
          <>
            <h2 className="text-xl font-bold text-[#3D2011] text-center mb-1">
              繼續你的人生傳記
            </h2>
            <p className="text-xs text-[#9A8577] text-center mb-5">
              你已完成 {completed} 題，繼續加油！
            </p>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-[#9A8577] mb-2">
                <span>完成進度</span>
                <span className="font-medium text-[#8B5535]">{completed} / {total} 題</span>
              </div>
              <div className="h-2 bg-[#EDE3D9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#8B5535] rounded-full transition-all"
                  style={{ width: `${(completed / total) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                {Array.from({ length: total }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${i < completed ? 'bg-[#8B5535]' : 'bg-[#EDE3D9]'}`}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-[#3D2011] text-center mb-3">
              開始你的第一本人生傳記
            </h2>
            <p className="text-sm text-[#9A8577] text-center mb-6 leading-relaxed">
              我們將透過 10 個問題，了解你的重要時刻，<br />並生成專屬於你的故事。
            </p>
          </>
        )}

        <Link
          href="/questions"
          className="flex items-center justify-center gap-2 w-full bg-[#8B5535] text-white rounded-2xl py-4 text-sm font-semibold"
        >
          {hasStarted ? '繼續回答問題' : '開始回答 10 個問題'}
          <span className="text-base">→</span>
        </Link>
      </div>
    </div>
  )
}
