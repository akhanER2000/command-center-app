'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      if (data.session) {
        // Auto-login successful (Email Confirmations are OFF in Supabase)
        router.push('/dashboard')
      } else {
        // Needs email verification
        setSuccess(true)
        setLoading(false)
      }
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="w-full max-w-md space-y-8 glass rounded-3xl p-10 text-center relative z-10 shadow-2xl">
          <h1 className="text-3xl font-black tracking-tighter gradient-text">¡Revisa tu bandeja!</h1>
          <p className="text-muted-foreground font-medium mt-2">
            Hemos enviado un correo de confirmación a <strong className="text-foreground">{email}</strong>.
            Por favor, revisa tu bandeja de entrada o spam.
          </p>
          <Link href="/login" className="btn btn-primary w-full mt-6 py-4">
            Ir a Iniciar Sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Absolute background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-8 glass rounded-3xl p-10 relative z-10 shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tighter gradient-text">Registro</h1>
          <p className="text-muted-foreground font-medium">Comienza a organizar tu trabajo hoy</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Nombre Completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl border border-border bg-background/50 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
              placeholder="Juan Pérez"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl border border-border bg-background/50 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
              placeholder="tu@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl border border-border bg-background/50 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          {error && <p className="text-destructive text-sm font-semibold">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-4 text-base"
          >
            {loading ? 'Preparando Command...' : 'Crear Cuenta'}
          </button>
        </form>

        <p className="text-center text-sm font-medium text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-primary hover:text-accent transition-colors font-bold underline-offset-4 hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  )
}

