-- =============================================
-- 03：建立 vocabulary 單字表
-- =============================================

CREATE TABLE public.vocabulary (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 假名（必填）
  kana text NOT NULL,
  -- 漢字（選填）
  kanji text,
  -- 中文意思（必填）
  meaning text NOT NULL,
  -- 日文例句（選填）
  example_jp text,
  -- 例句中譯（選填）
  example_zh text,
  -- 音檔網址，老師上傳後儲存此 URL（選填）
  audio_url text,
  -- 難度等級：N5（最簡單）到 N1（最難）
  difficulty text CHECK (difficulty IN ('N5', 'N4', 'N3', 'N2', 'N1')),
  -- 建立者（老師 id）
  created_by uuid NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- 加速依難度篩選
CREATE INDEX idx_vocabulary_difficulty ON public.vocabulary(difficulty);
-- 加速依建立者查詢
CREATE INDEX idx_vocabulary_created_by ON public.vocabulary(created_by);
-- 加速假名搜尋
CREATE INDEX idx_vocabulary_kana ON public.vocabulary(kana);

ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;
