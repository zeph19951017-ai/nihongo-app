-- =============================================
-- 02：建立 users 使用者表
-- 與 Supabase auth.users 連動（1對1）
-- =============================================

CREATE TABLE public.users (
  -- 主鍵與 auth.users 相同，刪除帳號時一併刪除
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- 電子郵件（唯一）
  email text UNIQUE NOT NULL,
  -- 顯示名稱
  name text NOT NULL,
  -- 角色：teacher（老師）或 student（學生）
  role text NOT NULL CHECK (role IN ('teacher', 'student')) DEFAULT 'student',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 自動更新 updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 加速依 email 查詢
CREATE INDEX idx_users_email ON public.users(email);
-- 加速依角色篩選
CREATE INDEX idx_users_role ON public.users(role);

-- 開啟 RLS（Row Level Security）
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 自動建立 public.users 的觸發函數
-- 當 auth.users 新增使用者時，自動同步到 public.users
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 每次 auth.users 新增時觸發
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
