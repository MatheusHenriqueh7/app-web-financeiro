import { TrendingDown, TrendingUp, Wallet, CreditCard, RefreshCw } from 'lucide-react'

interface Props {
  totalSpent: number
  income: number
  expenseCount: number
  creditTotal: number
  totalFixed: number
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface CardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  colorClass: string
}

function Card({ title, value, subtitle, icon, colorClass }: CardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export function StatsCards({ totalSpent, income, expenseCount, creditTotal, totalFixed }: Props) {
  const balance    = income - totalSpent
  const isPositive = balance >= 0
  const spentPct   = income > 0 ? Math.min((totalSpent / income) * 100, 100) : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        title="Total gasto"
        value={formatCurrency(totalSpent)}
        subtitle={`${expenseCount} transaç${expenseCount === 1 ? 'ão' : 'ões'} no mês`}
        icon={<TrendingDown className="w-5 h-5 text-rose-600" />}
        colorClass="bg-rose-50 dark:bg-rose-900/20"
      />
      <Card
        title="Renda mensal"
        value={formatCurrency(income)}
        subtitle={`${spentPct.toFixed(0)}% utilizado`}
        icon={<Wallet className="w-5 h-5 text-brand-600" />}
        colorClass="bg-brand-50 dark:bg-brand-900/20"
      />
      <Card
        title="Saldo disponível"
        value={formatCurrency(Math.abs(balance))}
        subtitle={isPositive ? 'Dentro do orçamento' : 'Acima do orçamento'}
        icon={<TrendingUp className={`w-5 h-5 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`} />}
        colorClass={isPositive ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/20'}
      />
      <Card
        title="Fatura crédito"
        value={formatCurrency(creditTotal)}
        subtitle={totalFixed > 0 ? `Fixos: ${formatCurrency(totalFixed)}/mês` : 'Gastos no crédito'}
        icon={<CreditCard className="w-5 h-5 text-violet-600" />}
        colorClass="bg-violet-50 dark:bg-violet-900/20"
      />
    </div>
  )
}

export function FixedExpensesBanner({ totalFixed }: { totalFixed: number }) {
  if (totalFixed === 0) return null
  return (
    <div className="flex items-center gap-2.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl px-4 py-2.5">
      <RefreshCw className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
      <p className="text-xs text-indigo-700 dark:text-indigo-300">
        <span className="font-semibold">
          {totalFixed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
        {' '}em gastos fixos mensais recorrentes
      </p>
    </div>
  )
}
