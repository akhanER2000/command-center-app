export function ActivityFeed() {
  const activities = [
    { title: 'Tarea completada', desc: 'Migración de la base de datos', time: 'Hace 2 horas', type: 'task' },
    { title: 'Proyecto creado', desc: 'Nuevo proyecto "Command Center"', time: 'Ayer', type: 'project' },
    { title: 'Sesión Pomodoro', desc: 'Finalizaste 25 min de trabajo enfocado', time: 'Hace 3 horas', type: 'pomodoro' },
  ]

  return (
    <div className="space-y-6">
      {activities.map((activity, i) => (
        <div key={i} className="flex gap-4">
          <div className="mt-1">
            <div className="h-2 w-2 rounded-full bg-primary mt-1.5"></div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{activity.title}</p>
            <p className="text-sm text-muted-foreground">{activity.desc}</p>
            <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
