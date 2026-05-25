/**
 * 檔案用途：首頁（歡迎頁）
 * 暫時顯示系統建置中的訊息，WP3-4 完成後會替換為正式首頁
 */

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">日語教學 PWA</h1>
        <p className="text-gray-600">系統建置中...</p>
      </div>
    </main>
  )
}
