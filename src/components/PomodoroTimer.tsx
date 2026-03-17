'use client'

import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'

export function PomodoroTimer({ compact = false }: { compact?: boolean }) {
  const { 
    timeLeft, 
    isRunning, 
    mode, 
    setTimeLeft, 
    setIsRunning, 
    setMode, 
    tick 
  } = useStore()

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        tick()
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
      // Play a sound or notify?
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft, tick, setIsRunning])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const reset = () => {
    setIsRunning(false)
    const duration = mode === 'work' ? 25 * 60 : mode === 'short_break' ? 5 * 60 : 15 * 60
    setTimeLeft(duration)
  }

  const toggle = () => setIsRunning(!isRunning)

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="text-4xl font-black tabular-nums tracking-tighter">
          {formatTime(timeLeft)}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggle}
            className="h-10 w-10 rounded-full bg-white text-primary flex items-center justify-center hover:bg-white/90 transition-all shadow-lg"
          >
            {isRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-0.5" fill="currentColor" />}
          </button>
          <button 
            onClick={reset}
            className="h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-12 flex flex-col items-center justify-center gap-8 max-w-xl mx-auto">
      <div className="flex gap-2">
        <button 
          onClick={() => { setMode('work'); setTimeLeft(25 * 60); setIsRunning(false); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${mode === 'work' ? 'bg-primary text-white shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted-hover'}`}
        >
          Pomodoro
        </button>
        <button 
          onClick={() => { setMode('short_break'); setTimeLeft(5 * 60); setIsRunning(false); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${mode === 'short_break' ? 'bg-primary text-white shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted-hover'}`}
        >
          Short Break
        </button>
      </div>

      <div className="text-9xl font-black tabular-nums tracking-tighter text-primary py-8">
        {formatTime(timeLeft)}
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggle}
          className="h-16 w-16 rounded-3xl bg-primary text-white flex items-center justify-center hover:shadow-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
        >
          {isRunning ? <Pause size={28} fill="currentColor" /> : <Play size={28} className="ml-1" fill="currentColor" />}
        </button>
        <button 
          onClick={reset}
          className="h-14 w-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted-hover transition-all"
        >
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  )
}
