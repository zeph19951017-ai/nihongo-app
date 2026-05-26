-- =============================================
-- 01：啟用擴充套件 + 建立共用 helper 函數
-- 請在 Supabase SQL Editor 最先執行此檔
-- =============================================

-- 啟用 uuid 產生器（Supabase 通常已預設啟用）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 建立自動更新 updated_at 的觸發函數
-- 每次 UPDATE 時會自動把 updated_at 設為目前時間
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
