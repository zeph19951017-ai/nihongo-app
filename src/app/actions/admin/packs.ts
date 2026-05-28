'use server'

/**
 * 檔案用途：課程包 Server Actions
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPack(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const vocab_ids = formData.getAll('vocab_ids') as string[]
  const grammar_ids = formData.getAll('grammar_ids') as string[]
  const question_ids = formData.getAll('question_ids') as string[]

  if (!name) return { error: '課程包名稱為必填' }

  const { error } = await supabase.from('lesson_packs').insert({
    name, description: description || null, vocab_ids, grammar_ids, question_ids, created_by: user.id,
  })

  if (error) return { error: '新增失敗：' + error.message }

  revalidatePath('/admin/packs')
  return { success: `課程包「${name}」新增成功` }
}

export async function updatePack(id: string, formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const vocab_ids = formData.getAll('vocab_ids') as string[]
  const grammar_ids = formData.getAll('grammar_ids') as string[]
  const question_ids = formData.getAll('question_ids') as string[]

  if (!name) return { error: '課程包名稱為必填' }

  const { error } = await supabase.from('lesson_packs').update({
    name, description: description || null, vocab_ids, grammar_ids, question_ids,
  }).eq('id', id)

  if (error) return { error: '更新失敗：' + error.message }

  revalidatePath('/admin/packs')
  return { success: '課程包更新成功' }
}

export async function deletePack(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('lesson_packs').delete().eq('id', id)
  if (error) return { error: '刪除失敗：' + error.message }

  revalidatePath('/admin/packs')
  return { success: '課程包已刪除' }
}
