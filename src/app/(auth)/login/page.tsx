'use client'

/**
 * 檔案用途：登入頁面
 * 支援老師與學生登入，依角色跳轉到對應頁面
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setServerError('')

    const supabase = createClient()

    // 呼叫 Supabase 登入
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      // 把英文錯誤訊息轉換成中文
      if (error.message.includes('Invalid login credentials')) {
        setServerError('電子郵件或密碼不正確，請再試一次')
      } else if (error.message.includes('Email not confirmed')) {
        setServerError('請先確認您的電子郵件後再登入')
      } else {
        setServerError('登入時發生錯誤，請稍後再試')
      }
      setIsLoading(false)
      return
    }

    // 登入成功：查詢使用者角色，跳轉到對應頁面
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'teacher') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">日語教學平台</CardTitle>
          <CardDescription>請登入您的帳號</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 電子郵件 */}
            <div className="space-y-1">
              <Label htmlFor="email">電子郵件</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* 密碼 */}
            <div className="space-y-1">
              <Label htmlFor="password">密碼</Label>
              <Input
                id="password"
                type="password"
                placeholder="請輸入密碼"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* 伺服器錯誤訊息 */}
            {serverError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {serverError}
              </div>
            )}

            {/* 登入按鈕 */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '登入中...' : '登入'}
            </Button>

            {/* 忘記密碼連結 */}
            <div className="text-center text-sm">
              <Link
                href="/forgot-password"
                className="text-gray-500 hover:text-gray-700 underline"
              >
                忘記密碼？
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
