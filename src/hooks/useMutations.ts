'use client'

import { createClient } from '@/utils/supabase/client'
import { useStore } from '@/store/useStore'
import type { Project, Task, ActivityLog, Pomodoro } from '@/types/database'

export function useMutations() {
  const supabase = createClient()
  
  const logActivity = async (action_type: string, entity_type: string, entity_id: string | null, description: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('activity_log').insert({
      user_id: user.id,
      action_type,
      entity_type,
      entity_id,
      description
    })
  }

  const createProject = async (name: string, description: string | null, deadline: string | null, color: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const newProject = {
      user_id: user.id,
      name,
      description,
      deadline,
      color,
      status: 'planificado'
    }

    const { data, error } = await supabase.from('projects').insert(newProject).select().single()
    if (data) {
      await logActivity('create', 'project', data.id, `Creaste el proyecto "${data.name}"`)
    }
    return { data, error }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single()
    if (data) {
      await logActivity('update', 'project', data.id, `Actualizaste el proyecto "${data.name}"`)
    }
    return { data, error }
  }

  const deleteProject = async (id: string, name: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (!error) {
      await logActivity('delete', 'project', id, `Eliminaste el proyecto "${name}"`)
    }
    return { error }
  }

  const createTask = async (project_id: string, projectName: string, name: string, position: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.from('tasks').insert({
      user_id: user.id,
      project_id,
      name,
      position,
      is_completed: false
    }).select().single()

    if (data) {
      await logActivity('create', 'task', data.id, `Añadiste la tarea "${name}" a "${projectName}"`)
    }
    return { data, error }
  }

  const updateTask = async (id: string, name: string, updates: Partial<Task>) => {
    const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single()
    if (data) {
      if (updates.is_completed !== undefined) {
        const action = updates.is_completed ? 'Completaste' : 'Desmarcaste'
        await logActivity('update_status', 'task', data.id, `${action} la tarea "${name}"`)
      }
    }
    return { data, error }
  }

  const updateTasksPositions = async (updatesArray: Array<{id: string, position: number}>) => {
    // Optimistic UI Update
    useStore.setState((state) => ({
      tasks: state.tasks.map(t => {
        const matching = updatesArray.find(u => u.id === t.id)
        if (matching) return { ...t, position: matching.position }
        return t
      })
    }))

     for (const t of updatesArray) {
       await supabase.from('tasks').update({ position: t.position }).eq('id', t.id)
     }
  }

  const deleteTask = async (id: string, name: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) {
      await logActivity('delete', 'task', id, `Eliminaste la tarea "${name}"`)
    }
    return { error }
  }

  const logPomodoroSession = async (projectId: string | null, projectName: string | null, duration: number, type: Pomodoro['type']) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.from('pomodoros').insert({
      user_id: user.id,
      project_id: projectId,
      start_time: new Date(Date.now() - duration * 1000).toISOString(),
      end_time: new Date().toISOString(),
      duration,
      type
    }).select().single()

    if (data) {
      const typeStr = type === 'work' ? 'Pomodoro' : 'Descanso'
      const desc = projectName ? `Completaste un ${typeStr} para "${projectName}"` : `Completaste un ${typeStr} libre`
      await logActivity('complete', 'pomodoro', data.id, desc)
    }
    return { data, error }
  }

  return {
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    updateTasksPositions,
    deleteTask,
    logPomodoroSession
  }
}
