import { createClient } from '@/lib/supabase/server'
import { OWNER_USER_ID } from '@/lib/config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import IterateButton from './IterateButton'

type Chapter = { name: string; content: string }
type BiographyContent = { preface: string; chapters: Chapter[]; epilogue: string }

export default async function BiographyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: biography } = await supabase
    .from('biographies')
    .select('id, title, subtitle, content, batches, updated_at')
    .eq('id', id)
    .eq('user_id', OWNER_USER_ID)
    .single()

  if (!biography) notFound()

  let parsed: BiographyContent | null = null
  try {
    parsed = biography.content ? JSON.parse(biography.content) : null
  } catch {
    parsed = null
  }

  // Compute new available batches for iterate
  const { data: questions } = await supabase
    .from('questions')
    .select('id, batch')
    .eq('level', 1)

  const { data: answers } = await supabase
    .from('answers')
    .select('question_id')
    .eq('user_id', OWNER_USER_ID)

  const answeredIds = new Set(answers?.map(a => a.question_id) ?? [])
  const batchMap = new Map<number, number[]>()
  for (const q of questions ?? []) {
    if (!batchMap.has(q.batch)) batchMap.set(q.batch, [])
    batchMap.get(q.batch)!.push(q.id)
  }
  const existingBatches = new Set<number>(biography.batches ?? [])
  const newAvailableBatches = [...batchMap.entries()]
    .filter(([batch, ids]) => !existingBatches.has(batch) && ids.every(id => answeredIds.has(id)))
    .map(([batch]) => batch)
    .sort((a, b) => a - b)

  const chapters = parsed?.chapters ?? []

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      {/* Cover */}
      <div className="relative bg-gradient-to-b from-[#6B3F25] via-[#8B5535] to-[#3D2011] px-6 pt-14 pb-10">
        <Link
          href="/biographies"
          className="absolute top-14 left-5 text-white/70 text-sm font-medium"
        >
          ‹ 返回
        </Link>

        <p className="text-xs text-white/50 mt-6 mb-3">你的專屬人生故事</p>
        <h1 className="text-2xl font-bold text-white leading-snug mb-2">
          {biography.title}
        </h1>
        {biography.subtitle && (
          <p className="text-sm text-white/70 leading-relaxed">{biography.subtitle}</p>
        )}
      </div>

      {/* TOC card */}
      <div className="mx-5 -mt-4 relative z-10 bg-white rounded-2xl p-5 shadow-sm border border-[#F0E8DF]">
        <p className="text-xs text-[#8B5535] font-medium mb-4">目錄</p>
        <div className="space-y-3">
          <a href="#preface" className="flex items-start gap-3 group">
            <span className="text-xs text-[#C4A882] w-8 shrink-0 pt-0.5">序章</span>
            <div>
              <p className="text-sm font-medium text-[#3D2011] group-hover:text-[#8B5535] transition-colors">
                關於這本書
              </p>
              <p className="text-xs text-[#9A8577] mt-0.5">
                {biography.subtitle ?? '這是屬於你的故事，也是你走過的足跡。'}
              </p>
            </div>
          </a>

          {chapters.map((ch, i) => (
            <a key={i} href={`#chapter-${i}`} className="flex items-start gap-3 group">
              <span className="text-xs text-[#C4A882] w-8 shrink-0 pt-0.5">第 {i + 1} 章</span>
              <p className="text-sm font-medium text-[#3D2011] group-hover:text-[#8B5535] transition-colors">
                {ch.name}
              </p>
            </a>
          ))}

          <a href="#epilogue" className="flex items-start gap-3 group">
            <span className="text-xs text-[#C4A882] w-8 shrink-0 pt-0.5">後記</span>
            <p className="text-sm font-medium text-[#3D2011] group-hover:text-[#8B5535] transition-colors">
              關於現在的我
            </p>
          </a>
        </div>
      </div>

      {/* Start reading button */}
      <div className="px-5 mt-5">
        <a
          href="#preface"
          className="block w-full bg-[#8B5535] text-white text-center rounded-2xl py-4 text-sm font-semibold"
        >
          開始閱讀
        </a>
      </div>

      {/* Content */}
      <div className="px-5 mt-12 pb-32 space-y-12">
        {/* Preface */}
        {parsed?.preface && (
          <section id="preface">
            <p className="text-xs text-[#C4A882] mb-1">序章</p>
            <h2 className="text-lg font-bold text-[#3D2011] mb-5">關於這本書</h2>
            <p className="text-sm text-[#5C4033] leading-loose whitespace-pre-wrap">
              {parsed.preface}
            </p>
          </section>
        )}

        {/* Chapters */}
        {chapters.map((ch, i) => (
          <section key={i} id={`chapter-${i}`}>
            <p className="text-xs text-[#C4A882] mb-1">第 {i + 1} 章</p>
            <h2 className="text-lg font-bold text-[#3D2011] mb-5">{ch.name}</h2>
            <p className="text-sm text-[#5C4033] leading-loose whitespace-pre-wrap">
              {ch.content}
            </p>
          </section>
        ))}

        {/* Epilogue */}
        {parsed?.epilogue && (
          <section id="epilogue">
            <p className="text-xs text-[#C4A882] mb-1">後記</p>
            <h2 className="text-lg font-bold text-[#3D2011] mb-5">關於現在的我</h2>
            <p className="text-sm text-[#5C4033] leading-loose whitespace-pre-wrap">
              {parsed.epilogue}
            </p>
          </section>
        )}
      </div>

      {/* Iterate button */}
      {newAvailableBatches.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 px-5 pb-10 pt-6 bg-gradient-to-t from-[#FBF7F2] via-[#FBF7F2]/90 to-transparent">
          <IterateButton
            biographyId={biography.id}
            newAvailableBatches={newAvailableBatches}
          />
        </div>
      )}
    </div>
  )
}
