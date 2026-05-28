/**
 * 檔案用途：學生管理列表頁
 */

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import InviteStudentDialog from '@/components/admin/InviteStudentDialog'

export default async function StudentsPage() {
  const supabase = await createClient()

  const { data: students } = await supabase
    .from('users')
    .select('id, name, email, created_at')
    .eq('role', 'student')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">學生管理</h1>
          <p className="text-gray-500 text-sm mt-1">共 {students?.length ?? 0} 位學生</p>
        </div>
        <InviteStudentDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">學生列表</CardTitle>
        </CardHeader>
        <CardContent>
          {students && students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="pb-2 text-left font-medium">姓名</th>
                    <th className="pb-2 text-left font-medium">電子郵件</th>
                    <th className="pb-2 text-left font-medium">加入日期</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="py-3 font-medium">{s.name}</td>
                      <td className="py-3 text-gray-600">{s.email}</td>
                      <td className="py-3 text-gray-400">
                        {new Date(s.created_at).toLocaleDateString('zh-TW')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">尚無學生，點右上角「邀請學生」開始邀請</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
