-- Phase 2: Category limits + Recurring expenses

CREATE TABLE IF NOT EXISTS public.category_limits (
  id            uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid          REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name          text          NOT NULL,
  icon          text          NOT NULL DEFAULT '📦',
  color         text          NOT NULL DEFAULT '#6b7280',
  monthly_limit numeric(12,2) NOT NULL DEFAULT 0,
  is_custom     boolean       NOT NULL DEFAULT false,
  sort_order    integer       NOT NULL DEFAULT 0,
  created_at    timestamptz   DEFAULT now() NOT NULL,
  updated_at    timestamptz   DEFAULT now() NOT NULL,
  UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS public.recurring_expenses (
  id             uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid          REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description    text          NOT NULL,
  amount         numeric(12,2) NOT NULL,
  category       text          NOT NULL,
  payment_method text          NOT NULL,
  active         boolean       NOT NULL DEFAULT true,
  created_at     timestamptz   DEFAULT now() NOT NULL,
  updated_at     timestamptz   DEFAULT now() NOT NULL
);

ALTER TABLE public.category_limits    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own category_limits"
  ON public.category_limits FOR ALL TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users manage own recurring_expenses"
  ON public.recurring_expenses FOR ALL TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
