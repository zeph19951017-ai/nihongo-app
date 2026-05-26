-- =============================================
-- 04：建立 grammar 文法句型表
-- =============================================

CREATE TABLE public.grammar (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 句型（例：〜ている、〜たい）
  pattern text NOT NULL,
  -- 文法解說（中文）
  explanation text NOT NULL,
  -- 例句陣列，每筆格式：{"jp": "日文", "zh": "中譯"}
  examples jsonb DEFAULT '[]'::jsonb,
  -- 難度等級
  difficulty text CHECK (difficulty IN ('N5', 'N4', 'N3', 'N2', 'N1')),
  -- 建立者（老師 id）
  created_by uuid NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- 加速依難度篩選
CREATE INDEX idx_grammar_difficulty ON public.grammar(difficulty);
-- 加速依建立者查詢
CREATE INDEX idx_grammar_created_by ON public.grammar(created_by);

ALTER TABLE public.grammar ENABLE ROW LEVEL SECURITY;
