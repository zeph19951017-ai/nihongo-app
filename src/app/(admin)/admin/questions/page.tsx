/**
 * 檔案用途：題目管理列表頁
 */

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import QuestionDialog from '@/components/admin/QuestionDialog'
import DeleteButton from '@/components/admin/DeleteButton'
import { deleteQuestion } from '@/app/actions/admin/questions'

const typeLabels: Record<string, string> = {
  multiple_choice: '選擇題',
  fill_blank: '填空題',
  matching: '配對題',
}

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; difficulty?: string }>
}) {
  const { type, difficulty } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('questions')
    .select('id, type, question, correct_answer, difficulty, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (type) query = query.eq('type', type)
  if (difficulty) query = query.eq('difficulty', difficulty)

  const { data: questions, count } = await query
  const { data: vocab } = await supabase.from('vocabulary').select('id, kana, meaning').order('kana')
  const { data: grammar } = await supabase.from('grammar').select('id, pattern').order('pattern')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">題目管理</h1>
          <p className="text-gray-500 text-sm mt-1">共 {count ?? 0} 筆題目</p>
        </div>
        <QuestionDialog vocab={vocab ?? []} grammar={grammar ?? []} />
      </div>

      <form className="flex flex-wrap gap-3">
        <select name="type" defaultValue={type} className="rounded-md border px-3 py-2 text-sm">
          <option value="">全部題型</option>
          <option value="multiple_choice">選擇題</option>
          <option value="fill_blank">填空題</option>
          <option value="matching">配對題</option>
        </select>
        <select name="difficulty" defaultValue={difficulty} className="rounded-md border px-3 py-2 text-sm">
          <option value="">全部難度</option>
          {['N5', 'N4', 'N3', 'N2', 'N1'].map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <button type="submit" className="rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200">篩選</button>
        <a href="/admin/questions" className="rounded-md px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">清除</a>
      </form>

      <Card>
        <CardContent className="p-0">
          {questions && questions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">題目</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">題型</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">答案</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">難度</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {questions.map((q) => (
                    <tr key={q.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 max-w-xs truncate">{q.question}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{typeLabels[q.type]}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{q.correct_answer}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{q.difficulty ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <QuestionDialog vocab={vocab ?? []} grammar={grammar ?? []} question={q} />
                          <DeleteButton id={q.id} label={q.question.slice(0, 20)} deleteAction={deleteQuestion} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12">尚無題目，點右上角「新增題目」開始建立</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
