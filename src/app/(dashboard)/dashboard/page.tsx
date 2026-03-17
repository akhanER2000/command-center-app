import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/DashboardCards'
import { ActivityFeed } from '@/components/ActivityFeed'
import { PomodoroTimer } from '@/components/PomodoroTimer'
import { CheckCircle2, Clock, Target, Zap } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch some basic stats (mocked for now until DB has data)
  const stats = [
    { label: 'Proyectos Activos', value: '12', icon: <Target className="text-blue-500" />, trend: '+2 this month' },
    { label: 'Tareas Completadas', value: '148', icon: <CheckCircle2 className="text-green-500" />, trend: '+24% total' },
    { label: 'Horas Enfocado', value: '42.5', icon: <Clock className="text-orange-500" />, trend: '+5.2h this week' },
    { label: 'Productividad', value: '92%', icon: <Zap className="text-yellow-500" />, trend: 'Top 5% of users' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido de nuevo, aquí está tu resumen de hoy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-6 min-h-[300px] flex items-center justify-center border-dashed border-2">
            <div className="text-center text-muted-foreground">
              <p>Gráfico de Actividad Semanal</p>
              <p className="text-sm">Conecta Supabase para ver datos reales</p>
            </div>
          </div>
          
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Actividad Reciente</h2>
            <ActivityFeed />
          </div>
        </div>

        <div className="space-y-8">
          <div className="card p-6 bg-primary text-primary-foreground overflow-hidden relative">
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-2">Timer Pomodoro</h2>
              <PomodoroTimer compact />
            </div>
            {/* Subtle background decoration */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Proyectos Próximos</h2>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay proyectos con entrega próxima.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
