'use client'

/**
 * 檔案用途：題目新增/編輯彈窗（支援三種題型）
 */

import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil } from 'lucide-react'
import { createQuestion, updateQuestion } from '@/app/actions/admin/questions'
import type { Tables } from '@/lib/types/database'

type Vocab = Pick<Tables<'vocabulary'>, 'id' | 'kana' | 'meaning'>
type Grammar = Pick<Tables<'grammar'>, 'id' | 'pattern'>
type Question = Pick<Tables<'questions'>, 'id' | 'type' | 'question' | 'correct_answer' | 'difficulty'>

interface Props { vocab: Vocab[]; grammar: Grammar[]; question?: Question }

export default function QuestionDialog({ vocab, grammar, question }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [qType, setQType] = useState(question?.type ?? 'multiple_choice')
  const [options, setOptions] = useState(['', '', '', ''])
  const isEdit = !!question

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    if (qType === 'multiple_choice') {
      formData.set('options', JSON.stringify(options.filter(o => o)))
    }

    const result = isEdit
      ? await updateQuestion(question.id, formData)
      : await createQuestion(formData)

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
          <Button className="gap-2"><Plus className="h-4 w-4" />新增題目</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? '編輯題目' : '新增題目'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label>題型 *</Label>
            <select name="type" value={qType} onChange={e => setQType(e.target.value as typeof qType)} className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="multiple_choice">選擇題</option>
              <option value="fill_blank">填空題</option>
              <option value="matching">配對題</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="question">題目 *</Label>
            <Textarea id="question" name="question" defaultValue={question?.question} placeholder={qType === 'fill_blank' ? '用 ___ 表示空格，例：私は___が好きです。' : '請輸入題目'} rows={2} required />
          </div>

          {/* 選擇題：4 個選項 */}
          {qType === 'multiple_choice' && (
            <div className="space-y-2">
              <Label>選項（至少 2 個）</Label>
              {options.map((opt, i) => (
                <Input key={i} placeholder={`選項 ${i + 1}`} value={opt} onChange={e => setOptions(prev => prev.map((p, j) => j === i ? e.target.value : p))} />
              ))}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="correct_answer">正確答案 *</Label>
            <Input id="correct_answer" name="correct_answer" defaultValue={question?.correct_answer} placeholder="請輸入正確答案" required />
          </div>
          <div className="space-y-1">
            <Label>難度</Label>
            <select name="difficulty" defaultValue={question?.difficulty ?? ''} className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="">不指定</option>
              {['N5', 'N4', 'N3', 'N2', 'N1'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>關聯單字</Label>
              <select name="related_vocab_id" className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="">無</option>
                {vocab.map(v => <option key={v.id} value={v.id}>{v.kana}（{v.meaning}）</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label>關聯文法</Label>
              <select name="related_grammar_id" className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="">無</option>
                {grammar.map(g => <option key={g.id} value={g.id}>{g.pattern}</option>)}
              </select>
            </div>
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
