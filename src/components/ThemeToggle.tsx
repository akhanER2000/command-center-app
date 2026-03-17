"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-all duration-300 w-full text-left"
    >
      <div className="text-muted-foreground transition-colors duration-300">
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 hidden dark:block" />
        <Moon className="h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 dark:hidden" />
      </div>
      <span className="font-semibold tracking-tight">Cambiar Tema</span>
    </button>
  )
}
