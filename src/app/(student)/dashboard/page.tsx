/**
 * 檔案用途：學生儀表板首頁（暫時佔位，WP4 會替換）
 */

import LogoutButton from '@/components/shared/LogoutButton'

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">學生儀表板</h1>
      <p className="text-gray-600">WP4 開發中...</p>
      <LogoutButton />
    </div>
  )
}
