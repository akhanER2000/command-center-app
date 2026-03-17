import { create } from 'zustand'

interface PomodoroState {
  timeLeft: number
  isRunning: boolean
  mode: 'work' | 'short_break' | 'long_break'
  currentProjectId: string | null
  setTimeLeft: (time: number) => void
  setIsRunning: (isRunning: boolean) => void
  setMode: (mode: 'work' | 'short_break' | 'long_break') => void
  setCurrentProjectId: (id: string | null) => void
  tick: () => void
}

export const useStore = create<PomodoroState>((set) => ({
  timeLeft: 25 * 60,
  isRunning: false,
  mode: 'work',
  currentProjectId: null,
  setTimeLeft: (time) => set({ timeLeft: time }),
  setIsRunning: (isRunning) => set({ isRunning }),
  setMode: (mode) => set({ mode }),
  setCurrentProjectId: (id) => set({ currentProjectId: id }),
  tick: () => set((state) => ({ timeLeft: Math.max(0, state.timeLeft - 1) })),
}))
