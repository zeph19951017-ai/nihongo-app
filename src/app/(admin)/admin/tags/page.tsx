/**
 * 檔案用途：標籤管理頁
 */

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TagsManager from '@/components/admin/TagsManager'

export default async function TagsPage() {
  const supabase = await createClient()
  const { data: tags } = await supabase.from('tags').select('*').order('type').order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">標籤管理</h1>
        <p className="text-gray-500 text-sm mt-1">管理單字與文法的分類標籤</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <TagsManager initialTags={tags ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}
