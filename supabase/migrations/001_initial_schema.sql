-- ============================================================
-- Financeiro App — Schema Inicial
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- Tabela de perfis dos usuários
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  name          TEXT,
  monthly_income DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de gastos
CREATE TABLE IF NOT EXISTS public.expenses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description    TEXT NOT NULL,
  amount         DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  category       TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  date           DATE NOT NULL,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date     ON public.expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, date DESC);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses  ENABLE ROW LEVEL SECURITY;

-- Profiles: usuário só acessa seu próprio perfil
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Expenses: usuário só acessa seus próprios gastos
CREATE POLICY "expenses_select_own" ON public.expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "expenses_insert_own" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "expenses_update_own" ON public.expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "expenses_delete_own" ON public.expenses
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Trigger: cria perfil automaticamente ao cadastrar usuário
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Trigger: atualiza updated_at automaticamente
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
