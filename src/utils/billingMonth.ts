import type { PaymentMethod } from '../types'

export interface YearMonth {
  year: number
  month: number // 1-12
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function shiftMonths(year: number, month: number, delta: number): YearMonth {
  const total = year * 12 + (month - 1) + delta
  return { year: Math.floor(total / 12), month: (total % 12) + 1 }
}

/**
 * Cartões fecham no último dia do mês. Compra nos dias 1-29 cai na fatura do
 * mês seguinte; compra no último dia do mês (30 ou 31) já perde a fatura
 * seguinte e cai dois meses depois. Métodos que não são crédito contam no
 * próprio mês da compra.
 */
export function getBillingMonth(dateStr: string, paymentMethod: PaymentMethod): YearMonth {
  const [year, month, day] = dateStr.split('-').map(Number)
  if (paymentMethod !== 'Crédito') return { year, month }
  const shift = day === daysInMonth(year, month) ? 2 : 1
  return shiftMonths(year, month, shift)
}

/**
 * Intervalo de datas de compra que pode conter gastos cuja fatura caia no mês
 * (year, month): o próprio mês (débito/pix) mais os dois meses anteriores
 * (crédito com shift de 1 ou 2 meses).
 */
export function getPurchaseDateRangeForBillingMonth(year: number, month: number) {
  const start = shiftMonths(year, month, -2)
  const startDate = `${start.year}-${String(start.month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]
  return { startDate, endDate }
}

export function isSameYearMonth(a: YearMonth, year: number, month: number): boolean {
  return a.year === year && a.month === month
}
