-- =============================================
-- 06：建立 lesson_packs 課程包表
-- 將單字、文法、題目打包成一個課程包
-- =============================================

CREATE TABLE public.lesson_packs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 課程包名稱（例：第一課、N5 基礎單字）
  name text NOT NULL,
  -- 課程包說明（選填）
  description text,
  -- 包含的單字 ID 陣列
  vocab_ids uuid[] DEFAULT '{}',
  -- 包含的文法 ID 陣列
  grammar_ids uuid[] DEFAULT '{}',
  -- 包含的題目 ID 陣列
  question_ids uuid[] DEFAULT '{}',
  -- 建立者（老師 id）
  created_by uuid NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- 加速依建立者查詢
CREATE INDEX idx_lesson_packs_created_by ON public.lesson_packs(created_by);

ALTER TABLE public.lesson_packs ENABLE ROW LEVEL SECURITY;
