'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, Trash2, Tag as TagIcon, LayoutGrid } from 'lucide-react'
import { useMutations } from '@/hooks/useMutations'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Note, Tag, Project } from '@/types/database'
import { useStore } from '@/store/useStore'

export function NotesContent() {
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [notes, setNotes] = useState<any[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])

  const { projects } = useStore()

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [newNote, setNewNote] = useState({ title: '', content: '', color: '#3b82f6', project_id: '', tags: '' })
  
  // Fetch Tags on mount
  useEffect(() => {
    async function fetchTags() {
      const { data } = await supabase.from('tags').select('*')
      if (data) setAllTags(data)
    }
    fetchTags()
  }, [supabase])

  // Debounced Search and Filter
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, selectedTag, selectedColor])

  const fetchNotes = async () => {
    setLoading(true)
    let query = supabase.from('notes').select('*, tags!note_tags(id, name, color)')

    if (searchTerm) {
      // Use logical OR for title and content
      query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
    }

    if (selectedColor) {
      query = query.eq('color', selectedColor)
    }

    if (selectedTag) {
      // Supabase trick: to filter by related table, we have to use inner join.
      // Easiest is to fetch all notes matching the tag separately, or use a complex query.
      // Since inner join filtering requires PostgREST configuration we might not have exposed,
      // we'll fetch matching note_ids first if tag filter is active.
      const { data: noteTags } = await supabase.from('note_tags').select('note_id').eq('tag_id', selectedTag)
      const noteIds = noteTags?.map(nt => nt.note_id) || []
      
      if (noteIds.length > 0) {
        query = query.in('id', noteIds)
      } else {
        // Force empty result if tag has no notes
        query = query.eq('id', '00000000-0000-0000-0000-000000000000') 
      }
    }

    const { data } = await query.order('updated_at', { ascending: false })
    
    // Si buscamos por texto libre (searchTerm), pero NO encontó en título/contenido, verificamos si existe en algún tag.
    // Esto es un enfoque combinado para cumplir con el requerimiento.
    if (data && searchTerm) {
      const { data: tagData } = await supabase.from('tags').select('id, name').ilike('name', `%${searchTerm}%`)
      if (tagData && tagData.length > 0) {
        const tagIds = tagData.map(t => t.id)
        const { data: noteTags } = await supabase.from('note_tags').select('note_id').in('tag_id', tagIds)
        if (noteTags && noteTags.length > 0) {
           const noteIdsTagMatch = noteTags.map(nt => nt.note_id)
           const { data: notesByTag } = await supabase.from('notes').select('*, tags!note_tags(id, name, color)').in('id', noteIdsTagMatch)
           
           // Combinar sin duplicados
           const combined = [...data]
           notesByTag?.forEach(n => {
              if (!combined.find(x => x.id === n.id)) combined.push(n)
           })
           setNotes(combined.sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()))
           setLoading(false)
           return
        }
      }
    }

    if (data) setNotes(data)
    setLoading(false)
  }

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.title) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Create Note
    const { data: note } = await supabase.from('notes').insert({
      user_id: user.id,
      title: newNote.title,
      content: newNote.content,
      color: newNote.color,
      project_id: newNote.project_id || null
    }).select().single()

    if (note) {
      // 2. Process Tags
      const inputTags = newNote.tags.split(',').map(t => t.trim()).filter(t => t)
      
      for (const tName of inputTags) {
        // Check if tag exists
        let tagId = allTags.find(t => t.name.toLowerCase() === tName.toLowerCase())?.id
        
        if (!tagId) {
          // Create tag
          const { data: newTag } = await supabase.from('tags').insert({
            user_id: user.id,
            name: tName,
            color: '#3b82f6'
          }).select().single()
          
          if (newTag) {
            tagId = newTag.id
            setAllTags(prev => [...prev, newTag])
          }
        }

        // Link tag to note
        if (tagId) {
          await supabase.from('note_tags').insert({
            note_id: note.id,
            tag_id: tagId
          })
        }
      }

      await supabase.from('activity_log').insert({
        user_id: user.id,
        action_type: 'create',
        entity_type: 'note',
        entity_id: note.id,
        description: `Creaste la nota "${newNote.title}"`
      })

      fetchNotes()
      setShowModal(false)
      setNewNote({ title: '', content: '', color: '#3b82f6', project_id: '', tags: '' })
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (confirm('¿Eliminar esta nota permanentemente?')) {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('notes').delete().eq('id', id)
      
      if (user) {
         await supabase.from('activity_log').insert({
            user_id: user.id,
            action_type: 'delete',
            entity_type: 'note',
            entity_id: id,
            description: `Eliminaste la nota "${title}"`
         })
      }
      fetchNotes()
    }
  }

  const presetColors = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#38bdf8', '#818cf8', '#a78bfa', '#f472b6']

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter gradient-text inline-block">Notas Rápidas</h1>
          <p className="text-muted-foreground font-medium text-lg">Ideas, apuntes y recordatorios.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nueva Nota
        </button>
      </div>

      <div className="card-premium p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 sticky top-6 z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.2)]">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por título, contenido o etiqueta (Server-side)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary font-medium transition-all"
          />
        </div>
        
        <div className="md:col-span-3">
          <select 
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none font-medium text-foreground transition-all cursor-pointer"
          >
            <option value="">Todas las etiquetas</option>
            {allTags.map(t => (
               <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select 
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none font-medium text-foreground transition-all cursor-pointer"
          >
            <option value="">Todos los colores</option>
            {presetColors.map(c => (
               <option key={c} value={c}>Color {c}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
         <div className="py-20 text-center text-muted-foreground animate-pulse">
            Buscando notas...
         </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {notes.length === 0 ? (
             <div className="col-span-full py-16 text-center text-muted-foreground break-inside-avoid">
               <LayoutGrid size={40} className="mx-auto mb-4 opacity-20" />
               <p className="font-medium">No se encontraron notas.</p>
             </div>
          ) : (
             notes.map(note => (
                <div 
                  key={note.id} 
                  className="card-premium p-6 break-inside-avoid hover:scale-[1.02] transition-transform relative group border-t-4"
                  style={{ borderTopColor: note.color || 'var(--color-primary)' }}
                >
                   <button 
                     onClick={() => handleDelete(note.id, note.title)}
                     className="absolute top-4 right-4 p-2 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                   >
                     <Trash2 size={16} />
                   </button>
                   
                   <h3 className="text-xl font-bold tracking-tight mb-2 pr-8">{note.title}</h3>
                   <p className="text-muted-foreground text-sm whitespace-pre-wrap mb-6 line-clamp-6">{note.content}</p>
                   
                   {note.tags && note.tags.length > 0 && (
                     <div className="flex flex-wrap gap-2 mb-4">
                        {note.tags.map((t: any) => (
                          <span key={t.id} className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-muted text-muted-foreground rounded-md flex items-center gap-1">
                            <TagIcon size={10} /> {t.name}
                          </span>
                        ))}
                     </div>
                   )}

                   <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mt-4 pt-4 border-t border-border/50">
                      <span>{format(new Date(note.updated_at), "dd MMM yyyy", { locale: es })}</span>
                      {note.project_id && (
                        <span className="text-primary truncate ml-2 max-w-[150px]">
                           {projects.find(p => p.id === note.project_id)?.name}
                        </span>
                      )}
                   </div>
                </div>
             ))
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="glass card-premium w-full max-w-xl p-8 animate-in zoom-in-95 duration-200 shadow-2xl">
            <h2 className="text-2xl font-black tracking-tighter mb-6 gradient-text inline-block">Nueva Nota</h2>
            <form onSubmit={handleCreateNote} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Título</label>
                <input 
                  type="text" 
                  value={newNote.title}
                  onChange={e => setNewNote({...newNote, title: e.target.value})}
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl outline-none font-medium focus:ring-2 focus:ring-primary" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Contenido</label>
                <textarea 
                  value={newNote.content}
                  onChange={e => setNewNote({...newNote, content: e.target.value})}
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl outline-none font-medium h-32 resize-none focus:ring-2 focus:ring-primary" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Etiquetas (separadas por coma)</label>
                <input 
                  type="text" 
                  placeholder="urgente, ideas, personal"
                  value={newNote.tags}
                  onChange={e => setNewNote({...newNote, tags: e.target.value})}
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl outline-none font-medium focus:ring-2 focus:ring-primary" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                 <div className="space-y-2">
                   <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Proyecto Relacionado</label>
                   <select
                     value={newNote.project_id}
                     onChange={e => setNewNote({...newNote, project_id: e.target.value})}
                     className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl outline-none font-medium focus:ring-2 focus:ring-primary text-sm"
                   >
                      <option value="">Ninguno</option>
                      {projects.map(p => (
                         <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                   </select>
                 </div>
                 
                 <div className="space-y-2">
                   <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Color de Distinción</label>
                   <div className="flex gap-2 flex-wrap">
                      {presetColors.map(color => (
                        <div 
                          key={color}
                          onClick={() => setNewNote({...newNote, color})}
                          className={`w-8 h-8 rounded-full cursor-pointer shadow-inner border-2 transition-all ${newNote.color === color ? 'border-foreground scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                   </div>
                 </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline flex-1 py-3 text-base">Cancelar</button>
                <button type="submit" className="btn btn-primary flex-1 py-3 text-base">Guardar Nota</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
