'use client'

/**
 * 檔案用途：帶確認彈窗的刪除按鈕（共用元件）
 */

import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface Props {
  id: string
  label: string
  deleteAction: (id: string) => Promise<{ error?: string; success?: string }>
}

export default function DeleteButton({ id, label, deleteAction }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const result = await deleteAction(id)
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
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50">
          <Trash2 className="h-3 w-3 mr-1" />刪除
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>確認刪除</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          確定要刪除「<strong>{label}</strong>」嗎？此操作無法復原。
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? '刪除中...' : '確認刪除'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
