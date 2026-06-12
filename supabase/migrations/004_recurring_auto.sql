-- ============================================================
-- Fase 4: Lançamento automático de gastos fixos recorrentes
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS recurring_expense_id UUID REFERENCES public.recurring_expenses(id) ON DELETE SET NULL;

-- Garante que cada gasto fixo seja lançado no máximo uma vez por data (evita duplicação em race conditions)
CREATE UNIQUE INDEX IF NOT EXISTS idx_expenses_recurring_unique
  ON public.expenses(recurring_expense_id, date)
  WHERE recurring_expense_id IS NOT NULL;
