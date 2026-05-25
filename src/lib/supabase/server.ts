/**
 * 檔案用途：伺服器端 Supabase 客戶端
 * 用於 Server Components、Route Handlers、Server Actions
 * 透過 cookies() 取得使用者 session，支援 SSR
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component 中無法設定 cookie，忽略此錯誤
            // 若需要更新 session，請透過 middleware 處理
          }
        },
      },
    }
  )
}
