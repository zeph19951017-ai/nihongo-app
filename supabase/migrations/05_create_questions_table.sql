-- =============================================
-- 05：建立 questions 題庫表
-- =============================================

CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 題目類型：選擇題 / 填空題 / 配對題
  type text NOT NULL CHECK (type IN ('multiple_choice', 'fill_blank', 'matching')),
  -- 題目敘述
  question text NOT NULL,
  -- 選擇題選項（JSON 陣列，例：["A", "B", "C", "D"]）
  -- fill_blank 和 matching 可為 null
  options jsonb,
  -- 正確答案
  correct_answer text NOT NULL,
  -- 關聯的單字（選填）
  related_vocab_id uuid REFERENCES public.vocabulary(id) ON DELETE SET NULL,
  -- 關聯的文法（選填）
  related_grammar_id uuid REFERENCES public.grammar(id) ON DELETE SET NULL,
  -- 難度等級
  difficulty text CHECK (difficulty IN ('N5', 'N4', 'N3', 'N2', 'N1')),
  -- 建立者（老師 id）
  created_by uuid NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- 加速依類型篩選
CREATE INDEX idx_questions_type ON public.questions(type);
-- 加速依難度篩選
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);
-- 加速依關聯單字查詢
CREATE INDEX idx_questions_vocab_id ON public.questions(related_vocab_id);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
