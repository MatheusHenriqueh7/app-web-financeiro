-- ============================================================
-- Fase 3: Parcelamento automático
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS installment_group_id UUID,
  ADD COLUMN IF NOT EXISTS installment_index    INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS installment_count    INT NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_expenses_installment_group
  ON public.expenses(installment_group_id)
  WHERE installment_group_id IS NOT NULL;
