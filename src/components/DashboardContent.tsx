'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { Card } from '@/components/DashboardCards'
import { ActivityFeed } from '@/components/ActivityFeed'
import { PomodoroTimer } from '@/components/PomodoroTimer'
import { CheckCircle2, Clock, Target, StickyNote, AlertCircle } from 'lucide-react'
import { startOfDay, startOfWeek, subDays, isAfter, isBefore, format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Project } from '@/types/database'

export function DashboardContent() {
  const { profileName, projects, tasks, pomodoros, notes } = useStore()
  const [filter, setFilter] = useState<'Semana' | 'Mes' | 'Todo'>('Semana')

  // Saludo contextual
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 19) return 'Buenas tardes'
    return 'Buenas noches'
  }, [])

  const nameToDisplay = profileName?.split(' ')[0] || 'Usuario'

  // Calculo de KPIs
  const kpis = useMemo(() => {
    const now = new Date()
    const today = startOfDay(now)
    const yesterday = subDays(today, 1)
    const thisWeek = startOfWeek(now, { weekStartsOn: 1 })
    const lastWeek = subDays(thisWeek, 7)

    // Proyectos activos
    const activeProjects = projects.filter(p => p.status !== 'completado' && p.status !== 'pausado').length

    // Tareas completadas hoy vs ayer
    const tasksToday = tasks.filter(t => t.is_completed && t.completed_at && isAfter(new Date(t.completed_at), today)).length
    const tasksYesterday = tasks.filter(t => t.is_completed && t.completed_at && isAfter(new Date(t.completed_at), yesterday) && isBefore(new Date(t.completed_at), today)).length
    const taskTrend = tasksYesterday === 0 ? (tasksToday > 0 ? '+100%' : '—') : `${((tasksToday - tasksYesterday) / tasksYesterday * 100).toFixed(1)}%`

    // Horas de foco (pomodoros)
    const focusTotalSeconds = pomodoros.filter(p => filter === 'Todo' ? true : 
      isAfter(new Date(p.start_time!), filter === 'Semana' ? thisWeek : subDays(today, 30))
    ).reduce((acc, p) => acc + p.duration, 0)
    const focusHours = (focusTotalSeconds / 3600).toFixed(1)

    // Notas creadas esta semana
    const notesThisWeek = notes.filter(n => n.created_at && isAfter(new Date(n.created_at), thisWeek)).length

    return [
      { label: 'Proyectos Activos', value: activeProjects.toString(), icon: <Target className="text-blue-500" /> },
      { label: 'Tareas Completadas Hoy', value: tasksToday.toString(), icon: <CheckCircle2 className="text-green-500" />, trend: taskTrend },
      { label: 'Horas Foco (' + filter + ')', value: focusHours, icon: <Clock className="text-orange-500" /> },
      { label: 'Notas Esta Semana', value: notesThisWeek.toString(), icon: <StickyNote className="text-yellow-500" /> },
    ]
  }, [projects, tasks, pomodoros, notes, filter])

  // Gráfico semanal
  const chartData = useMemo(() => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i)
      const dateStart = startOfDay(d)
      const dateEnd = startOfDay(subDays(d, -1))
      
      const counts = tasks.filter(t => t.is_completed && t.completed_at && isAfter(new Date(t.completed_at), dateStart) && isBefore(new Date(t.completed_at), dateEnd)).length
      
      data.push({
        name: format(d, 'EEE', { locale: es }),
        completadas: counts
      })
    }
    return data
  }, [tasks])

  // Proyectos críticos
  const criticalProjects = useMemo(() => {
    const inThreeDays = subDays(new Date(), -3)
    return projects
      .filter(p => p.status !== 'completado' && p.deadline && isBefore(new Date(p.deadline), inThreeDays))
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
  }, [projects])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter gradient-text">{greeting}, {nameToDisplay}</h1>
          <p className="text-muted-foreground mt-1">Aquí está tu resumen de productividad.</p>
        </div>
        <div className="flex gap-2">
          {['Semana', 'Mes', 'Todo'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === f ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((stat, i) => (
          <Card key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="card-premium min-h-[400px]">
            <h2 className="text-xl font-bold tracking-tight mb-6">Actividad Semanal</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'var(--color-muted)' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)' }}
                  />
                  <Bar dataKey="completadas" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card-premium">
            <h2 className="text-xl font-bold tracking-tight mb-6">Actividad Reciente</h2>
            <ActivityFeed />
          </div>
        </div>

        <div className="space-y-8">
          <div className="card-premium p-0 overflow-hidden relative border-none bg-gradient-to-br from-primary/90 to-accent/90">
            <div className="p-6 relative z-10 text-white">
              <h2 className="text-xl font-bold mb-4 tracking-tight drop-shadow-md">Timer Pomodoro</h2>
              <PomodoroTimer compact />
            </div>
          </div>

          <div className="card-premium">
            <h2 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2">
              <AlertCircle size={20} className="text-destructive" />
              Proyectos Críticos
            </h2>
            <div className="space-y-4">
              {criticalProjects.length === 0 ? (
                <div className="text-center py-8">
                  <div className="h-12 w-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 size={24} />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">¡Todo bajo control!</p>
                  <p className="text-xs text-muted-foreground">No tienes entregas urgentes.</p>
                </div>
              ) : (
                criticalProjects.map(p => (
                  <div key={p.id} className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors">
                    <h4 className="font-bold text-sm">{p.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      Vence: {format(parseISO(p.deadline!), 'dd MMM', { locale: es })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
