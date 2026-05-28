'use client'

/**
 * 檔案用途：單字批次匯入工具
 * 支援 Excel/CSV 上傳、預覽、校驗、批次寫入
 * 欄位：假名 | 漢字 | 中譯 | 例句日文 | 例句中譯 | 難度 | 標籤
 */

import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useUser } from '@/hooks/useUser'

// 匯入列的結構
interface ImportRow {
  kana: string
  kanji: string
  meaning: string
  example_jp: string
  example_zh: string
  difficulty: string
  tags: string
  // 校驗結果
  _valid: boolean
  _errors: string[]
  _rowNum: number
}

const DIFFICULTIES = ['N5', 'N4', 'N3', 'N2', 'N1']

// 驗證每一列資料
function validateRow(row: Record<string, string>, rowNum: number): ImportRow {
  const kana = String(row['假名'] ?? row['kana'] ?? '').trim()
  const kanji = String(row['漢字'] ?? row['kanji'] ?? '').trim()
  const meaning = String(row['中譯'] ?? row['meaning'] ?? '').trim()
  const example_jp = String(row['例句日文'] ?? row['example_jp'] ?? '').trim()
  const example_zh = String(row['例句中譯'] ?? row['example_zh'] ?? '').trim()
  const difficulty = String(row['難度'] ?? row['difficulty'] ?? '').trim().toUpperCase()
  const tags = String(row['標籤'] ?? row['tags'] ?? '').trim()

  const errors: string[] = []
  if (!kana) errors.push('假名為必填')
  if (!meaning) errors.push('中譯為必填')
  if (difficulty && !DIFFICULTIES.includes(difficulty)) errors.push(`難度須為 N5/N4/N3/N2/N1`)

  return { kana, kanji, meaning, example_jp, example_zh, difficulty, tags, _valid: errors.length === 0, _errors: errors, _rowNum: rowNum }
}

// 下載範本
function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ['假名', '漢字', '中譯', '例句日文', '例句中譯', '難度', '標籤'],
    ['たべる', '食べる', '吃', '毎日ご飯を食べる。', '每天吃飯。', 'N5', 'N5,日常生活'],
    ['のむ', '飲む', '喝', 'お水を飲む。', '喝水。', 'N5', 'N5'],
  ])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '單字匯入範本')
  XLSX.writeFile(wb, '單字匯入範本.xlsx')
}

export default function ImportTool() {
  const { user } = useUser()
  const fileRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<ImportRow[]>([])
  const [step, setStep] = useState<'idle' | 'preview' | 'importing' | 'done'>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState({ success: 0, failed: 0, errors: [] as string[] })

  const validRows = rows.filter(r => r._valid)
  const invalidRows = rows.filter(r => !r._valid)

  // 解析上傳的檔案
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const data = ev.target?.result
      const wb = XLSX.read(data, { type: 'binary' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rawRows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })
      const parsed = rawRows.map((r, i) => validateRow(r, i + 2))
      setRows(parsed)
      setStep('preview')
    }
    reader.readAsBinaryString(file)
  }

  // 執行匯入
  const handleImport = async () => {
    if (!user) return toast.error('請先登入')
    setStep('importing')
    setProgress(0)

    const supabase = createClient()
    let successCount = 0
    let failedCount = 0
    const errors: string[] = []

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i]
      const { error } = await supabase.from('vocabulary').insert({
        kana: row.kana,
        kanji: row.kanji || null,
        meaning: row.meaning,
        example_jp: row.example_jp || null,
        example_zh: row.example_zh || null,
        difficulty: (DIFFICULTIES.includes(row.difficulty) ? row.difficulty : null) as 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | null,
        created_by: user.id,
      })

      if (error) {
        failedCount++
        errors.push(`第 ${row._rowNum} 列（${row.kana}）：${error.message}`)
      } else {
        successCount++
      }

      setProgress(Math.round(((i + 1) / validRows.length) * 100))
    }

    setResult({ success: successCount, failed: failedCount, errors })
    setStep('done')
    toast.success(`匯入完成：成功 ${successCount} 筆，失敗 ${failedCount} 筆`)
  }

  // 下載失敗清單
  const downloadErrors = () => {
    const ws = XLSX.utils.aoa_to_sheet([['失敗原因'], ...result.errors.map(e => [e])])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '失敗清單')
    XLSX.writeFile(wb, '匯入失敗清單.xlsx')
  }

  return (
    <div className="space-y-6">
      {/* 步驟 1：下載範本 */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">步驟 1：下載範本</h3>
          <p className="text-sm text-gray-500 mb-3">先下載 Excel 範本，依格式填入單字後再上傳。</p>
          <Button variant="outline" onClick={downloadTemplate} className="gap-2">
            <Download className="h-4 w-4" />下載 Excel 範本
          </Button>
        </CardContent>
      </Card>

      {/* 步驟 2：上傳檔案 */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">步驟 2：上傳檔案</h3>
          <div
            className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">點此上傳 .xlsx 或 .csv 檔案</p>
            <input ref={fileRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={handleFile} />
          </div>
        </CardContent>
      </Card>

      {/* 步驟 3：預覽 */}
      {step === 'preview' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">步驟 3：預覽與校驗</h3>
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-4 w-4" />{validRows.length} 筆正常</span>
                {invalidRows.length > 0 && <span className="flex items-center gap-1 text-red-500"><XCircle className="h-4 w-4" />{invalidRows.length} 筆有誤</span>}
              </div>
            </div>
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left">列</th>
                    <th className="px-3 py-2 text-left">狀態</th>
                    <th className="px-3 py-2 text-left">假名</th>
                    <th className="px-3 py-2 text-left">中譯</th>
                    <th className="px-3 py-2 text-left">難度</th>
                    <th className="px-3 py-2 text-left">問題</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((row, i) => (
                    <tr key={i} className={row._valid ? '' : 'bg-red-50'}>
                      <td className="px-3 py-2 text-gray-400">{row._rowNum}</td>
                      <td className="px-3 py-2">{row._valid ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}</td>
                      <td className="px-3 py-2">{row.kana}</td>
                      <td className="px-3 py-2">{row.meaning}</td>
                      <td className="px-3 py-2">{row.difficulty}</td>
                      <td className="px-3 py-2 text-red-500">{row._errors.join('、')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleImport} disabled={validRows.length === 0}>
                確認匯入 {validRows.length} 筆
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 步驟 4：匯入進度 */}
      {step === 'importing' && (
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <p className="font-semibold">匯入中... {progress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 步驟 5：完成 */}
      {step === 'done' && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-6">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                <span className="text-2xl font-bold">{result.success}</span>
                <span className="text-sm">筆成功</span>
              </div>
              {result.failed > 0 && (
                <div className="flex items-center gap-2 text-red-500">
                  <XCircle className="h-6 w-6" />
                  <span className="text-2xl font-bold">{result.failed}</span>
                  <span className="text-sm">筆失敗</span>
                </div>
              )}
            </div>
            {result.failed > 0 && (
              <Button variant="outline" onClick={downloadErrors} className="gap-2">
                <Download className="h-4 w-4" />下載失敗清單
              </Button>
            )}
            <Button variant="outline" onClick={() => { setStep('idle'); setRows([]); if (fileRef.current) fileRef.current.value = '' }}>
              再次匯入
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
