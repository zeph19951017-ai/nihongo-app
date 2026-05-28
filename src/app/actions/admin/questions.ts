'use server'

/**
 * 檔案用途：題目管理 Server Actions
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createQuestion(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const type = formData.get('type') as string
  const question = formData.get('question') as string
  const correct_answer = formData.get('correct_answer') as string
  const difficulty = formData.get('difficulty') as string
  const related_vocab_id = formData.get('related_vocab_id') as string
  const related_grammar_id = formData.get('related_grammar_id') as string
  const optionsRaw = formData.get('options') as string

  if (!type || !question || !correct_answer) return { error: '題型、題目與答案為必填' }

  let options = null
  if (optionsRaw) {
    try { options = JSON.parse(optionsRaw) } catch { return { error: '選項格式錯誤' } }
  }

  const { error } = await supabase.from('questions').insert({
    type,
    question,
    correct_answer,
    options,
    difficulty: difficulty || null,
    related_vocab_id: related_vocab_id || null,
    related_grammar_id: related_grammar_id || null,
    created_by: user.id,
  })

  if (error) return { error: '新增失敗：' + error.message }

  revalidatePath('/admin/questions')
  return { success: '題目新增成功' }
}

export async function updateQuestion(id: string, formData: FormData) {
  const supabase = await createClient()

  const type = formData.get('type') as string
  const question = formData.get('question') as string
  const correct_answer = formData.get('correct_answer') as string
  const difficulty = formData.get('difficulty') as string
  const optionsRaw = formData.get('options') as string

  if (!type || !question || !correct_answer) return { error: '題型、題目與答案為必填' }

  let options = null
  if (optionsRaw) {
    try { options = JSON.parse(optionsRaw) } catch { return { error: '選項格式錯誤' } }
  }

  const { error } = await supabase.from('questions').update({
    type, question, correct_answer, options, difficulty: difficulty || null,
  }).eq('id', id)

  if (error) return { error: '更新失敗：' + error.message }

  revalidatePath('/admin/questions')
  return { success: '題目更新成功' }
}

export async function deleteQuestion(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('questions').delete().eq('id', id)
  if (error) return { error: '刪除失敗：' + error.message }

  revalidatePath('/admin/questions')
  return { success: '題目已刪除' }
}
