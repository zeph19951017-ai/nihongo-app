/**
 * 檔案用途：課程包管理頁
 */

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import PackDialog from '@/components/admin/PackDialog'
import DeleteButton from '@/components/admin/DeleteButton'
import { deletePack } from '@/app/actions/admin/packs'

export default async function PacksPage() {
  const supabase = await createClient()
  const { data: packs, count } = await supabase
    .from('lesson_packs')
    .select('id, name, description, vocab_ids, grammar_ids, question_ids, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  const { data: vocab } = await supabase.from('vocabulary').select('id, kana, meaning').order('kana')
  const { data: grammar } = await supabase.from('grammar').select('id, pattern').order('pattern')
  const { data: questions } = await supabase.from('questions').select('id, question, type').order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">課程包管理</h1>
          <p className="text-gray-500 text-sm mt-1">共 {count ?? 0} 個課程包</p>
        </div>
        <PackDialog vocab={vocab ?? []} grammar={grammar ?? []} questions={questions ?? []} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packs && packs.length > 0 ? packs.map((pack) => (
          <Card key={pack.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{pack.name}</h3>
                  {pack.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{pack.description}</p>}
                  <div className="flex gap-3 mt-3 text-xs text-gray-400">
                    <span>📖 {pack.vocab_ids?.length ?? 0} 個單字</span>
                    <span>📝 {pack.grammar_ids?.length ?? 0} 個文法</span>
                    <span>❓ {pack.question_ids?.length ?? 0} 道題目</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 justify-end">
                <PackDialog vocab={vocab ?? []} grammar={grammar ?? []} questions={questions ?? []} pack={pack} />
                <DeleteButton id={pack.id} label={pack.name} deleteAction={deletePack} />
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-3 text-center text-gray-400 py-12">
            尚無課程包，點右上角「新增課程包」開始建立
          </div>
        )}
      </div>
    </div>
  )
}
