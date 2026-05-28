/**
 * 檔案用途：老師後台儀表板
 * 顯示統計數字、最近新增單字、快速操作
 */

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Users, BookOpen, HelpCircle, Package, Plus, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // 並行查詢所有統計數字
  const [
    { count: studentCount },
    { count: vocabCount },
    { count: questionCount },
    { count: packCount },
    { data: recentVocab },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('vocabulary').select('*', { count: 'exact', head: true }),
    supabase.from('questions').select('*', { count: 'exact', head: true }),
    supabase.from('lesson_packs').select('*', { count: 'exact', head: true }),
    supabase.from('vocabulary').select('id, kana, kanji, meaning, difficulty, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  // 統計卡片資料
  const stats = [
    { label: '學生總數', value: studentCount ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '單字總數', value: vocabCount ?? 0, icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50' },
    { label: '題目總數', value: questionCount ?? 0, icon: HelpCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: '課程包總數', value: packCount ?? 0, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">儀表板</h1>
        <p className="text-gray-500 text-sm mt-1">歡迎回來！以下是目前的學習平台狀況。</p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 最近新增單字 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">最近新增單字</CardTitle>
            <Link href="/admin/vocabulary">
              <Button variant="ghost" size="sm" className="text-xs">查看全部</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentVocab && recentVocab.length > 0 ? (
              <div className="space-y-2">
                {recentVocab.map((vocab) => (
                  <div key={vocab.id} className="flex items-center justify-between py-1 border-b last:border-0">
                    <div>
                      <span className="font-medium text-sm">{vocab.kana}</span>
                      {vocab.kanji && <span className="text-gray-500 text-xs ml-1">（{vocab.kanji}）</span>}
                      <span className="text-gray-600 text-xs ml-2">{vocab.meaning}</span>
                    </div>
                    {vocab.difficulty && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        {vocab.difficulty}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">尚無單字，點下方按鈕新增</p>
            )}
          </CardContent>
        </Card>

        {/* 快速操作 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">快速操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/vocabulary">
              <Button className="w-full justify-start gap-2" variant="outline">
                <Plus className="h-4 w-4" />
                新增單字
              </Button>
            </Link>
            <Link href="/admin/students">
              <Button className="w-full justify-start gap-2" variant="outline">
                <Users className="h-4 w-4" />
                邀請學生
              </Button>
            </Link>
            <Link href="/admin/import">
              <Button className="w-full justify-start gap-2" variant="outline">
                <Upload className="h-4 w-4" />
                批次匯入單字
              </Button>
            </Link>
            <Link href="/admin/packs">
              <Button className="w-full justify-start gap-2" variant="outline">
                <Package className="h-4 w-4" />
                建立課程包
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
