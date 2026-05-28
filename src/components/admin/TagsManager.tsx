'use client'

/**
 * 檔案用途：標籤管理互動元件（新增/刪除）
 */

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2 } from 'lucide-react'
import type { Tables } from '@/lib/types/database'
import { useRouter } from 'next/navigation'

type Tag = Tables<'tags'>

export default function TagsManager({ initialTags }: { initialTags: Tag[] }) {
  const router = useRouter()
  const [tags, setTags] = useState(initialTags)
  const [name, setName] = useState('')
  const [type, setType] = useState<'level' | 'topic'>('topic')
  const [color, setColor] = useState('#3B82F6')
  const [loading, setLoading] = useState(false)

  const levelTags = tags.filter(t => t.type === 'level')
  const topicTags = tags.filter(t => t.type === 'topic')

  const handleCreate = async () => {
    if (!name.trim()) return toast.error('請輸入標籤名稱')
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('tags').insert({ name: name.trim(), type, color }).select().single()
    if (error) { toast.error('新增失敗：' + error.message) }
    else { toast.success(`標籤「${name}」新增成功`); setTags(prev => [...prev, data]); setName('') }
    setLoading(false)
  }

  const handleDelete = async (tag: Tag) => {
    if (!confirm(`確定要刪除標籤「${tag.name}」嗎？`)) return
    const supabase = createClient()
    const { error } = await supabase.from('tags').delete().eq('id', tag.id)
    if (error) { toast.error('刪除失敗') }
    else { toast.success(`「${tag.name}」已刪除`); setTags(prev => prev.filter(t => t.id !== tag.id)) }
  }

  return (
    <div className="space-y-6">
      {/* 新增標籤表單 */}
      <div className="flex flex-wrap gap-3 items-end p-4 bg-gray-50 rounded-lg">
        <div className="space-y-1">
          <Label>標籤名稱</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="例：商業、旅遊" className="w-32" />
        </div>
        <div className="space-y-1">
          <Label>類型</Label>
          <select value={type} onChange={e => setType(e.target.value as 'level' | 'topic')} className="rounded-md border px-3 py-2 text-sm">
            <option value="topic">主題</option>
            <option value="level">等級</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label>顏色</Label>
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-9 w-16 rounded border cursor-pointer" />
        </div>
        <Button onClick={handleCreate} disabled={loading} className="gap-2">
          <Plus className="h-4 w-4" />{loading ? '新增中...' : '新增標籤'}
        </Button>
      </div>

      {/* 等級標籤 */}
      <div>
        <h3 className="font-semibold text-sm text-gray-600 mb-3">等級標籤</h3>
        <div className="flex flex-wrap gap-2">
          {levelTags.map(tag => (
            <div key={tag.id} className="flex items-center gap-1 rounded-full px-3 py-1 text-sm text-white" style={{ backgroundColor: tag.color ?? '#666' }}>
              {tag.name}
              <button onClick={() => handleDelete(tag)} className="ml-1 hover:opacity-70">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          {levelTags.length === 0 && <p className="text-sm text-gray-400">尚無等級標籤</p>}
        </div>
      </div>

      {/* 主題標籤 */}
      <div>
        <h3 className="font-semibold text-sm text-gray-600 mb-3">主題標籤</h3>
        <div className="flex flex-wrap gap-2">
          {topicTags.map(tag => (
            <div key={tag.id} className="flex items-center gap-1 rounded-full px-3 py-1 text-sm text-white" style={{ backgroundColor: tag.color ?? '#666' }}>
              {tag.name}
              <button onClick={() => handleDelete(tag)} className="ml-1 hover:opacity-70">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          {topicTags.length === 0 && <p className="text-sm text-gray-400">尚無主題標籤</p>}
        </div>
      </div>
    </div>
  )
}
