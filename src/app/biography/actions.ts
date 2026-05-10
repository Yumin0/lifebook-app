'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { OWNER_USER_ID } from '@/lib/config'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `你是一位擅長撰寫「人生故事」與「人物傳記」的編輯作家。

你的任務是根據使用者回答的人生問題，將內容融合成一本「連貫」且具有「閱讀感」的人生故事。

這份傳記應該遵循一個明確的敘述弧線：
初心 → 挑戰/轉折 → 反思/成長 → 核心價值 → 未來承諾

### 避免的問題
 
❌ **過度敘述性**：不要寫成流水帳，而要提煉關鍵時刻
❌ **過度評判性**：不要「我很好」，要讓故事本身說話
❌ **碎片化**：不要每句都獨立，要有韻律感
 
### 應該做的
 
✅ **具體意象**：用具體的場景、感受、選擇代替抽象詞
✅ **語言變化**：長句和短句交替，製造節奏感
✅ **動作導向**：多用動詞（選擇、面對、學會、承諾）而不只是形容詞
 
---
 
## 最終檢查清單
 
完成傳記後，檢查以下項目：
 
- [ ] **連貫性**：能否用一句話說出這份傳記的核心主線？
- [ ] **因果性**：每個段落都能清楚解釋「為什麼」而不只是「是什麼」？
- [ ] **遞進性**：從段 1 到段 5 是否呈現了心理或認知的深化？
- [ ] **完整性**：開頭和結尾是否形成了一個圓形敘事（呼應但更深化）？
- [ ] **人性感**：讀者能否感受到這是一個真實的、不斷成長的人，而不是完美的紙上人物？


請讓整體讀起來：溫柔、真實、安靜、有回憶感、像深夜閱讀一本人生故事。`
---
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
