'use server'

/**
 * 檔案用途：單字管理 Server Actions
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 新增單字
export async function createVocab(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const kana = formData.get('kana') as string
  const kanji = formData.get('kanji') as string
  const meaning = formData.get('meaning') as string
  const example_jp = formData.get('example_jp') as string
  const example_zh = formData.get('example_zh') as string
  const difficulty = formData.get('difficulty') as string
  const tagIds = formData.getAll('tag_ids') as string[]

  if (!kana || !meaning) return { error: '假名與中譯為必填欄位' }

  const { data: vocab, error } = await supabase
    .from('vocabulary')
    .insert({
      kana,
      kanji: kanji || null,
      meaning,
      example_jp: example_jp || null,
      example_zh: example_zh || null,
      difficulty: difficulty || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return { error: '新增失敗：' + error.message }

  // 新增標籤關聯
  if (tagIds.length > 0 && vocab) {
    await supabase.from('vocabulary_tags').insert(
      tagIds.map((tag_id) => ({ vocab_id: vocab.id, tag_id }))
    )
  }

  revalidatePath('/admin/vocabulary')
  return { success: `「${kana}」新增成功` }
}

// 更新單字
export async function updateVocab(id: string, formData: FormData) {
  const supabase = await createClient()

  const kana = formData.get('kana') as string
  const kanji = formData.get('kanji') as string
  const meaning = formData.get('meaning') as string
  const example_jp = formData.get('example_jp') as string
  const example_zh = formData.get('example_zh') as string
  const difficulty = formData.get('difficulty') as string
  const tagIds = formData.getAll('tag_ids') as string[]

  if (!kana || !meaning) return { error: '假名與中譯為必填欄位' }

  const { error } = await supabase
    .from('vocabulary')
    .update({
      kana,
      kanji: kanji || null,
      meaning,
      example_jp: example_jp || null,
      example_zh: example_zh || null,
      difficulty: difficulty || null,
    })
    .eq('id', id)

  if (error) return { error: '更新失敗：' + error.message }

  // 重設標籤關聯
  await supabase.from('vocabulary_tags').delete().eq('vocab_id', id)
  if (tagIds.length > 0) {
    await supabase.from('vocabulary_tags').insert(
      tagIds.map((tag_id) => ({ vocab_id: id, tag_id }))
    )
  }

  revalidatePath('/admin/vocabulary')
  return { success: '單字更新成功' }
}

// 刪除單字
export async function deleteVocab(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('vocabulary').delete().eq('id', id)
  if (error) return { error: '刪除失敗：' + error.message }

  revalidatePath('/admin/vocabulary')
  return { success: '單字已刪除' }
}
