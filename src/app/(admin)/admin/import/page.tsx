/**
 * 檔案用途：單字批次匯入頁
 */

import ImportTool from '@/components/admin/ImportTool'

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">批次匯入單字</h1>
        <p className="text-gray-500 text-sm mt-1">上傳 Excel 或 CSV 檔案，一次匯入大量單字</p>
      </div>
      <ImportTool />
    </div>
  )
}
