/**
 * 檔案用途：Next.js Middleware — 路由保護
 * 負責：
 * 1. 未登入者訪問 /admin/* 或 /dashboard/* → 跳轉 /login
 * 2. 已登入者訪問 /login → 跳轉對應角色首頁
 * 3. 學生訪問 /admin/* → 跳轉 /dashboard
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // 建立 Supabase 客戶端（middleware 專用，需要讀寫 cookie）
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 取得當前使用者（重要：不要移除這行，會影響 session 更新）
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // 1. 未登入者訪問受保護路由 → 跳轉 /login
  if (!user && (pathname.startsWith('/admin') || pathname.startsWith('/dashboard'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. 已登入者訪問 /login → 跳轉對應角色首頁
  if (user && pathname === '/login') {
    // 查詢使用者角色
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const url = request.nextUrl.clone()
    url.pathname = profile?.role === 'teacher' ? '/admin' : '/dashboard'
    return NextResponse.redirect(url)
  }

  // 3. 已登入的學生訪問 /admin → 跳轉 /dashboard
  if (user && pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'teacher') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

// 設定 middleware 只對以下路徑生效（排除靜態檔案）
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
