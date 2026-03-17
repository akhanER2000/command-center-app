import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { NotesContent } from '@/components/NotesContent'

export default async function NotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <NotesContent />
}
