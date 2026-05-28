'use client'

/**
 * 檔案用途：邀請學生彈窗元件
 */

import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus } from 'lucide-react'
import { inviteStudent } from '@/app/actions/admin/students'

export default function InviteStudentDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await inviteStudent(formData)

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
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          邀請學生
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>邀請新學生</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label htmlFor="name">學生姓名</Label>
            <Input id="name" name="name" placeholder="例：王小明" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">電子郵件</Label>
            <Input id="email" name="email" type="email" placeholder="student@example.com" required />
          </div>
          <p className="text-xs text-gray-500">
            系統將自動發送邀請信，學生點擊連結後可設定密碼並登入。
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button type="submit" disabled={loading}>
              {loading ? '發送中...' : '發送邀請'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
