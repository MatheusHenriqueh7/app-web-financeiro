import { NavLink } from 'react-router-dom'
import { Moon, Sun, LayoutDashboard, ListChecks, Tags, Settings, LogOut, Wallet } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { useProfile } from '../../hooks/useProfile'

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { signOut } = useAuth()
  const { profile } = useProfile()

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <Wallet className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-sm">Financeiro</span>
        </div>

        {/* Desktop: greeting */}
        <div className="hidden md:block">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Olá, <span className="font-semibold text-gray-900 dark:text-white">{profile?.name ?? 'bem-vindo'}</span>
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5 w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex md:hidden border-t border-gray-100 dark:border-gray-800">
        {[
          { to: '/',           icon: LayoutDashboard, label: 'Dashboard'  },
          { to: '/expenses',   icon: ListChecks,      label: 'Gastos'     },
          { to: '/categories', icon: Tags,            label: 'Categorias' },
          { to: '/settings',   icon: Settings,        label: 'Ajustes'    },
        ].map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
        <button
          onClick={signOut}
          className="flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium text-gray-500 dark:text-gray-400"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </nav>
    </header>
  )
}
