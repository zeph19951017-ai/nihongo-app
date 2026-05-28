/**
 * 檔案用途：單字管理列表頁
 */

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import VocabDialog from '@/components/admin/VocabDialog'
import DeleteButton from '@/components/admin/DeleteButton'
import { deleteVocab } from '@/app/actions/admin/vocabulary'

export default async function VocabularyPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; difficulty?: string; page?: string }>
}) {
  const { q, difficulty, page } = await searchParams
  const supabase = await createClient()
  const pageNum = Number(page ?? 1)
  const pageSize = 50
  const from = (pageNum - 1) * pageSize
  const to = from + pageSize - 1

  // 查詢單字（含搜尋與篩選）
  let query = supabase
    .from('vocabulary')
    .select('id, kana, kanji, meaning, difficulty, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (q) query = query.or(`kana.ilike.%${q}%,kanji.ilike.%${q}%,meaning.ilike.%${q}%`)
  if (difficulty) query = query.eq('difficulty', difficulty)

  const { data: vocab, count } = await query

  // 取得標籤列表（供新增/編輯表單使用）
  const { data: tags } = await supabase.from('tags').select('id, name, type, color').order('name')

  const totalPages = Math.ceil((count ?? 0) / pageSize)

  const difficultyColors: Record<string, string> = {
    N5: 'bg-green-100 text-green-700',
    N4: 'bg-blue-100 text-blue-700',
    N3: 'bg-yellow-100 text-yellow-700',
    N2: 'bg-orange-100 text-orange-700',
    N1: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">單字管理</h1>
          <p className="text-gray-500 text-sm mt-1">共 {count ?? 0} 筆單字</p>
        </div>
        <VocabDialog tags={tags ?? []} />
      </div>

      {/* 搜尋與篩選 */}
      <form className="flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="搜尋假名、漢字、中譯..."
          className="rounded-md border px-3 py-2 text-sm flex-1 min-w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="difficulty"
          defaultValue={difficulty}
          className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全部難度</option>
          {['N5', 'N4', 'N3', 'N2', 'N1'].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200">
          搜尋
        </button>
        <a href="/admin/vocabulary" className="rounded-md px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">
          清除
        </a>
      </form>

      <Card>
        <CardContent className="p-0">
          {vocab && vocab.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">假名</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">漢字</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">中譯</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">難度</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {vocab.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{v.kana}</td>
                      <td className="px-4 py-3 text-gray-600">{v.kanji ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{v.meaning}</td>
                      <td className="px-4 py-3">
                        {v.difficulty && (
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${difficultyColors[v.difficulty] ?? ''}`}>
                            {v.difficulty}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <VocabDialog tags={tags ?? []} vocab={v} />
                          <DeleteButton
                            id={v.id}
                            label={v.kana}
                            deleteAction={deleteVocab}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12">尚無單字，點右上角「新增單字」開始建立</p>
          )}
        </CardContent>
      </Card>

      {/* 分頁 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/vocabulary?${new URLSearchParams({ ...(q ? { q } : {}), ...(difficulty ? { difficulty } : {}), page: String(p) })}`}
              className={`rounded-md px-3 py-1 text-sm ${p === pageNum ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
