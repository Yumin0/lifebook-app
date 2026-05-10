import { createClient } from '@/lib/supabase/server'
import { OWNER_USER_ID } from '@/lib/config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AnswerForm from './AnswerForm'

export default async function QuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const questionId = parseInt(id)
  if (isNaN(questionId)) notFound()

  const supabase = await createClient()

  const { data: question } = await supabase
    .from('questions')
    .select('*')
    .eq('id', questionId)
    .single()

  if (!question) notFound()

  const { data: answer } = await supabase
    .from('answers')
    .select('content')
    .eq('user_id', OWNER_USER_ID)
    .eq('question_id', questionId)
    .maybeSingle()

  return (
    <div className="min-h-screen bg-[#FBF7F2] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-2">
        <Link href="/questions" className="text-[#8B5535] text-sm font-medium px-1 py-1">
          ‹ 返回
        </Link>
        <div className="w-12" />
      </div>

      <AnswerForm
        questionId={questionId}
        questionText={question.question_text}
        questionOrder={question.order}
        initialContent={answer?.content ?? ''}
      />
    </div>
  )
}
