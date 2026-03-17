'use client'

import { useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { Play, Pause, RotateCcw, Target, Forward } from 'lucide-react'
import { useMutations } from '@/hooks/useMutations'

export function PomodoroTimer({ compact = false }: { compact?: boolean }) {
  const { 
    timeLeft, 
    isRunning, 
    mode, 
    setTimeLeft, 
    setIsRunning, 
    setMode, 
    tick,
    projects,
    currentProjectId,
    setCurrentProjectId
  } = useStore()

  const { logPomodoroSession } = useMutations()
  const initialDuration = useRef<number>(25 * 60)

  // Helper to play a subtle beep when timer is up
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.value = 880; // A5
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 1);
    } catch(e) {}
  }

  useEffect(() => {
    if (mode === 'work') initialDuration.current = 25 * 60
    else if (mode === 'short_break') initialDuration.current = 5 * 60
    else if (mode === 'long_break') initialDuration.current = 15 * 60
  }, [mode])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        tick()
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false)
      playBeep()
      // Guardar en Supabase
      const proj = projects.find(p => p.id === currentProjectId)
      logPomodoroSession(
        currentProjectId, 
        proj ? proj.name : null, 
        initialDuration.current, 
        mode
      )
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft, tick, setIsRunning, logPomodoroSession, mode, currentProjectId, projects])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleReset = () => {
    setIsRunning(false)
    const duration = mode === 'work' ? 25 * 60 : mode === 'short_break' ? 5 * 60 : 15 * 60
    setTimeLeft(duration)
  }

  const handleSkip = () => {
    // Si salta manualmente podemos o no guardarlo, asumimos que no es completado
    setIsRunning(false)
    setMode(mode === 'work' ? 'short_break' : 'work')
    setTimeLeft(mode === 'work' ? 5 * 60 : 25 * 60)
  }

  const toggle = () => setIsRunning(!isRunning)

  const eligibleProjects = projects.filter(p => p.status === 'planificado' || p.status === 'en_progreso')

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <select
            value={currentProjectId || ''}
            onChange={(e) => setCurrentProjectId(e.target.value || null)}
            className="w-full bg-black/20 text-white border-none rounded-xl px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase outline-none"
          >
            <option value="" className="text-black">Pomodoro Libre</option>
            {eligibleProjects.map(p => (
              <option key={p.id} value={p.id} className="text-black">{p.name}</option>
            ))}
          </select>
        </div>
        <div className="text-5xl md:text-6xl font-black tabular-nums tracking-tighter drop-shadow-lg">
          {formatTime(timeLeft)}
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggle}
            className="h-12 w-12 rounded-2xl bg-white text-primary flex items-center justify-center hover:bg-white/90 transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
          </button>
          <button 
            onClick={handleReset}
            className="h-10 w-10 rounded-xl bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-all"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card-premium flex flex-col items-center justify-center gap-8 max-w-xl mx-auto p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div className="flex items-center gap-2">
        <Target size={18} className="text-muted-foreground" />
        <select
          value={currentProjectId || ''}
          onChange={(e) => setCurrentProjectId(e.target.value || null)}
          className="bg-muted border border-border rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        >
          <option value="">Foco libre (Sin proyecto)</option>
          {eligibleProjects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 bg-muted/50 p-2 rounded-2xl shadow-inner">
        <button 
          onClick={() => { setMode('work'); setTimeLeft(25 * 60); setIsRunning(false); }}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all ${mode === 'work' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-muted-foreground hover:bg-muted-hover'}`}
        >
          Trabajo (25m)
        </button>
        <button 
          onClick={() => { setMode('short_break'); setTimeLeft(5 * 60); setIsRunning(false); }}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all ${mode === 'short_break' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'text-muted-foreground hover:bg-muted-hover'}`}
        >
          Pausa Corta (5m)
        </button>
        <button 
          onClick={() => { setMode('long_break'); setTimeLeft(15 * 60); setIsRunning(false); }}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all ${mode === 'long_break' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-muted-foreground hover:bg-muted-hover'}`}
        >
          Pausa Larga (15m)
        </button>
      </div>

      <div className="text-[120px] leading-none font-black tabular-nums tracking-tighter gradient-text py-4 drop-shadow-sm">
        {formatTime(timeLeft)}
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={handleReset}
          className="h-16 w-16 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted-hover hover:text-foreground transition-all hover:-rotate-45"
          title="Reiniciar"
        >
          <RotateCcw size={28} />
        </button>
        <button 
          onClick={toggle}
          className="h-24 w-24 rounded-[32px] bg-primary text-white flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(139,92,246,0.6)] hover:scale-105 active:scale-95 transition-all"
        >
          {isRunning ? <Pause size={40} fill="currentColor" /> : <Play size={40} className="ml-2" fill="currentColor" />}
        </button>
        <button 
          onClick={handleSkip}
          className="h-16 w-16 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted-hover hover:text-foreground transition-all hover:translate-x-1"
          title="Saltar"
        >
          <Forward size={28} fill="currentColor" />
        </button>
      </div>
    </div>
  )
}
