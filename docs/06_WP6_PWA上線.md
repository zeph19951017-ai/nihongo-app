# 🚀 WP6：PWA 化與上線部署 — Claude Code 執行 Prompt

> **使用方式**：把本文件 + `00_主控文件.md` 一起貼給 Claude Code
> **預估時間**：2-3 天
> **目標產出**：完整 PWA 體驗，可加到主畫面、可離線使用、Lighthouse 評分達標
> **前置條件**：WP1-WP5 已完成

---

## 📌 C — Context（情境）

WP1-WP5 已完成，所有功能都能在線上使用。
本 WP 要把網站變成**真正的 PWA**：可加到主畫面、可離線使用、有完整三層離線機制。

關鍵需求：
- **Service Worker**：攔截網路請求、管理快取
- **Cache Storage**：快取 APP 介面（HTML、CSS、JS、字型）
- **IndexedDB**：快取教材資料、暫存離線答題紀錄
- **加到主畫面**：跳出安裝提示
- **Lighthouse PWA 評分 ≥ 90**

---

## 🎭 R — Role（角色）

請扮演**PWA 專家 + 上線部署工程師**，特性：
- 熟悉 Service Worker 生命週期
- 熟悉 IndexedDB 與 Dexie.js
- 理解離線優先（offline-first）設計
- 重視效能優化（Lighthouse 評分）
- 熟悉 Vercel 上線流程

---

## ⚙️ A — Action（行動）

### 階段 1：PWA 基本設定（第 1 天）

#### 6.1 安裝 next-pwa

```bash
npm install next-pwa
npm install -D @types/serwist serwist
```

修改 `next.config.js` 整合 next-pwa。

#### 6.2 建立 manifest.json

`public/manifest.json`：

```json
{
  "name": "日語教學 APP",
  "short_name": "日語",
  "description": "日語教學自主學習平台",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

#### 6.3 製作 APP 圖示

需要的尺寸：
- 192x192 (Android)
- 512x512 (Android)
- 512x512 maskable (Android adaptive icon)
- apple-touch-icon 180x180 (iOS)
- favicon.ico

**初期方案**：用簡單的 SVG 設計（一個假名「あ」放在藍色圓底上）轉成各尺寸 PNG。
**後期可換**：等用戶決定正式名稱後重做。

工具：可用 https://realfavicongenerator.net 產生所有尺寸。

#### 6.4 修改 layout.tsx 加入 PWA meta

`src/app/layout.tsx`：

```tsx
export const metadata = {
  title: '日語教學 APP',
  description: '...',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '日語',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
};
```

---

### 階段 2：Service Worker 與離線快取（第 1-2 天）

#### 6.5 設定 Service Worker

用 next-pwa 自動生成 SW，但客製化快取策略：

**靜態資源（HTML、CSS、JS、字型、圖片）**：
- 策略：`StaleWhileRevalidate`
- 先給快取，背景更新

**API 請求（/api/* 與 Supabase）**：
- 策略：`NetworkFirst`
- 優先連網，失敗才用快取

**單字 / 文法 / 題目資料**：
- 策略：`CacheFirst` + 24 小時過期
- 優先用快取，過期才更新

**音檔（audio）**：
- 策略：`CacheFirst` + 30 天過期
- 大檔案不重複下載

#### 6.6 建立 IndexedDB 結構

安裝 Dexie.js：
```bash
npm install dexie dexie-react-hooks
```

建立 `src/lib/offline/db.ts`：

```typescript
import Dexie, { Table } from 'dexie';

interface OfflineVocab {
  id: string;
  data: any;
  cached_at: Date;
}

interface OfflineQuizResult {
  id: string;          // local uuid
  session_id: string;
  question_id: string;
  is_correct: boolean;
  user_answer: string;
  answered_at: Date;
  synced: boolean;     // 是否已同步到 Supabase
}

class OfflineDB extends Dexie {
  vocabulary!: Table<OfflineVocab>;
  grammar!: Table<OfflineVocab>;
  questions!: Table<OfflineVocab>;
  quizResults!: Table<OfflineQuizResult>;

  constructor() {
    super('NihongoOfflineDB');
    this.version(1).stores({
      vocabulary: 'id, cached_at',
      grammar: 'id, cached_at',
      questions: 'id, cached_at',
      quizResults: 'id, session_id, synced',
    });
  }
}

export const offlineDB = new OfflineDB();
```

#### 6.7 教材預下載機制

學生登入後，自動把「今日該複習的單字」+「指派課程包的所有資料」下載到 IndexedDB：

`src/lib/offline/sync.ts`：
```typescript
export async function preloadStudyData(userId: string) {
  // 1. 查詢今日該複習的單字 IDs
  // 2. 查詢學生指派的所有課程包
  // 3. 全部寫入 IndexedDB
  // 4. 顯示「已準備好離線使用」提示
}
```

在學生 Layout 中呼叫此函數（每次登入時、每次連網從離線恢復時）。

#### 6.8 離線答題暫存與同步

修改 WP5 的答題寫入邏輯：
- 連線：直接寫 Supabase
- 離線：寫入 IndexedDB 的 `quizResults`，標記 `synced: false`
- 連線恢復時：自動把 `synced: false` 的紀錄推到 Supabase

監聽連線狀態：
```typescript
window.addEventListener('online', syncOfflineData);
window.addEventListener('offline', showOfflineNotice);
```

---

### 階段 3：安裝體驗優化（第 2 天）

#### 6.9 「加到主畫面」提示

建立 `src/components/shared/InstallPrompt.tsx`：

**Android（Chrome）**：
- 監聽 `beforeinstallprompt` 事件
- 在學生首頁底部顯示「📱 加到主畫面」按鈕
- 點擊觸發原生安裝彈窗

**iOS（Safari）**：
- iOS 不支援 `beforeinstallprompt`
- 顯示視覺指引：「點擊分享 ⬆️ → 加到主畫面」
- 用 useUserAgent 判斷 iOS 才顯示

#### 6.10 開機畫面（Splash Screen）

iOS 需要為各種尺寸的裝置設計 splash screen。可以使用工具產生：
- iPhone 各代螢幕尺寸
- iPad 各代螢幕尺寸

工具：https://progressier.com/pwa-icons-and-ios-splash-screen-generator

加入 `<link>` tags 到 layout.tsx。

---

### 階段 4：效能優化（第 2-3 天）

#### 6.11 Lighthouse 評分優化

**目標分數**：
- Performance ≥ 80
- Accessibility ≥ 90
- Best Practices ≥ 90
- SEO ≥ 90
- PWA ≥ 90

**常見優化**：
- 圖片用 Next.js `<Image>` 元件
- 字型用 `next/font` 自動優化
- 動態 import 大型元件（如 Markdown 編輯器）
- 移除未使用的 CSS / JS
- 啟用壓縮（Vercel 預設啟用）

#### 6.12 效能分析

執行 `npm run build`，檢查：
- bundle size 是否過大
- 各頁面 First Load JS 是否合理（< 200KB 為佳）
- 用 `@next/bundle-analyzer` 找出可優化的依賴

---

### 階段 5：測試與上線（第 3 天）

#### 6.13 跨裝置測試

**iOS Safari**：
- 加到主畫面後可開啟
- 全螢幕模式正常
- 離線可使用
- 手勢操作正常

**Android Chrome**：
- 安裝提示正常顯示
- 安裝後有獨立圖示
- 離線可使用

**桌面 Chrome**：
- 可從網址列右側「安裝」按鈕安裝
- 安裝後成為獨立視窗
- 桌面有圖示

**飛航模式測試**：
- 開啟 APP 看到已下載的單字
- 答題能暫存
- 恢復網路後自動同步

#### 6.14 Lighthouse 完整檢測

在 Chrome DevTools → Lighthouse：
- Mobile 模式檢測
- 5 個分類全跑
- 對照目標分數
- 處理紅色警告與部分黃色警告

#### 6.15 正式上線檢查

- [ ] 所有環境變數在 Vercel 設定完成
- [ ] domain（若有自訂）DNS 設定正確
- [ ] Supabase RLS 全部生效
- [ ] 老師帳號可正常使用所有功能
- [ ] 學生試用帳號可正常使用所有功能
- [ ] PWA 安裝流程順暢
- [ ] 離線體驗正常

#### 6.16 產出交付文件

建立 `README.md` 與使用說明：

**README.md**：
- 專案介紹
- 技術棧
- 如何啟動本地開發
- 如何部署
- 環境變數說明

**`使用手冊_老師版.md`**：
- 如何登入
- 如何邀請學生
- 如何新增教材
- 如何批次匯入單字
- 如何派發課程包

**`使用手冊_學生版.md`**：
- 如何接受邀請、設定密碼
- 如何加到主畫面
- 如何使用單字卡
- 如何做測驗
- 如何離線學習

---

## 📋 F — Format（格式要求）

### 測試格式
- 每階段結束實際在裝置上測試
- 截圖 Lighthouse 評分結果
- 列出所有測試裝置與瀏覽器

### 文件格式
- README 用標準 Markdown 結構
- 使用手冊配合截圖（可用佔位符後續補圖）
- 所有指令用 code block

### 程式碼品質
- Service Worker 邏輯有清楚註解
- 離線同步邏輯有錯誤處理
- 所有 async 函數有 try-catch

---

## ✅ T — Task（任務驗收）

- [ ] **6.1-6.4** PWA 基本設定完成（manifest、圖示、meta）
- [ ] **6.5** Service Worker 各種快取策略生效
- [ ] **6.6-6.7** IndexedDB 預下載機制正常
- [ ] **6.8** 離線答題能暫存並自動同步
- [ ] **6.9** Android 與 iOS 都能看到加到主畫面的引導
- [ ] **6.10** iOS splash screen 正常顯示
- [ ] **6.11** Lighthouse 評分達標：
  - [ ] Performance ≥ 80
  - [ ] Accessibility ≥ 90
  - [ ] Best Practices ≥ 90
  - [ ] SEO ≥ 90
  - [ ] PWA ≥ 90
- [ ] **6.13** 跨平台測試（iOS / Android / 桌面）通過
- [ ] **6.14** 飛航模式測試通過：
  - [ ] 已下載單字可學習
  - [ ] 答題可暫存
  - [ ] 恢復網路自動同步
- [ ] **6.15** 正式上線檢查清單全部完成
- [ ] **6.16** 三份文件產出：README、老師手冊、學生手冊
- [ ] **整體**：邀請 1-2 位真實學生試用，可順利完成註冊→學習→測驗全流程
- [ ] **產出**：`Phase1_最終完成報告.md`

---

## 🎉 Phase 1 完成後

當 WP6 完成，**Phase 1 MVP 即正式上線**！

下一步可選擇：
1. **暫停一週**收集學生使用回饋
2. **開始 Phase 2**：五十音、漢字筆順、聽力擴充
3. **跳到 Phase 3**：作業派發系統（若覺得管理多學生急迫）

我會根據用戶選擇，進入下一階段的 SW 雙軌規劃。

---

## 🚧 注意事項

1. **iOS PWA 限制**：iOS 對 PWA 支援不如 Android 完整，某些功能（推播）要等 Phase 3
2. **Service Worker 更新**：開發時要定期清快取避免看到舊版本
3. **IndexedDB 配額**：瀏覽器有空間限制，定期清理過期資料
4. **網域設定**：若未來換自訂網域，記得更新 manifest.json 與 Supabase 允許的 redirect URL

---

> WP6 Prompt 版本：v1.0
