'use server'

/**
 * 檔案用途：文法管理 Server Actions
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createGrammar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const pattern = formData.get('pattern') as string
  const explanation = formData.get('explanation') as string
  const difficulty = formData.get('difficulty') as string
  const examplesRaw = formData.get('examples') as string
  const tagIds = formData.getAll('tag_ids') as string[]

  if (!pattern || !explanation) return { error: '句型與解說為必填欄位' }

  let examples = []
  try {
    examples = examplesRaw ? JSON.parse(examplesRaw) : []
  } catch {
    return { error: '例句格式錯誤' }
  }

  const { data: grammar, error } = await supabase
    .from('grammar')
    .insert({ pattern, explanation, examples, difficulty: difficulty || null, created_by: user.id })
    .select()
    .single()

  if (error) return { error: '新增失敗：' + error.message }

  if (tagIds.length > 0 && grammar) {
    await supabase.from('grammar_tags').insert(
      tagIds.map((tag_id) => ({ grammar_id: grammar.id, tag_id }))
    )
  }

  revalidatePath('/admin/grammar')
  return { success: `「${pattern}」新增成功` }
}

export async function updateGrammar(id: string, formData: FormData) {
  const supabase = await createClient()

  const pattern = formData.get('pattern') as string
  const explanation = formData.get('explanation') as string
  const difficulty = formData.get('difficulty') as string
  const examplesRaw = formData.get('examples') as string
  const tagIds = formData.getAll('tag_ids') as string[]

  if (!pattern || !explanation) return { error: '句型與解說為必填欄位' }

  let examples = []
  try {
    examples = examplesRaw ? JSON.parse(examplesRaw) : []
  } catch {
    return { error: '例句格式錯誤' }
  }

  const { error } = await supabase
    .from('grammar')
    .update({ pattern, explanation, examples, difficulty: difficulty || null })
    .eq('id', id)

  if (error) return { error: '更新失敗：' + error.message }

  await supabase.from('grammar_tags').delete().eq('grammar_id', id)
  if (tagIds.length > 0) {
    await supabase.from('grammar_tags').insert(
      tagIds.map((tag_id) => ({ grammar_id: id, tag_id }))
    )
  }

  revalidatePath('/admin/grammar')
  return { success: '文法更新成功' }
}

export async function deleteGrammar(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('grammar').delete().eq('id', id)
  if (error) return { error: '刪除失敗：' + error.message }

  revalidatePath('/admin/grammar')
  return { success: '文法已刪除' }
}
