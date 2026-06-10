import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ListChecks, Settings, LogOut, Wallet } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { to: '/',         label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/expenses', label: 'Gastos',     icon: ListChecks },
  { to: '/settings', label: 'Ajustes',    icon: Settings },
]

export function Sidebar() {
  const { signOut } = useAuth()

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <Wallet className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white text-base">Financeiro</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              }`
            }
          >
            <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-gray-100 dark:border-gray-800 pt-4">
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sair
        </button>
      </div>
    </aside>
  )
}
