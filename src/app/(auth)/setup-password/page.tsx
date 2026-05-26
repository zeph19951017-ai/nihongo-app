'use client'

/**
 * 檔案用途：設定密碼頁面
 * 學生收到邀請信、點連結後到此頁設定密碼並完成註冊
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { setupPasswordSchema, type SetupPasswordFormData } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SetupPasswordPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupPasswordFormData>({
    resolver: zodResolver(setupPasswordSchema),
  })

  const onSubmit = async (data: SetupPasswordFormData) => {
    setIsLoading(true)
    setServerError('')

    const supabase = createClient()

    // 更新密碼（Supabase 已透過邀請連結自動登入）
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    })

    if (error) {
      setServerError('設定密碼時發生錯誤，請確認邀請連結是否有效')
      setIsLoading(false)
      return
    }

    // 設定成功，跳轉到學生儀表板
    router.push('/dashboard')
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">歡迎加入！</CardTitle>
          <CardDescription>請設定您的登入密碼</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 新密碼 */}
            <div className="space-y-1">
              <Label htmlFor="password">設定密碼</Label>
              <Input
                id="password"
                type="password"
                placeholder="至少 8 字元，包含英文與數字"
                autoComplete="new-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* 確認密碼 */}
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">確認密碼</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="請再次輸入密碼"
                autoComplete="new-password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* 密碼規則提示 */}
            <p className="text-xs text-gray-500">
              密碼規則：至少 8 個字元，需包含英文字母與數字
            </p>

            {/* 伺服器錯誤訊息 */}
            {serverError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {serverError}
              </div>
            )}

            {/* 送出按鈕 */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '設定中...' : '完成設定，開始學習'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
