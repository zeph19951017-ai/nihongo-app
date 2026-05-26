'use client'

/**
 * 檔案用途：取得當前登入使用者資訊的 React Hook
 * 提供 user、profile、isTeacher、isStudent 等便利屬性
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Tables } from '@/lib/types/database'

type UserProfile = Tables<'users'>

interface UseUserReturn {
  // Supabase auth user（含 email、id 等）
  user: User | null
  // public.users 的 profile（含 name、role）
  profile: UserProfile | null
  // 角色判斷便利屬性
  isTeacher: boolean
  isStudent: boolean
  // 載入狀態
  isLoading: boolean
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // 取得當前使用者
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // 取得 public.users profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profile)
      }
      setIsLoading(false)
    }

    fetchUser()

    // 監聽登入/登出事件，自動更新狀態
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setProfile(profile)
        } else {
          setProfile(null)
        }
        setIsLoading(false)
      }
    )

    // 清理訂閱
    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    profile,
    isTeacher: profile?.role === 'teacher',
    isStudent: profile?.role === 'student',
    isLoading,
  }
}
