import { create } from 'zustand'
import type { Project, Task, ActivityLog, Pomodoro, Note } from '@/types/database'

interface GlobalAppState {
  // Pomodoro timer state
  timeLeft: number
  isRunning: boolean
  mode: 'work' | 'short_break' | 'long_break'
  currentProjectId: string | null
  
  // Data state
  projects: Project[]
  tasks: Task[]
  activities: ActivityLog[]
  pomodoros: Pomodoro[]
  notes: Note[]
  profileName: string | null
  
  // Actions
  setTimeLeft: (time: number) => void
  setIsRunning: (isRunning: boolean) => void
  setMode: (mode: 'work' | 'short_break' | 'long_break') => void
  setCurrentProjectId: (id: string | null) => void
  tick: () => void
  
  setProjects: (projects: Project[]) => void
  setTasks: (tasks: Task[]) => void
  setActivities: (activities: ActivityLog[]) => void
  setPomodoros: (pomodoros: Pomodoro[]) => void
  setNotes: (notes: Note[]) => void
  setProfileName: (name: string | null) => void
  
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  removeProject: (id: string) => void
  
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  removeTask: (id: string) => void
  
  addActivity: (activity: ActivityLog) => void
}

export const useStore = create<GlobalAppState>((set) => ({
  timeLeft: 25 * 60,
  isRunning: false,
  mode: 'work',
  currentProjectId: null,
  
  projects: [],
  tasks: [],
  activities: [],
  pomodoros: [],
  notes: [],
  profileName: null,
  
  setTimeLeft: (time) => set({ timeLeft: time }),
  setIsRunning: (isRunning) => set({ isRunning }),
  setMode: (mode) => set({ mode }),
  setCurrentProjectId: (id) => set({ currentProjectId: id }),
  tick: () => set((state) => ({ timeLeft: Math.max(0, state.timeLeft - 1) })),
  
  setProjects: (projects) => set({ projects }),
  setTasks: (tasks) => set({ tasks }),
  setActivities: (activities) => set({ activities }),
  setPomodoros: (pomodoros) => set({ pomodoros }),
  setNotes: (notes) => set({ notes }),
  setProfileName: (name) => set({ profileName: name }),
  
  addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map((p) => p.id === id ? { ...p, ...updates } : p)
  })),
  removeProject: (id) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== id),
    tasks: state.tasks.filter((t) => t.project_id !== id) // Cascade locally
  })),
  
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === id ? { ...t, ...updates } : t)
  })),
  removeTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id)
  })),
  
  addActivity: (activity) => set((state) => ({
    activities: [activity, ...state.activities].slice(0, 15) // Keep last 15
  })),
}))

