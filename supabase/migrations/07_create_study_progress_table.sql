-- =============================================
-- 07：建立 study_progress 學習進度表
-- 記錄每位學生對每個單字的熟悉度（間隔複習用）
-- =============================================

CREATE TABLE public.study_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 學生 id
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  -- 單字 id
  vocab_id uuid NOT NULL REFERENCES public.vocabulary(id) ON DELETE CASCADE,
  -- 熟悉度：0（未學）→ 5（完全熟悉）
  familiarity_level int NOT NULL DEFAULT 0 CHECK (familiarity_level BETWEEN 0 AND 5),
  -- 下次複習時間（間隔複習演算法計算）
  next_review_at timestamptz DEFAULT now(),
  -- 累計複習次數
  review_count int NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  -- 同一學生對同一單字只有一筆進度紀錄
  UNIQUE(user_id, vocab_id)
);

-- 自動更新 updated_at
CREATE TRIGGER update_study_progress_updated_at
  BEFORE UPDATE ON public.study_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 加速依學生查詢進度
CREATE INDEX idx_study_progress_user_id ON public.study_progress(user_id);
-- 加速查詢待複習的單字（next_review_at <= now()）
CREATE INDEX idx_study_progress_next_review ON public.study_progress(user_id, next_review_at);

ALTER TABLE public.study_progress ENABLE ROW LEVEL SECURITY;
