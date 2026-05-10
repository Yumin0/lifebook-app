'use client'

import { useState } from 'react'
import { saveAnswer } from './actions'

const MAX_CHARS = 500

export default function AnswerForm({
  questionId,
  questionText,
  questionOrder,
  initialContent,
}: {
  questionId: number
  questionText: string
  questionOrder: number
  initialContent: string
}) {
  const [content, setContent] = useState(initialContent)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!content.trim()) return
    setSaving(true)
    await saveAnswer(questionId, content.trim())
  }

  return (
    <div className="flex-1 flex flex-col px-5 pb-10">
      {/* Question text */}
      <div className="mt-8 mb-6">
        <p className="text-xs text-[#9A8577] mb-3">問題 {questionOrder}</p>
        <h2 className="text-2xl font-bold text-[#3D2011] leading-snug">{questionText}</h2>
      </div>

      {/* Textarea card */}
      <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-[#F0E8DF] flex flex-col min-h-52">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value.slice(0, MAX_CHARS))}
          placeholder="寫下你的回憶..."
          className="flex-1 resize-none text-sm text-[#3D2011] placeholder:text-[#D4BC9A] focus:outline-none leading-relaxed"
        />
        <div className="text-right text-xs text-[#C4A882] mt-2">
          {content.length} / {MAX_CHARS}
        </div>
      </div>

      {/* Hint */}
      <p className="text-xs text-[#9A8577] text-center mt-4 leading-relaxed">
        你可以暫時離開，回來時會自動保留已填寫的內容。
      </p>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving || !content.trim()}
        className="mt-4 w-full bg-[#8B5535] text-white rounded-2xl py-4 text-sm font-semibold disabled:opacity-40 transition-opacity"
      >
        {saving ? '儲存中...' : '儲存並返回'}
      </button>
    </div>
  )
}
