'use client'

/**
 * 檔案用途：課程包新增/編輯彈窗
 */

import { useState } from 'react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil } from 'lucide-react'
import { createPack, updatePack } from '@/app/actions/admin/packs'
import type { Tables } from '@/lib/types/database'

type Vocab = Pick<Tables<'vocabulary'>, 'id' | 'kana' | 'meaning'>
type Grammar = Pick<Tables<'grammar'>, 'id' | 'pattern'>
type Question = Pick<Tables<'questions'>, 'id' | 'question' | 'type'>
type Pack = Pick<Tables<'lesson_packs'>, 'id' | 'name' | 'description' | 'vocab_ids' | 'grammar_ids' | 'question_ids'>

interface Props { vocab: Vocab[]; grammar: Grammar[]; questions: Question[]; pack?: Pack }

export default function PackDialog({ vocab, grammar, questions, pack }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedVocab, setSelectedVocab] = useState<string[]>(pack?.vocab_ids ?? [])
  const [selectedGrammar, setSelectedGrammar] = useState<string[]>(pack?.grammar_ids ?? [])
  const [selectedQ, setSelectedQ] = useState<string[]>(pack?.question_ids ?? [])
  const isEdit = !!pack

  const toggle = (arr: string[], setArr: (v: string[]) => void, id: string) => {
    setArr(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id])
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    selectedVocab.forEach(id => formData.append('vocab_ids', id))
    selectedGrammar.forEach(id => formData.append('grammar_ids', id))
    selectedQ.forEach(id => formData.append('question_ids', id))

    const result = isEdit ? await updatePack(pack.id, formData) : await createPack(formData)
    if (result.error) { toast.error(result.error) }
    else { toast.success(result.success); setOpen(false) }
    setLoading(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"><Pencil className="h-3 w-3 mr-1" />編輯</Button>
        ) : (
          <Button className="gap-2"><Plus className="h-4 w-4" />新增課程包</Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader><SheetTitle>{isEdit ? '編輯課程包' : '新增課程包'}</SheetTitle></SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-1">
            <Label>課程包名稱 *</Label>
            <Input name="name" defaultValue={pack?.name} placeholder="例：第一課 基礎單字" required />
          </div>
          <div className="space-y-1">
            <Label>說明</Label>
            <Textarea name="description" defaultValue={pack?.description ?? ''} placeholder="課程包簡介..." rows={2} />
          </div>

          {/* 選擇單字 */}
          <div className="space-y-2">
            <Label>包含單字（{selectedVocab.length} 個已選）</Label>
            <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
              {vocab.map(v => (
                <label key={v.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                  <input type="checkbox" checked={selectedVocab.includes(v.id)} onChange={() => toggle(selectedVocab, setSelectedVocab, v.id)} />
                  <span className="text-sm">{v.kana}（{v.meaning}）</span>
                </label>
              ))}
              {vocab.length === 0 && <p className="text-sm text-gray-400 text-center py-2">尚無單字</p>}
            </div>
          </div>

          {/* 選擇文法 */}
          <div className="space-y-2">
            <Label>包含文法（{selectedGrammar.length} 個已選）</Label>
            <div className="max-h-32 overflow-y-auto border rounded-lg p-2 space-y-1">
              {grammar.map(g => (
                <label key={g.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                  <input type="checkbox" checked={selectedGrammar.includes(g.id)} onChange={() => toggle(selectedGrammar, setSelectedGrammar, g.id)} />
                  <span className="text-sm">{g.pattern}</span>
                </label>
              ))}
              {grammar.length === 0 && <p className="text-sm text-gray-400 text-center py-2">尚無文法</p>}
            </div>
          </div>

          {/* 選擇題目 */}
          <div className="space-y-2">
            <Label>包含題目（{selectedQ.length} 道已選）</Label>
            <div className="max-h-32 overflow-y-auto border rounded-lg p-2 space-y-1">
              {questions.map(q => (
                <label key={q.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                  <input type="checkbox" checked={selectedQ.includes(q.id)} onChange={() => toggle(selectedQ, setSelectedQ, q.id)} />
                  <span className="text-sm truncate">{q.question.slice(0, 40)}</span>
                </label>
              ))}
              {questions.length === 0 && <p className="text-sm text-gray-400 text-center py-2">尚無題目</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button type="submit" disabled={loading}>{loading ? '儲存中...' : isEdit ? '更新' : '新增'}</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
