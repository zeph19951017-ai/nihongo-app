/**
 * 檔案用途：老師後台共用 Layout
 * 包含左側側邊欄選單，手機版可收合
 */

import type { Metadata } from 'next'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: '老師後台 | 日語教學平台',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 側邊欄 */}
      <AdminSidebar />
      {/* 主內容區 */}
      <main className="flex-1 md:ml-64 p-6">
        {children}
      </main>
      {/* Toast 通知 */}
      <Toaster richColors position="top-right" />
    </div>
  )
}
