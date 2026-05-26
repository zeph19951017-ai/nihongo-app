/**
 * 檔案用途：身分驗證相關的 Zod 表單驗證 schema
 */

import { z } from 'zod'

// 登入表單
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '請輸入電子郵件')
    .email('電子郵件格式不正確'),
  password: z
    .string()
    .min(1, '請輸入密碼'),
})

// 設定密碼表單（學生收到邀請信後使用）
export const setupPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, '密碼至少需要 8 個字元')
      .regex(/[a-zA-Z]/, '密碼需包含英文字母')
      .regex(/[0-9]/, '密碼需包含數字'),
    confirmPassword: z.string().min(1, '請再次輸入密碼'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '兩次輸入的密碼不一致',
    path: ['confirmPassword'],
  })

// 忘記密碼表單
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, '請輸入電子郵件')
    .email('電子郵件格式不正確'),
})

// 重設密碼表單
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, '密碼至少需要 8 個字元')
      .regex(/[a-zA-Z]/, '密碼需包含英文字母')
      .regex(/[0-9]/, '密碼需包含數字'),
    confirmPassword: z.string().min(1, '請再次輸入密碼'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '兩次輸入的密碼不一致',
    path: ['confirmPassword'],
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type SetupPasswordFormData = z.infer<typeof setupPasswordSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
