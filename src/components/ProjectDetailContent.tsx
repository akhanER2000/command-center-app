'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, GripVertical, CheckCircle2, Circle, Trash2, CalendarClock } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useMutations } from '@/hooks/useMutations'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

export function ProjectDetailContent() {
  const { id } = useParams()
  const router = useRouter()
  const { projects, tasks } = useStore()
  const { createTask, updateTask, updateTasksPositions, deleteTask } = useMutations()

  const [newTaskName, setNewTaskName] = useState('')

  const project = useMemo(() => projects.find(p => p.id === id), [projects, id])
  
  const projectTasks = useMemo(() => {
    return tasks.filter(t => t.project_id === id).sort((a, b) => a.position - b.position)
  }, [tasks, id])

  const progress = projectTasks.length > 0 
    ? Math.round((projectTasks.filter(t => t.is_completed).length / projectTasks.length) * 100) 
    : 0

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <h2 className="text-2xl font-bold">Proyecto no encontrado</h2>
        <button onClick={() => router.push('/projects')} className="btn btn-outline">Volver a proyectos</button>
      </div>
    )
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskName.trim()) return
    const position = projectTasks.length > 0 ? Math.max(...projectTasks.map(t => t.position)) + 1 : 0
    await createTask(project.id, project.name, newTaskName, position)
    setNewTaskName('')
  }

  const handleToggleTask = async (taskId: string, currentStatus: boolean, name: string) => {
    const is_completed = !currentStatus
    const completed_at = is_completed ? new Date().toISOString() : null
    await updateTask(taskId, name, { is_completed, completed_at: completed_at as string })
  }

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return
    if (result.destination.index === result.source.index) return

    const items = Array.from(projectTasks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update local optimistic position array to save to DB
    const updates = items.map((item, index) => ({ id: item.id, position: index }))
    await updateTasksPositions(updates)
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
      <button 
        onClick={() => router.push('/projects')}
        className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Volver a proyectos
      </button>

      <div className="card-premium relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-4">
              <div className="w-4 h-12 rounded-full shadow-inner" style={{ backgroundColor: project.color || 'var(--color-primary)' }}></div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter shadow-sm">{project.name}</h1>
                <p className="text-muted-foreground font-medium mt-1">{project.description || 'Sin descripción'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <span className={`text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full ${
                project.status === 'completado' ? 'bg-green-500/20 text-green-500' : 
                project.status === 'en_progreso' ? 'bg-primary/20 text-primary' : 
                project.status === 'pausado' ? 'bg-orange-500/20 text-orange-500' :
                'bg-muted text-muted-foreground'
              }`}>
                {project.status.replace('_', ' ')}
              </span>
              
              {project.deadline && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold bg-muted/50 px-3 py-1.5 rounded-full">
                  <CalendarClock size={14} />
                  <span>Vence: {format(parseISO(project.deadline), 'dd MMMM yyyy', { locale: es })}</span>
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-64 space-y-2 bg-background/50 p-4 rounded-2xl border border-border">
            <div className="flex items-end justify-between">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Progreso</span>
              <span className="text-3xl font-black">{progress}%</span>
            </div>
            <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full rounded-full transition-all duration-1000 relative"
                style={{ width: `${progress}%`, backgroundColor: project.color || 'var(--color-primary)' }}
              >
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20"></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-right font-medium pt-1">
              {projectTasks.filter(t => t.is_completed).length} de {projectTasks.length} tareas completadas
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Tareas</h2>

        <form onSubmit={handleCreateTask} className="flex gap-2 relative">
          <input 
            type="text" 
            value={newTaskName}
            onChange={e => setNewTaskName(e.target.value)}
            placeholder="Añade una nueva tarea y presiona Enter..."
            className="flex-1 px-5 py-4 pl-12 bg-card border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary shadow-sm font-medium transition-all"
            required
          />
          <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <button type="submit" className="btn btn-primary px-8 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            Añadir
          </button>
        </form>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {projectTasks.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <CheckCircle2 size={40} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium">No hay tareas en este proyecto todavía.</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="tasks-list">
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className="divide-y divide-border"
                  >
                    {projectTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${
                              snapshot.isDragging ? 'bg-muted/80 shadow-xl ring-1 ring-border rounded-xl z-50' : ''
                            } ${task.is_completed ? 'opacity-60 bg-muted/20' : ''}`}
                          >
                            <div {...provided.dragHandleProps} className="text-muted-foreground/40 hover:text-foreground cursor-grab active:cursor-grabbing p-1">
                              <GripVertical size={20} />
                            </div>
                            
                            <button 
                              onClick={() => handleToggleTask(task.id, task.is_completed, task.name)}
                              className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                            >
                              {task.is_completed ? (
                                <CheckCircle2 size={24} className="text-green-500 drop-shadow-sm" />
                              ) : (
                                <Circle size={24} />
                              )}
                            </button>
                            
                            <span className={`flex-1 font-medium ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.name}
                            </span>

                            <button
                              onClick={() => {
                                if (confirm('¿Eliminar esta tarea?')) {
                                  deleteTask(task.id, task.name)
                                }
                              }}
                              className="p-2 text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>
    </div>
  )
}
