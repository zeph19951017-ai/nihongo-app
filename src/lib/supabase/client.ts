/**
 * 檔案用途：瀏覽器端 Supabase 客戶端
 * 用於 Client Components（'use client' 標記的元件）
 * 每次呼叫會建立新的客戶端實例
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
