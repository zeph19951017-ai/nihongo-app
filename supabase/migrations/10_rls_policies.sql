-- =============================================
-- 10：設定 Row Level Security (RLS) 權限規則
-- 確保學生只能看到自己的資料，老師可管理所有教材
-- 設計原則：先用 helper function 取得當前使用者的 role
-- =============================================

-- Helper：取得當前使用者的 role（teacher / student）
-- 使用 SECURITY DEFINER 讓此函數能讀取 users 表（即使 RLS 開啟）
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================
-- users 表
-- =============================================
-- 使用者可讀取自己的資料
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (id = auth.uid());

-- 老師可讀取所有使用者（查看學生列表用）
CREATE POLICY "teacher_select_all_users" ON public.users
  FOR SELECT USING (public.get_user_role() = 'teacher');

-- 使用者可更新自己的資料（name 等）
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- =============================================
-- vocabulary 單字表
-- =============================================
-- 所有登入使用者可讀取單字
CREATE POLICY "all_select_vocabulary" ON public.vocabulary
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 只有老師可新增單字
CREATE POLICY "teacher_insert_vocabulary" ON public.vocabulary
  FOR INSERT WITH CHECK (public.get_user_role() = 'teacher');

-- 只有老師可更新單字
CREATE POLICY "teacher_update_vocabulary" ON public.vocabulary
  FOR UPDATE USING (public.get_user_role() = 'teacher');

-- 只有老師可刪除單字
CREATE POLICY "teacher_delete_vocabulary" ON public.vocabulary
  FOR DELETE USING (public.get_user_role() = 'teacher');

-- =============================================
-- grammar 文法表
-- =============================================
CREATE POLICY "all_select_grammar" ON public.grammar
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "teacher_insert_grammar" ON public.grammar
  FOR INSERT WITH CHECK (public.get_user_role() = 'teacher');

CREATE POLICY "teacher_update_grammar" ON public.grammar
  FOR UPDATE USING (public.get_user_role() = 'teacher');

CREATE POLICY "teacher_delete_grammar" ON public.grammar
  FOR DELETE USING (public.get_user_role() = 'teacher');

-- =============================================
-- questions 題庫表
-- =============================================
CREATE POLICY "all_select_questions" ON public.questions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "teacher_insert_questions" ON public.questions
  FOR INSERT WITH CHECK (public.get_user_role() = 'teacher');

CREATE POLICY "teacher_update_questions" ON public.questions
  FOR UPDATE USING (public.get_user_role() = 'teacher');

CREATE POLICY "teacher_delete_questions" ON public.questions
  FOR DELETE USING (public.get_user_role() = 'teacher');

-- =============================================
-- lesson_packs 課程包表
-- =============================================
CREATE POLICY "all_select_lesson_packs" ON public.lesson_packs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "teacher_insert_lesson_packs" ON public.lesson_packs
  FOR INSERT WITH CHECK (public.get_user_role() = 'teacher');

CREATE POLICY "teacher_update_lesson_packs" ON public.lesson_packs
  FOR UPDATE USING (public.get_user_role() = 'teacher');

CREATE POLICY "teacher_delete_lesson_packs" ON public.lesson_packs
  FOR DELETE USING (public.get_user_role() = 'teacher');

-- =============================================
-- study_progress 學習進度表
-- =============================================
-- 學生只能讀取自己的進度
CREATE POLICY "student_select_own_progress" ON public.study_progress
  FOR SELECT USING (user_id = auth.uid());

-- 老師可讀取所有學生的進度（查看學生學習狀況用）
CREATE POLICY "teacher_select_all_progress" ON public.study_progress
  FOR SELECT USING (public.get_user_role() = 'teacher');

-- 學生可新增自己的進度
CREATE POLICY "student_insert_own_progress" ON public.study_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 學生可更新自己的進度
CREATE POLICY "student_update_own_progress" ON public.study_progress
  FOR UPDATE USING (user_id = auth.uid());

-- =============================================
-- quiz_results 答題紀錄表
-- =============================================
-- 學生只能讀取自己的答題紀錄
CREATE POLICY "student_select_own_results" ON public.quiz_results
  FOR SELECT USING (user_id = auth.uid());

-- 老師可讀取所有學生的答題紀錄
CREATE POLICY "teacher_select_all_results" ON public.quiz_results
  FOR SELECT USING (public.get_user_role() = 'teacher');

-- 學生可新增自己的答題紀錄
CREATE POLICY "student_insert_own_results" ON public.quiz_results
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- =============================================
-- tags 標籤表（所有登入使用者可讀，只有老師可寫）
-- =============================================
CREATE POLICY "all_select_tags" ON public.tags
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "teacher_insert_tags" ON public.tags
  FOR INSERT WITH CHECK (public.get_user_role() = 'teacher');

CREATE POLICY "teacher_update_tags" ON public.tags
  FOR UPDATE USING (public.get_user_role() = 'teacher');

CREATE POLICY "teacher_delete_tags" ON public.tags
  FOR DELETE USING (public.get_user_role() = 'teacher');

-- =============================================
-- vocabulary_tags 關聯表
-- =============================================
CREATE POLICY "all_select_vocabulary_tags" ON public.vocabulary_tags
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "teacher_modify_vocabulary_tags" ON public.vocabulary_tags
  FOR ALL USING (public.get_user_role() = 'teacher');

-- =============================================
-- grammar_tags 關聯表
-- =============================================
CREATE POLICY "all_select_grammar_tags" ON public.grammar_tags
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "teacher_modify_grammar_tags" ON public.grammar_tags
  FOR ALL USING (public.get_user_role() = 'teacher');
