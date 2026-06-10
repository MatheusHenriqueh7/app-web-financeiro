import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ReactNode } from 'react'
import { User, DollarSign, Palette } from 'lucide-react'
import { useProfile } from '../hooks/useProfile'
import { useTheme } from '../contexts/ThemeContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

const schema = z.object({
  name:           z.string().min(2, 'Nome obrigatório'),
  monthly_income: z.string().min(1, 'Informe sua renda'),
})
type FormFields = z.infer<typeof schema>

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 dark:border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
          {icon}
        </div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export function SettingsPage() {
  const { profile, loading, updateProfile } = useProfile()
  const { theme, toggleTheme } = useTheme()
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', monthly_income: '0' },
  })

  useEffect(() => {
    if (profile) {
      reset({
        name:           profile.name ?? '',
        monthly_income: String(profile.monthly_income ?? 0),
      })
    }
  }, [profile, reset])

  const onSubmit = async (fields: FormFields) => {
    const monthly_income = parseFloat(fields.monthly_income.replace(',', '.')) || 0
    const { error } = await updateProfile({ name: fields.name, monthly_income })
    if (!error) {
      setSaved(true)
      reset(fields)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <div className="space-y-5 max-w-lg">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ajustes</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Personalize sua conta</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Section icon={<User className="w-4 h-4" />} title="Perfil">
          <Input
            label="Nome"
            placeholder="Seu nome"
            disabled={loading}
            error={errors.name?.message}
            {...register('name')}
          />
        </Section>

        <Section icon={<DollarSign className="w-4 h-4" />} title="Finanças">
          <div className="space-y-3">
            <Input
              label="Renda mensal (R$)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              disabled={loading}
              error={errors.monthly_income?.message}
              {...register('monthly_income')}
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Usada para calcular o saldo disponível no dashboard.
            </p>
          </div>
        </Section>

        {saved && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
            <p className="text-sm text-emerald-700 dark:text-emerald-400">Configurações salvas!</p>
          </div>
        )}

        <Button
          type="submit"
          loading={isSubmitting}
          disabled={!isDirty}
          className="w-full"
          size="lg"
        >
          Salvar alterações
        </Button>
      </form>

      <Section icon={<Palette className="w-4 h-4" />} title="Aparência">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tema</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Atualmente: {theme === 'dark' ? 'Escuro' : 'Claro'}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              theme === 'dark' ? 'bg-brand-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </Section>
    </div>
  )
}
