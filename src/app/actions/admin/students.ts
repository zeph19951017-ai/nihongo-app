'use server'

/**
 * 檔案用途：學生管理 Server Actions
 * 包含邀請學生、更新學生資料等操作
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 邀請新學生
export async function inviteStudent(formData: FormData) {
  const email = formData.get('email') as string
  const name = formData.get('name') as string

  if (!email || !name) {
    return { error: '請填寫完整的姓名與電子郵件' }
  }

  const supabase = await createClient()

  // 使用 Supabase Admin 邀請使用者（發送邀請信）
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { name, role: 'student' },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/setup-password`,
  })

  if (error) {
    if (error.message.includes('already been registered')) {
      return { error: '此電子郵件已被註冊' }
    }
    return { error: `邀請失敗：${error.message}` }
  }

  // 手動建立 public.users 資料（因為邀請信流程觸發器可能延遲）
  if (data.user) {
    await supabase.from('users').upsert({
      id: data.user.id,
      email,
      name,
      role: 'student',
    })
  }

  revalidatePath('/admin/students')
  return { success: `已成功發送邀請信到 ${email}` }
}

// 更新學生資料
export async function updateStudent(id: string, name: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .update({ name })
    .eq('id', id)
    .eq('role', 'student')

  if (error) return { error: '更新失敗，請再試一次' }

  revalidatePath('/admin/students')
  return { success: '學生資料已更新' }
}
