import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PomodoroPageContent } from '@/components/PomodoroPageContent'

export default async function PomodoroPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <PomodoroPageContent />
}
