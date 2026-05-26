/**
 * 檔案用途：老師後台首頁（暫時佔位，WP3 會替換）
 */

import LogoutButton from '@/components/shared/LogoutButton'

export default function AdminPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">老師後台</h1>
      <p className="text-gray-600">WP3 開發中...</p>
      <LogoutButton />
    </div>
  )
}
