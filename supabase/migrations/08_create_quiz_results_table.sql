-- =============================================
-- 08：建立 quiz_results 答題紀錄表
-- 記錄每次測驗的每道題答題結果
-- =============================================

CREATE TABLE public.quiz_results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 答題的學生 id
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  -- 對應的題目 id
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  -- 是否答對
  is_correct boolean NOT NULL,
  -- 學生的作答內容
  user_answer text NOT NULL,
  -- 作答時間
  answered_at timestamptz DEFAULT now(),
  -- 同一次測驗的 session id（用來把同一次測驗的題目歸在一起）
  session_id uuid NOT NULL DEFAULT uuid_generate_v4()
);

-- 加速依學生查詢答題紀錄
CREATE INDEX idx_quiz_results_user_id ON public.quiz_results(user_id);
-- 加速依 session 查詢同一次測驗
CREATE INDEX idx_quiz_results_session_id ON public.quiz_results(session_id);
-- 加速查詢錯題（is_correct = false）
CREATE INDEX idx_quiz_results_incorrect ON public.quiz_results(user_id, is_correct) WHERE is_correct = false;

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
