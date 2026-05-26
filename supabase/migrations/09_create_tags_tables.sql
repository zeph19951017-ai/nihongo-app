-- =============================================
-- 09：建立 tags 標籤表 + 兩張多對多關聯表
-- =============================================

-- 標籤主表
CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 標籤名稱（例：N5、會話、商業、旅遊）
  name text NOT NULL UNIQUE,
  -- 標籤類型：level（程度）或 topic（主題）
  type text NOT NULL CHECK (type IN ('level', 'topic')),
  -- 顯示顏色（hex 色碼，例：#FF5733）
  color text,
  created_at timestamptz DEFAULT now()
);

-- 單字與標籤的多對多關聯
CREATE TABLE public.vocabulary_tags (
  vocab_id uuid NOT NULL REFERENCES public.vocabulary(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (vocab_id, tag_id)
);

-- 文法與標籤的多對多關聯
CREATE TABLE public.grammar_tags (
  grammar_id uuid NOT NULL REFERENCES public.grammar(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (grammar_id, tag_id)
);

-- 加速依標籤查詢單字
CREATE INDEX idx_vocabulary_tags_tag_id ON public.vocabulary_tags(tag_id);
-- 加速依標籤查詢文法
CREATE INDEX idx_grammar_tags_tag_id ON public.grammar_tags(tag_id);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grammar_tags ENABLE ROW LEVEL SECURITY;

-- 預設插入幾個常用標籤
INSERT INTO public.tags (name, type, color) VALUES
  ('N5', 'level', '#4CAF50'),
  ('N4', 'level', '#2196F3'),
  ('N3', 'level', '#FF9800'),
  ('N2', 'level', '#F44336'),
  ('N1', 'level', '#9C27B0'),
  ('會話', 'topic', '#00BCD4'),
  ('商業', 'topic', '#607D8B'),
  ('旅遊', 'topic', '#FF5722'),
  ('日常生活', 'topic', '#8BC34A');
