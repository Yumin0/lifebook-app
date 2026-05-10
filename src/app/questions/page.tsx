import { createClient } from '@/lib/supabase/server'
import { OWNER_USER_ID } from '@/lib/config'
import Link from 'next/link'

export default async function QuestionsPage() {
  const supabase = await createClient()

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('level', 1)
    .order('order')

  const { data: answers } = await supabase
    .from('answers')
    .select('question_id, updated_at')
    .eq('user_id', OWNER_USER_ID)

  const answeredMap = new Map(answers?.map(a => [a.question_id, a.updated_at]) ?? [])
  const total = questions?.length ?? 10
  const completedCount = answeredMap.size

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4">
        <div className="w-8" />
        <h1 className="text-base font-semibold text-[#3D2011]">我的傳記計畫</h1>
        <div className="w-8" />
      </div>

      <div className="px-5 pb-36">
        {/* Progress */}
        <div className="mb-6">
          <div className="text-sm font-medium text-[#3D2011] mb-2">
            已完成 {completedCount} / {total} 題
          </div>
          <div className="h-1.5 bg-[#EDE3D9] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#8B5535] rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / total) * 100}%` }}
            />
          </div>
          <p className="text-xs text-[#9A8577] mt-2">慢慢來，什麼時候想填寫，就記錄一點。</p>
        </div>

        {/* Questions list */}
        <div className="space-y-2">
          {questions?.map((q) => {
            const answeredAt = answeredMap.get(q.id)
            const isAnswered = !!answeredAt
            const date = answeredAt
              ? new Date(answeredAt).toLocaleDateString('zh-TW', {
                  year: 'numeric', month: '2-digit', day: '2-digit'
                })
              : null

            return (
              <Link
                key={q.id}
                href={`/questions/${q.id}`}
                className="flex items-center gap-3 bg-white rounded-xl px-4 py-4 shadow-sm border border-[#F0E8DF] active:bg-[#FBF7F2] transition-colors"
              >
                <span className="text-sm text-[#C4A882] w-5 shrink-0 text-center">{q.order}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#3D2011] leading-snug">{q.question_text}</p>
                  {isAnswered ? (
                    <p className="text-xs text-[#9A8577] mt-0.5">已完成・{date}</p>
                  ) : (
                    <p className="text-xs text-[#C4A882] mt-0.5">未回答</p>
                  )}
                </div>
                <span className="text-[#C4A882] text-xl leading-none">›</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Bottom button */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-10 pt-6 bg-gradient-to-t from-[#FBF7F2] via-[#FBF7F2]/90 to-transparent">
        {completedCount === total ? (
          <Link
            href="/biography"
            className="block w-full bg-[#8B5535] text-white text-center rounded-2xl py-4 text-sm font-semibold"
          >
            生成我的傳記故事
          </Link>
        ) : (
          <>
            <button
              disabled
              className="w-full bg-[#8B5535] text-white text-center rounded-2xl py-4 text-sm font-semibold opacity-40 cursor-not-allowed"
            >
              生成我的傳記故事
            </button>
            <p className="text-center text-xs text-[#9A8577] mt-2">
              需完成全部 {total} 題才能生成
            </p>
          </>
        )}
      </div>
    </div>
  )
}
