'use client'

import { useStore } from '@/store/useStore'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function ActivityFeed() {
  const { activities } = useStore()

  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay actividad reciente.</p>
  }

  return (
    <div className="space-y-6">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-4">
          <div className="mt-1">
            <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shadow-[0_0_8px_var(--color-primary)]"></div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold tracking-tight">{activity.description}</p>
            <p className="text-xs text-muted-foreground mt-1 tracking-widest uppercase">
              {formatDistanceToNow(new Date(activity.created_at!), { addSuffix: true, locale: es })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

