import { Plus, Target } from 'lucide-react'

export default function ProjectsPage() {
  const projects = [
    { name: 'Rediseño Web', tasks: 12, completed: 8, color: '#3b82f6', status: 'En Progreso' },
    { name: 'App Tarea 2', tasks: 5, completed: 5, color: '#22c55e', status: 'Completado' },
    { name: 'Lanzamiento Marketing', tasks: 20, completed: 2, color: '#f59e0b', status: 'Planificado' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-muted-foreground">Gestiona tus proyectos y sus tareas asociadas.</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nuevo Proyecto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, i) => (
          <div key={i} className="card p-6 space-y-4 hover:shadow-md transition-shadow group cursor-pointer">
            <div className="flex items-center justify-between">
              <div 
                className="h-10 w-10 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: project.color }}
              >
                <Target size={20} />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                project.status === 'Completado' ? 'bg-green-100 text-green-700' : 
                project.status === 'En Progreso' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {project.status}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{project.name}</h3>
              <p className="text-sm text-muted-foreground">{project.tasks} tareas totales</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>Progreso</span>
                <span>{Math.round((project.completed / project.tasks) * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ 
                    width: `${(project.completed / project.tasks) * 100}%`,
                    backgroundColor: project.color
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
