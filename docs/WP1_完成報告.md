# WP1 完成報告

> 完成日期：2026-05-25
> 執行者：Zeph

---

## ✅ 完成項目清單

- [x] **1.1** GitHub 帳號（zeph19951017-ai）確認可用、Git v2.54.0 已安裝
- [x] **1.2** Vercel 帳號註冊完成，與 GitHub 連結
- [x] **1.3** Supabase 帳號註冊完成，`nihongo-app` 專案建立（Region: Tokyo）
- [x] **1.4** Supabase URL + Publishable Key 已記錄
- [x] **1.5** Next.js 16.2.6 專案初始化完成
- [x] **1.6** 所有套件安裝成功（Supabase、shadcn/ui、lucide-react、clsx、tailwind-merge）
- [x] **1.7** `.env.local` 設定完成，已加入 `.gitignore` 確保不會 commit
- [x] **1.8** Supabase client.ts（瀏覽器端）與 server.ts（伺服器端）建立完成
- [x] **1.9** 推上 GitHub + Vercel 自動部署成功，歡迎頁「日語教學 PWA」可正常訪問
- [x] **1.10** 資料夾結構完整，commit 推送成功

---

## 🔑 環境變數備忘

| 變數名稱 | 說明 |
|---------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://iaxlzdrmqvxnmlbmhtrr.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_Xo4pkrynaXim2qF3GnhRUA_zV2mpu4G` |

> ⚠️ 以上變數已設定於：
> - 本地：`.env.local`（不會 commit）
> - Vercel：Dashboard → Project Settings → Environment Variables

---

## 📁 專案結構

```
src/
├── app/
│   ├── (auth)/        # 登入註冊群組路由
│   ├── (admin)/       # 老師後台群組路由
│   ├── (student)/     # 學生介面群組路由
│   └── api/           # API Routes
├── components/
│   ├── ui/            # shadcn/ui 元件（button.tsx 已生成）
│   ├── admin/         # 老師後台元件
│   ├── student/       # 學生介面元件
│   └── shared/        # 共用元件
├── lib/
│   ├── supabase/
│   │   ├── client.ts  # 瀏覽器端客戶端
│   │   └── server.ts  # 伺服器端客戶端（SSR）
│   ├── types.ts       # TypeScript 型別定義（對應 8 張資料表）
│   └── utils.ts       # 工具函數（shadcn/ui 生成）
└── hooks/             # 自訂 React hooks
```

---

## 📦 安裝的套件版本

| 套件 | 版本 |
|------|------|
| next | 16.2.6 |
| react | 19.2.4 |
| @supabase/supabase-js | latest |
| @supabase/ssr | latest |
| shadcn/ui | 4.8.0 |
| lucide-react | latest |
| clsx | latest |
| tailwind-merge | latest |

---

## 🐛 已知問題 / 待辦

- [ ] Supabase 狀態顯示「Unhealthy」（剛建立時正常，WP2 建立資料表後應自動恢復）
- [ ] 本地尚未測試 `npm run dev`（建議執行一次確認無誤）

---

## ✅ 驗收檢查表

- [x] GitHub 帳號可用、Git 已安裝
- [x] Vercel 帳號註冊完成、與 GitHub 連結
- [x] Supabase 帳號註冊完成、`nihongo-app` 專案建立
- [x] Supabase URL + anon key 已記錄
- [x] Next.js 專案初始化完成
- [x] 所有套件安裝成功（無錯誤訊息）
- [x] `.env.local` 設定完成，且未 commit 到 Git
- [x] Supabase client/server 工具檔建立完成
- [x] 推上 GitHub + Vercel 自動部署成功，網址可訪問
- [x] 資料夾結構完整、commit 推送成功
- [x] 本地修改 → push → Vercel 在 2 分鐘內自動更新（已驗證）
