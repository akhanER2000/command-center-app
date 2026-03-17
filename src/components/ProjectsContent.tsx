'use client'

import { useState, useMemo } from 'react'
import { Plus, Target, CalendarClock, MoreVertical, Trash2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { format, isBefore, startOfDay, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { useMutations } from '@/hooks/useMutations'

export function ProjectsContent() {
  const { projects, tasks } = useStore()
  const { createProject, updateProject, deleteProject } = useMutations()

  const [filter, setFilter] = useState<'todos' | 'planificado' | 'en_progreso' | 'completado' | 'pausado'>('todos')
  const [sort, setSort] = useState<'deadline' | 'nombre' | 'progreso'>('deadline')
  
  const [showModal, setShowModal] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '', deadline: '', color: '#8b5cf6' })

  // Calculated metrics 
  const processedProjects = useMemo(() => {
    let result = projects.map(p => {
      const pTasks = tasks.filter(t => t.project_id === p.id)
      const completedTasks = pTasks.filter(t => t.is_completed).length
      const progress = pTasks.length > 0 ? (completedTasks / pTasks.length) * 100 : 0
      
      const isUrgent = p.deadline && p.status !== 'completado' && isBefore(parseISO(p.deadline), startOfDay(new Date()))

      return {
        ...p,
        totalTasks: pTasks.length,
        completedTasks,
        progress: Math.round(progress),
        isUrgent
      }
    })

    if (filter !== 'todos') {
      result = result.filter(p => p.status === filter)
    }

    result.sort((a, b) => {
      if (sort === 'deadline') {
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      }
      if (sort === 'nombre') {
        return a.name.localeCompare(b.name)
      }
      if (sort === 'progreso') {
        return b.progress - a.progress
      }
      return 0
    })

    return result
  }, [projects, tasks, filter, sort])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newProject.name.length < 3) return
    
    await createProject(
      newProject.name,
      newProject.description || null,
      newProject.deadline || null,
      newProject.color
    )
    setShowModal(false)
    setNewProject({ name: '', description: '', deadline: '', color: '#8b5cf6' })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter gradient-text">Proyectos</h1>
          <p className="text-muted-foreground font-medium">Gestiona iniciativas y su progreso.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nuevo Proyecto
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-card/40 backdrop-blur p-4 rounded-2xl border border-border">
        <div className="flex items-center gap-2">
           <span className="text-sm font-semibold text-muted-foreground mr-2">Estado:</span>
           <select 
             value={filter} 
             onChange={e => setFilter(e.target.value as any)}
             className="bg-transparent border border-border rounded-xl px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
           >
             <option value="todos">Todos</option>
             <option value="planificado">Planificado</option>
             <option value="en_progreso">En Progreso</option>
             <option value="completado">Completado</option>
             <option value="pausado">Pausado</option>
           </select>
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
           <span className="text-sm font-semibold text-muted-foreground mr-2">Ordenar por:</span>
           <select 
             value={sort} 
             onChange={e => setSort(e.target.value as any)}
             className="bg-transparent border border-border rounded-xl px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
           >
             <option value="deadline">Fecha Límite</option>
             <option value="nombre">Nombre (A-Z)</option>
             <option value="progreso">Mayor Progreso</option>
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedProjects.map((project) => (
          <div key={project.id} className={`card-premium space-y-5 hover:shadow-xl transition-shadow group relative overflow-hidden ${project.isUrgent ? 'border-destructive/50 ring-1 ring-destructive' : ''}`}>
            
            {project.isUrgent && (
              <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-lg z-10">
                Urgente
              </div>
            )}

            <div className="flex items-start justify-between relative z-10">
              <div 
                className="h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: project.color || 'var(--color-primary)' }}
              >
                <Target size={24} />
              </div>
              
              <div className="flex gap-2 items-center" onClick={e => e.stopPropagation()}>
                <select 
                  value={project.status}
                  onChange={e => updateProject(project.id, { status: e.target.value as any })}
                  className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full cursor-pointer outline-none ${
                    project.status === 'completado' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 
                    project.status === 'en_progreso' ? 'bg-primary/10 text-primary hover:bg-primary/20' : 
                    project.status === 'pausado' ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20' :
                    'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <option value="planificado">PLANIFICADO</option>
                  <option value="en_progreso">EN PROGRESO</option>
                  <option value="pausado">PAUSADO</option>
                  <option value="completado">COMPLETADO</option>
                </select>

                <button 
                  onClick={() => {
                    if (confirm('Eliminar el proyecto también eliminará todas sus tareas. ¿Estás seguro?')) {
                      deleteProject(project.id, project.name)
                    }
                  }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Eliminar proyecto"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <Link href={`/projects/${project.id}`} className="block relative z-10 group-hover:blur-[1px] transition-all">
              <h3 className="text-xl font-bold tracking-tight text-foreground">{project.name}</h3>
              <p className="text-sm font-medium text-muted-foreground mt-1 line-clamp-1 truncate">{project.description || 'Sin descripción'}</p>
            </Link>

            <Link href={`/projects/${project.id}`} className="absolute inset-0 z-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-background/40 backdrop-blur-sm transition-opacity">
               <span className="btn btn-primary font-bold shadow-2xl scale-95 group-hover:scale-100 transition-transform">Ver Detalles</span>
            </Link>
            
            <div className="space-y-3 relative z-10 pt-2 border-t border-border mt-auto pointer-events-none">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <CalendarClock size={14} className={project.isUrgent ? 'text-destructive' : ''} />
                    <span className={project.isUrgent ? 'text-destructive' : ''}>
                      {project.deadline ? format(parseISO(project.deadline), 'dd MMM yyyy', { locale: es }) : 'Sin fecha'}
                    </span>
                 </div>
                 <span className="text-xs font-black tracking-tighter">{project.progress}%</span>
              </div>

              <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden flex shadow-inner">
                <div 
                  className="h-full transition-all duration-1000 ease-out rounded-full relative overflow-hidden"
                  style={{ 
                    width: `${project.progress}%`,
                    backgroundColor: project.color || 'var(--color-primary)'
                  }}
                >
                   {/* Light reflection effect */}
                   <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20"></div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {processedProjects.length === 0 && (
           <div className="col-span-full py-16 text-center bg-card/20 border border-dashed border-border rounded-3xl">
              <div className="h-16 w-16 bg-muted text-muted-foreground rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
                 <Target size={32} />
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-2">No hay proyectos</h3>
              <p className="text-muted-foreground font-medium mb-6">No se encontraron proyectos con estos filtros.</p>
              <button onClick={() => setShowModal(true)} className="btn btn-outline border-border">
                Crear uno ahora
              </button>
           </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="glass card-premium w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black tracking-tighter mb-6">Nuevo Proyecto</h2>
            <form onSubmit={handleCreate} className="space-y-4 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Nombre</label>
                <input 
                  type="text" 
                  value={newProject.name}
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium" 
                  placeholder="Ej: Rediseño App"
                  required 
                  minLength={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Descripción</label>
                <textarea 
                  value={newProject.description}
                  onChange={e => setNewProject({...newProject, description: e.target.value})}
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none h-24 font-medium" 
                  placeholder="Detalles sobre el proyecto..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Deadline</label>
                  <input 
                    type="date" 
                    value={newProject.deadline}
                    onChange={e => setNewProject({...newProject, deadline: e.target.value})}
                    className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium [color-scheme:dark]" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Color</label>
                  <div className="flex h-12 rounded-xl overflow-hidden border border-border">
                    <input 
                      type="color" 
                      value={newProject.color}
                      onChange={e => setNewProject({...newProject, color: e.target.value})}
                      className="w-full h-16 -mt-2 -ml-2 scale-110 cursor-pointer outline-none" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline flex-1 py-3 text-base font-bold">Cancelar</button>
                <button type="submit" className="btn btn-primary flex-1 py-3 text-base font-bold text-white shadow-lg shadow-primary/20">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
