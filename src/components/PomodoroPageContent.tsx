'use client'

import { PomodoroTimer } from '@/components/PomodoroTimer'
import { useStore } from '@/store/useStore'
import { format, isToday, startOfWeek, isAfter } from 'date-fns'
import { es } from 'date-fns/locale'
import { Flame, Clock, CalendarDays } from 'lucide-react'

export function PomodoroPageContent() {
  const { pomodoros, projects } = useStore()

  // Calculo de estadisticas
  const todayPomodoros = pomodoros.filter(p => p.start_time && isToday(new Date(p.start_time)))
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekPomodoros = pomodoros.filter(p => p.start_time && isAfter(new Date(p.start_time), weekStart))

  const todayCount = todayPomodoros.filter(p => p.type === 'work').length
  const weekCount = weekPomodoros.filter(p => p.type === 'work').length
  const totalHours = (pomodoros.filter(p => p.type === 'work').reduce((acc, p) => acc + p.duration, 0) / 3600).toFixed(1)

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tighter gradient-text inline-block">Zona de Foco</h1>
        <p className="text-muted-foreground font-medium text-lg">Un bloque a la vez. Olvida las distracciones.</p>
      </div>

      <PomodoroTimer />

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-premium flex items-center gap-4 bg-gradient-to-br from-orange-500/10 to-transparent">
            <div className="h-12 w-12 rounded-2xl bg-orange-500/20 text-orange-500 flex items-center justify-center">
              <Flame size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Hoy</p>
              <p className="text-2xl font-black">{todayCount} <span className="text-sm font-semibold text-muted-foreground">pomodoros</span></p>
            </div>
          </div>
          
          <div className="card-premium flex items-center gap-4 bg-gradient-to-br from-primary/10 to-transparent">
            <div className="h-12 w-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
              <CalendarDays size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Esta Semana</p>
              <p className="text-2xl font-black">{weekCount} <span className="text-sm font-semibold text-muted-foreground">pomodoros</span></p>
            </div>
          </div>
          
          <div className="card-premium flex items-center gap-4 bg-gradient-to-br from-blue-500/10 to-transparent">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Histórico</p>
              <p className="text-2xl font-black">{totalHours} <span className="text-sm font-semibold text-muted-foreground">horas</span></p>
            </div>
          </div>
        </div>

        <div className="card-premium">
          <h2 className="text-xl font-bold tracking-tight mb-6">Historial de Sesiones</h2>
          {pomodoros.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock size={32} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No hay sesiones de Pomodoro registradas.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {pomodoros.map(pom => {
                const proj = projects.find(p => p.id === pom.project_id)
                return (
                  <div key={pom.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background/50 rounded-2xl border border-border gap-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`h-3 w-3 rounded-full ${pom.type === 'work' ? 'bg-primary shadow-[0_0_8px_var(--color-primary)]' : pom.type === 'short_break' ? 'bg-accent' : 'bg-blue-500'}`} />
                      <div>
                        <p className="font-bold text-sm">
                          {pom.type === 'work' ? 'Foco' : pom.type === 'short_break' ? 'Pausa Corta' : 'Pausa Larga'}
                          {proj && <span className="text-muted-foreground mx-2">•</span>}
                          {proj && <span className="text-primary">{proj.name}</span>}
                        </p>
                        <p className="text-xs font-semibold text-muted-foreground mt-1">
                          {pom.start_time && format(new Date(pom.start_time), "d MMM, HH:mm", { locale: es })}
                          {' '}- {Math.floor(pom.duration / 60)} min
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
