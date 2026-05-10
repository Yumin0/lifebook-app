import { createClient } from '@/lib/supabase/server'
import { OWNER_USER_ID } from '@/lib/config'
import Link from 'next/link'

export default async function BiographiesPage() {
  const supabase = await createClient()

  const { data: biographies } = await supabase
    .from('biographies')
    .select('id, title, subtitle, batches, created_at, updated_at')
    .eq('user_id', OWNER_USER_ID)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      <div className="flex items-center justify-between px-5 pt-14 pb-4">
        <Link href="/questions" className="text-[#8B5535] text-sm font-medium">
          ‹ 返回
        </Link>
        <h1 className="text-base font-semibold text-[#3D2011]">我的傳記</h1>
        <div className="w-12" />
      </div>

      <div className="px-5 pb-24">
        {biographies && biographies.length > 0 ? (
          <div className="space-y-4">
            {biographies.map((bio) => {
              const date = new Date(bio.updated_at).toLocaleDateString('zh-TW', {
                year: 'numeric', month: '2-digit', day: '2-digit',
              })
              return (
                <Link
                  key={bio.id}
                  href={`/biography/${bio.id}`}
                  className="block bg-white rounded-2xl p-5 shadow-sm border border-[#F0E8DF] active:bg-[#FBF7F2] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#3D2011] leading-snug">{bio.title}</p>
                      {bio.subtitle && (
                        <p className="text-xs text-[#5C4033] mt-1 leading-snug line-clamp-2">{bio.subtitle}</p>
                      )}
                      <p className="text-xs text-[#9A8577] mt-1.5">
                        {bio.batches?.map((b: number) => `第 ${b} 批`).join('・')}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-[#C4A882]">{date}</p>
                      <span className="text-[#C4A882] text-xl leading-none mt-1 block">›</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-[#9A8577] text-sm leading-relaxed">
              還沒有任何傳記。<br />完成問題後，就可以生成你的第一本傳記。
            </p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-5 pb-10 pt-6 bg-gradient-to-t from-[#FBF7F2] via-[#FBF7F2]/90 to-transparent">
        <Link
          href="/biography/new"
          className="block w-full bg-[#8B5535] text-white text-center rounded-2xl py-4 text-sm font-semibold"
        >
          建立新傳記
        </Link>
      </div>
    </div>
  )
}
