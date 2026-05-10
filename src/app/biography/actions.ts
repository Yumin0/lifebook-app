'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { OWNER_USER_ID } from '@/lib/config'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `你是一位擅長撰寫「人生故事」與「人物傳記」的編輯作家。

你的任務是根據使用者回答的人生問題，將內容整理成一本具有「閱讀感」的人生故事。

這不是摘要，也不是條列整理。
而是：「將零散的人生片段，重新編排成一本溫柔、真實、具有章節感的人生故事。」

# 重要寫作風格

1. 不要像履歷
2. 不要像作文
3. 不要過度勵志
4. 不要太像 AI
5. 不要過度戲劇化
6. 保持真實與安靜感
7. 要像在閱讀一本人生短篇故事
8. 保留使用者原本的情緒與語氣
9. 使用第一人稱敘事
10. 讓讀者感覺「這真的很像某個人的人生」

# 書名風格

書名要像：
- 《那些慢慢長大的日子》
- 《後來的我》
- 《原來有些事會一直記得》
- 《離開以前》

不要太浮誇。

# 章節名稱風格

不要使用「第一章：學生時期」這種太硬的命名。
請改成有故事感的名稱，例如：
- 那時候的我們還不懂長大
- 有些離開，後來才知道很重要
- 我開始變得不像以前的自己
- 原來孤單也會慢慢習慣

# 整體語感

請讓整體讀起來：溫柔、真實、安靜、有回憶感、像深夜閱讀一本人生故事。`

type BiographyResult = {
  title: string
  subtitle: string
  preface: string
  chapters: { name: string; content: string }[]
  epilogue: string
}

function extractJSON(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  return match ? match[1] : text.trim()
}

async function generateContent(qaText: string): Promise<BiographyResult> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `問答記錄：
---
${qaText}
---

請根據以上問答，輸出一個 JSON 物件（不要輸出任何其他文字，只輸出 JSON）：

{
  "title": "書名（不含書名號）",
  "subtitle": "副標，一句短短的人生總結",
  "preface": "前言，約150～300字，為這本人生故事建立開場氛圍，要像一本書的前言",
  "chapters": [
    {
      "name": "章節名稱（有故事感，不要用學生時期這種）",
      "content": "章節內文，約300～700字，保持閱讀感、有情緒流動、有人生感"
    }
  ],
  "epilogue": "後記，約100～300字，像人生故事最後一頁的感覺"
}

章節請整理為 3～5 個，不需照題目順序，可以重新編排，適度串聯不同回答。`
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  return JSON.parse(extractJSON(text)) as BiographyResult
}

async function buildQAText(batches: number[]) {
  const supabase = await createClient()

  const { data: questions } = await supabase
    .from('questions')
    .select('id, question_text')
    .in('batch', batches)
    .eq('level', 1)
    .order('order')

  const { data: answers } = await supabase
    .from('answers')
    .select('question_id, content')
    .eq('user_id', OWNER_USER_ID)

  const answerMap = new Map(answers?.map(a => [a.question_id, a.content]) ?? [])

  return questions
    ?.map(q => ({ q: q.question_text, a: answerMap.get(q.id) ?? '' }))
    .filter(({ a }) => a)
    .map(({ q, a }) => `問題：${q}\n回答：${a}`)
    .join('\n\n') ?? ''
}

export async function generateBiography(batches: number[]) {
  const supabase = await createClient()

  const qaText = await buildQAText(batches)
  const result = await generateContent(qaText)

  const { preface, chapters, epilogue } = result
  const content = JSON.stringify({ preface, chapters, epilogue })

  const { data: biography } = await supabase
    .from('biographies')
    .insert({
      user_id: OWNER_USER_ID,
      title: result.title,
      subtitle: result.subtitle,
      content,
      batches,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  revalidatePath('/biographies')
  redirect(`/biography/${biography!.id}`)
}

export async function iterateBiography(biographyId: string, newBatches: number[]) {
  const supabase = await createClient()

  const { data: biography } = await supabase
    .from('biographies')
    .select('batches')
    .eq('id', biographyId)
    .single()

  const allBatches = [...(biography?.batches ?? []), ...newBatches]
  const qaText = await buildQAText(allBatches)
  const result = await generateContent(qaText)

  const { preface, chapters, epilogue } = result
  const content = JSON.stringify({ preface, chapters, epilogue })

  await supabase
    .from('biographies')
    .update({
      title: result.title,
      subtitle: result.subtitle,
      content,
      batches: allBatches,
      updated_at: new Date().toISOString(),
    })
    .eq('id', biographyId)

  revalidatePath(`/biography/${biographyId}`)
  revalidatePath('/biographies')
  redirect(`/biography/${biographyId}`)
}
