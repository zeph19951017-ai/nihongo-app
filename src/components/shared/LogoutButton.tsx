'use client'

/**
 * 檔案用途：登出按鈕元件
 * 可在老師後台與學生介面共用
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  className?: string
}

export default function LogoutButton({ variant = 'outline', className }: LogoutButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
    setIsLoading(false)
  }

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? '登出中...' : '登出'}
    </Button>
  )
}
