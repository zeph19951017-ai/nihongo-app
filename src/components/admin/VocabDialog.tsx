'use client'

/**
 * 檔案用途：單字新增/編輯彈窗元件
 */

import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil } from 'lucide-react'
import { createVocab, updateVocab } from '@/app/actions/admin/vocabulary'
import type { Tables } from '@/lib/types/database'

type Tag = Pick<Tables<'tags'>, 'id' | 'name' | 'type' | 'color'>
type Vocab = Pick<Tables<'vocabulary'>, 'id' | 'kana' | 'kanji' | 'meaning' | 'difficulty'>

interface Props {
  tags: Tag[]
  vocab?: Vocab
}

const difficulties = ['N5', 'N4', 'N3', 'N2', 'N1']

export default function VocabDialog({ tags, vocab }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const isEdit = !!vocab

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = isEdit
      ? await updateVocab(vocab.id, formData)
      : await createVocab(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.success)
      setOpen(false)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
            <Pencil className="h-3 w-3 mr-1" />編輯
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />新增單字
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? '編輯單字' : '新增單字'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="kana">假名 *</Label>
              <Input id="kana" name="kana" defaultValue={vocab?.kana} placeholder="例：たべる" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="kanji">漢字</Label>
              <Input id="kanji" name="kanji" defaultValue={vocab?.kanji ?? ''} placeholder="例：食べる" />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="meaning">中譯 *</Label>
            <Input id="meaning" name="meaning" defaultValue={vocab?.meaning} placeholder="例：吃" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="example_jp">例句（日文）</Label>
            <Textarea id="example_jp" name="example_jp" placeholder="例：毎日ご飯を食べる。" rows={2} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="example_zh">例句（中譯）</Label>
            <Textarea id="example_zh" name="example_zh" placeholder="例：每天吃飯。" rows={2} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="difficulty">難度</Label>
            <select
              id="difficulty"
              name="difficulty"
              defaultValue={vocab?.difficulty ?? ''}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">不指定</option>
              {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {tags.length > 0 && (
            <div className="space-y-2">
              <Label>標籤</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <label key={tag.id} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" name="tag_ids" value={tag.id} className="rounded" />
                    <span className="text-sm">{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button type="submit" disabled={loading}>
              {loading ? '儲存中...' : (isEdit ? '更新' : '新增')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
