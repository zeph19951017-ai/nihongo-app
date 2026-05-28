'use client'

/**
 * 檔案用途：後台左側導覽側邊欄
 * 手機版可收合，電腦版固定顯示
 */

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  HelpCircle,
  Package,
  Tag,
  Upload,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'

// 選單項目定義
const menuItems = [
  { href: '/admin', icon: LayoutDashboard, label: '儀表板' },
  { href: '/admin/students', icon: Users, label: '學生管理' },
  { href: '/admin/vocabulary', icon: BookOpen, label: '單字管理' },
  { href: '/admin/grammar', icon: FileText, label: '文法管理' },
  { href: '/admin/questions', icon: HelpCircle, label: '題目管理' },
  { href: '/admin/packs', icon: Package, label: '課程包' },
  { href: '/admin/tags', icon: Tag, label: '標籤管理' },
  { href: '/admin/import', icon: Upload, label: '批次匯入' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile } = useUser()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  // 側邊欄內容（共用於手機與電腦版）
  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* 標題與老師資訊 */}
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
            {profile?.name?.[0] ?? 'T'}
          </div>
          <div>
            <p className="font-semibold text-sm">{profile?.name ?? '老師'}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              老師
            </p>
          </div>
        </div>
      </div>

      {/* 選單項目 */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* 登出按鈕 */}
      <div className="border-t p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          登出
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* 手機版：漢堡選單按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden rounded-lg bg-white p-2 shadow-md border"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* 手機版：遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 手機版：側邊欄（滑入） */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transition-transform duration-300 md:hidden',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </div>

      {/* 電腦版：固定側邊欄 */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col bg-white border-r shadow-sm">
        <SidebarContent />
      </div>
    </>
  )
}
