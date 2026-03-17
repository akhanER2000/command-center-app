import { Plus, Search, StickyNote } from 'lucide-react'

export default function NotesPage() {
  const notes = [
    { title: 'Ideas Sprint 1', content: 'Implementar el login con Supabase y las tablas básicas...', color: '#fef9c3', date: 'Hoy' },
    { title: 'Feedback Cliente', content: 'Mejorar el contraste de los botones de acción...', color: '#dcfce7', date: 'Ayer' },
    { title: 'Requerimientos Técnicos', content: 'Next.js 14+, Tailwind CSS, Zustand para estado local...', color: '#dbeafe', date: '15 Mar' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notas</h1>
          <p className="text-muted-foreground">Captura tus pensamientos y organiza tus ideas.</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nueva Nota
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Buscar notas..." 
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>
        <button className="btn btn-outline">Filtrar</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note, i) => (
          <div 
            key={i} 
            className="card p-6 space-y-4 hover:shadow-md transition-shadow cursor-pointer relative group overflow-hidden"
            style={{ borderTop: `4px solid ${note.color}` }}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold">{note.title}</h3>
              <StickyNote size={16} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground line-clamp-4">
              {note.content}
            </p>
            <div className="pt-4 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{note.date}</span>
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: note.color }}></div>
            </div>
          </div>
        ))}
        
        {/* New Note Placeholder */}
        <div className="card border-dashed border-2 flex flex-col items-center justify-center p-6 text-muted-foreground hover:text-primary hover:border-primary transition-all cursor-pointer min-h-[200px]">
          <Plus size={32} className="mb-2" />
          <p className="font-medium">Agregar Nota</p>
        </div>
      </div>
    </div>
  )
}
