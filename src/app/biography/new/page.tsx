import { createClient } from '@/lib/supabase/server'
import { OWNER_USER_ID } from '@/lib/config'
import Link from 'next/link'
import GenerateForm from './GenerateForm'

export default async function NewBiographyPage() {
  const supabase = await createClient()

  const { data: questions } = await supabase
    .from('questions')
    .select('id, batch')
    .eq('level', 1)

  const { data: answers } = await supabase
    .from('answers')
    .select('question_id')
    .eq('user_id', OWNER_USER_ID)

  const answeredIds = new Set(answers?.map(a => a.question_id) ?? [])

  // Group questions by batch
  const batchMap = new Map<number, number[]>()
  for (const q of questions ?? []) {
    if (!batchMap.has(q.batch)) batchMap.set(q.batch, [])
    batchMap.get(q.batch)!.push(q.id)
  }

  // A batch is available only if ALL its questions are answered
  const availableBatches = [...batchMap.entries()]
    .filter(([, ids]) => ids.every(id => answeredIds.has(id)))
    .map(([batch]) => batch)
    .sort((a, b) => a - b)

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      <div className="flex items-center justify-between px-5 pt-14 pb-4">
        <Link href="/biographies" className="text-[#8B5535] text-sm font-medium">
          ‹ 返回
        </Link>
        <h1 className="text-base font-semibold text-[#3D2011]">建立新傳記</h1>
        <div className="w-12" />
      </div>

      <div className="px-5 pb-10">
        <p className="text-sm text-[#5C4033] mb-6 leading-relaxed">
          選擇要納入這本傳記的題目批次。每個批次代表一組你已完成的問題。
        </p>

        {availableBatches.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#9A8577] text-sm leading-relaxed">
              尚未有可用的批次。<br />請先完成所有問題的回答。
            </p>
            <Link
              href="/questions"
              className="inline-block mt-6 text-[#8B5535] text-sm font-medium"
            >
              前往回答問題 ›
            </Link>
          </div>
        ) : (
          <GenerateForm availableBatches={availableBatches} />
        )}
      </div>
    </div>
  )
}
