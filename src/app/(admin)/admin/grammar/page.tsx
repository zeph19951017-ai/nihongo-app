/**
 * 檔案用途：文法管理列表頁
 */

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import GrammarDialog from '@/components/admin/GrammarDialog'
import DeleteButton from '@/components/admin/DeleteButton'
import { deleteGrammar } from '@/app/actions/admin/grammar'

export default async function GrammarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; difficulty?: string }>
}) {
  const { q, difficulty } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('grammar')
    .select('id, pattern, explanation, difficulty, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (q) query = query.ilike('pattern', `%${q}%`)
  if (difficulty) query = query.eq('difficulty', difficulty)

  const { data: grammar, count } = await query
  const { data: tags } = await supabase.from('tags').select('id, name, type, color').order('name')

  const difficultyColors: Record<string, string> = {
    N5: 'bg-green-100 text-green-700', N4: 'bg-blue-100 text-blue-700',
    N3: 'bg-yellow-100 text-yellow-700', N2: 'bg-orange-100 text-orange-700',
    N1: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">文法管理</h1>
          <p className="text-gray-500 text-sm mt-1">共 {count ?? 0} 筆文法</p>
        </div>
        <GrammarDialog tags={tags ?? []} />
      </div>

      <form className="flex flex-wrap gap-3">
        <input name="q" defaultValue={q} placeholder="搜尋句型..." className="rounded-md border px-3 py-2 text-sm flex-1 min-w-40 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select name="difficulty" defaultValue={difficulty} className="rounded-md border px-3 py-2 text-sm">
          <option value="">全部難度</option>
          {['N5', 'N4', 'N3', 'N2', 'N1'].map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <button type="submit" className="rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200">搜尋</button>
        <a href="/admin/grammar" className="rounded-md px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">清除</a>
      </form>

      <Card>
        <CardContent className="p-0">
          {grammar && grammar.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">句型</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">解說</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">難度</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {grammar.map((g) => (
                    <tr key={g.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{g.pattern}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{g.explanation}</td>
                      <td className="px-4 py-3">
                        {g.difficulty && (
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${difficultyColors[g.difficulty] ?? ''}`}>
                            {g.difficulty}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <GrammarDialog tags={tags ?? []} grammar={g} />
                          <DeleteButton id={g.id} label={g.pattern} deleteAction={deleteGrammar} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12">尚無文法，點右上角「新增文法」開始建立</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
