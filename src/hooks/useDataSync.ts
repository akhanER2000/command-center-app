'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useStore } from '@/store/useStore'

export function useDataSync() {
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { setProjects, setTasks, setActivities, setProfileName, setPomodoros, setNotes } = useStore()

  useEffect(() => {
    let mounted = true

    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [
        { data: profile },
        { data: projects },
        { data: tasks },
        { data: activities },
        { data: pomodoros },
        { data: notes }
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').order('position', { ascending: true }),
        supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(15),
        supabase.from('pomodoros').select('*').order('start_time', { ascending: false }),
        supabase.from('notes').select('*').order('updated_at', { ascending: false })
      ])

      if (mounted) {
        if (profile) setProfileName(profile.display_name)
        if (projects) setProjects(projects)
        if (tasks) setTasks(tasks)
        if (activities) setActivities(activities)
        if (pomodoros) setPomodoros(pomodoros)
        if (notes) setNotes(notes)
        setLoading(false)
      }
    }

    loadData()

    // Realtime subscriptions
    const projectsSub = supabase.channel('projects_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, loadData)
      .subscribe()
      
    const tasksSub = supabase.channel('tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, loadData)
      .subscribe()

    const activitySub = supabase.channel('activity_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, loadData)
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(projectsSub)
      supabase.removeChannel(tasksSub)
      supabase.removeChannel(activitySub)
    }
  }, [supabase, setProjects, setTasks, setActivities, setProfileName])

  return { loading }
}
