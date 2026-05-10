'use server'

import { createClient } from '@/lib/supabase/server'
import { OWNER_USER_ID } from '@/lib/config'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveAnswer(questionId: number, content: string) {
  const supabase = await createClient()
  await supabase.from('answers').upsert(
    {
      user_id: OWNER_USER_ID,
      question_id: questionId,
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,question_id' }
  )
  revalidatePath('/questions')
  redirect('/questions')
}
