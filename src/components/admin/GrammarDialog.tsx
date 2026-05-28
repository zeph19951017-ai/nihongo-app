'use client'

/**
 * 檔案用途：文法新增/編輯彈窗元件
 */

import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil } from 'lucide-react'
import { createGrammar, updateGrammar } from '@/app/actions/admin/grammar'
import type { Tables } from '@/lib/types/database'

type Tag = Pick<Tables<'tags'>, 'id' | 'name' | 'type' | 'color'>
type Grammar = Pick<Tables<'grammar'>, 'id' | 'pattern' | 'explanation' | 'difficulty'>

interface Props { tags: Tag[]; grammar?: Grammar }

export default function GrammarDialog({ tags, grammar }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [examples, setExamples] = useState<{ jp: string; zh: string }[]>([{ jp: '', zh: '' }])
  const isEdit = !!grammar

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set('examples', JSON.stringify(examples.filter(ex => ex.jp || ex.zh)))

    const result = isEdit
      ? await updateGrammar(grammar.id, formData)
      : await createGrammar(formData)

    if (result.error) { toast.error(result.error) }
    else { toast.success(result.success); setOpen(false) }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"><Pencil className="h-3 w-3 mr-1" />編輯</Button>
        ) : (
          <Button className="gap-2"><Plus className="h-4 w-4" />新增文法</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? '編輯文法' : '新增文法'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label htmlFor="pattern">句型 *</Label>
            <Input id="pattern" name="pattern" defaultValue={grammar?.pattern} placeholder="例：〜ている" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="explanation">解說 *</Label>
            <Textarea id="explanation" name="explanation" defaultValue={grammar?.explanation} placeholder="用中文說明文法用法..." rows={3} required />
          </div>
          <div className="space-y-2">
            <Label>例句</Label>
            {examples.map((ex, i) => (
              <div key={i} className="space-y-1 p-3 bg-gray-50 rounded-lg">
                <Input placeholder="日文例句" value={ex.jp} onChange={e => setExamples(prev => prev.map((p, j) => j === i ? { ...p, jp: e.target.value } : p))} />
                <Input placeholder="中文翻譯" value={ex.zh} onChange={e => setExamples(prev => prev.map((p, j) => j === i ? { ...p, zh: e.target.value } : p))} />
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setExamples(prev => [...prev, { jp: '', zh: '' }])}>
              + 新增例句
            </Button>
          </div>
          <div className="space-y-1">
            <Label>難度</Label>
            <select name="difficulty" defaultValue={grammar?.difficulty ?? ''} className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="">不指定</option>
              {['N5', 'N4', 'N3', 'N2', 'N1'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button type="submit" disabled={loading}>{loading ? '儲存中...' : isEdit ? '更新' : '新增'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
