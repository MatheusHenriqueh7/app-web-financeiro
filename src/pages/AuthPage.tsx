import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Wallet } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useTheme } from '../contexts/ThemeContext'
import { Moon, Sun } from 'lucide-react'

const loginSchema = z.object({
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const signupSchema = loginSchema.extend({
  name:            z.string().min(2, 'Nome obrigatório'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

type LoginData  = z.infer<typeof loginSchema>
type SignupData = z.infer<typeof signupSchema>

export function AuthPage() {
  const [mode, setMode]   = useState<'login' | 'signup'>('login')
  const [serverError, setServerError] = useState('')
  const { signIn, signUp } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) })
  const signupForm = useForm<SignupData>({ resolver: zodResolver(signupSchema) })

  const handleLogin = async (data: LoginData) => {
    setServerError('')
    const { error } = await signIn(data.email, data.password)
    if (error) setServerError('E-mail ou senha incorretos')
  }

  const handleSignup = async (data: SignupData) => {
    setServerError('')
    const { error } = await signUp(data.email, data.password, data.name)
    if (error) setServerError(error.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800 transition-colors"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-600 items-center justify-center mb-4">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financeiro</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Controle financeiro pessoal
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          {/* Tab toggle */}
          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 mb-6">
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setServerError('') }}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                  mode === m
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {m === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>

          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                error={loginForm.formState.errors.email?.message}
                {...loginForm.register('email')}
              />
              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                error={loginForm.formState.errors.password?.message}
                {...loginForm.register('password')}
              />
              <Button
                type="submit"
                className="w-full mt-2"
                loading={loginForm.formState.isSubmitting}
                size="lg"
              >
                Entrar
              </Button>
            </form>
          ) : (
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
              <Input
                label="Nome"
                placeholder="Seu nome"
                error={signupForm.formState.errors.name?.message}
                {...signupForm.register('name')}
              />
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                error={signupForm.formState.errors.email?.message}
                {...signupForm.register('email')}
              />
              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                error={signupForm.formState.errors.password?.message}
                {...signupForm.register('password')}
              />
              <Input
                label="Confirmar senha"
                type="password"
                placeholder="••••••••"
                error={signupForm.formState.errors.confirmPassword?.message}
                {...signupForm.register('confirmPassword')}
              />
              <Button
                type="submit"
                className="w-full mt-2"
                loading={signupForm.formState.isSubmitting}
                size="lg"
              >
                Criar conta
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          Seus dados são criptografados e seguros
        </p>
      </div>
    </div>
  )
}
