import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectDetailContent } from '@/components/ProjectDetailContent'

export default async function ProjectDetailPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <ProjectDetailContent />
}
