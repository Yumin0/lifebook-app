import { createClient } from '@/lib/supabase/server'
import { OWNER_USER_ID } from '@/lib/config'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function BiographyPage() {
  const supabase = await createClient()

  const { data: questions } = await supabase
    .from('questions')
    .select('id, order, question_text')
    .eq('level', 1)
    .order('order')

  const { data: answers } = await supabase
    .from('answers')
    .select('question_id, content')
    .eq('user_id', OWNER_USER_ID)

  if ((answers?.length ?? 0) < (questions?.length ?? 10)) {
    redirect('/questions')
  }

  const answerMap = new Map(answers?.map(a => [a.question_id, a.content]) ?? [])

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4">
        <Link href="/questions" className="text-[#8B5535] text-sm font-medium">
          ‹ 返回
        </Link>
        <h1 className="text-base font-semibold text-[#3D2011]">我的傳記</h1>
        <div className="w-12" />
      </div>

      <div className="px-5 pb-16">
        <p className="text-xs text-[#8B5535] font-medium mb-2">你的專屬人生故事</p>
        <h2 className="text-2xl font-bold text-[#3D2011] leading-snug mb-8">
          這是你的故事，<br />由你親手寫下。
        </h2>

        <div className="space-y-6">
          {questions?.map((q) => {
            const content = answerMap.get(q.id)
            if (!content) return null
            return (
              <div key={q.id} className="bg-white rounded-2xl p-5 shadow-sm border border-[#F0E8DF]">
                <p className="text-xs text-[#9A8577] mb-2">第 {q.order} 題</p>
                <p className="text-sm font-semibold text-[#3D2011] mb-3 leading-snug">
                  {q.question_text}
                </p>
                <p className="text-sm text-[#5C4033] leading-relaxed">{content}</p>
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-[#9A8577] mt-8 leading-relaxed">
          你可以隨時回來更新更多內容，<br />你的傳記也會一起成長。
        </p>
      </div>
    </div>
  )
}
