'use client'

import Link from 'next/link'
import { LayoutDashboard, Target, Timer, StickyNote, LogOut } from 'lucide-react'
import { signOut } from '@/app/auth/actions'
import { ThemeToggle } from '@/components/ThemeToggle'

export function Navbar() {
  const handleLogout = async () => {
    await signOut()
  }

  return (
    <nav className="fixed left-0 top-0 h-full w-64 border-r border-border bg-card/40 backdrop-blur-2xl p-6 hidden md:flex flex-col gap-8 z-50">
      <div className="flex items-center gap-2 px-2">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">
          C
        </div>
        <span className="text-2xl font-black tracking-tighter gradient-text">Command</span>
      </div>


      <div className="flex flex-col gap-2">
        <NavLink href="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <NavLink href="/projects" icon={<Target size={20} />} label="Proyectos" />
        <NavLink href="/pomodoro" icon={<Timer size={20} />} label="Pomodoro" />
        <NavLink href="/notes" icon={<StickyNote size={20} />} label="Notas" />
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <ThemeToggle />
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 hover:bg-destructive/10 rounded-2xl text-muted-foreground hover:text-destructive transition-all duration-300"
        >
          <LogOut size={20} />
          <span className="font-semibold tracking-tight">Cerrar Sesión</span>
        </button>
      </div>
    </nav>
  )
}


function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-all duration-300 group"
    >
      <div className="group-hover:text-primary transition-colors duration-300">
        {icon}
      </div>
      <span className="font-semibold tracking-tight">{label}</span>
    </Link>
  )
}

