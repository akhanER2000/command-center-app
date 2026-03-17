'use client'

import Link from 'next/link'
import { LayoutDashboard, Target, Timer, StickyNote, LogOut } from 'lucide-react'
import { signOut } from '@/app/auth/actions'

export function Navbar() {
  const handleLogout = async () => {
    await signOut()
  }
  return (
    <nav className="fixed left-0 top-0 h-full w-64 border-r border-border bg-card p-6 hidden md:flex flex-col gap-8">
      <div className="flex items-center gap-2 px-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
          C
        </div>
        <span className="text-xl font-bold tracking-tight">Command</span>
      </div>

      <div className="flex flex-col gap-2">
        <NavLink href="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <NavLink href="/projects" icon={<Target size={20} />} label="Proyectos" />
        <NavLink href="/pomodoro" icon={<Timer size={20} />} label="Pomodoro" />
        <NavLink href="/notes" icon={<StickyNote size={20} />} label="Notas" />
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-all"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </nav>
  )
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all group"
    >
      <div className="group-hover:text-primary transition-colors">
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </Link>
  )
}
