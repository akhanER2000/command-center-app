import { PomodoroTimer } from '@/components/PomodoroTimer'

export default function PomodoroPage() {
  return (
    <div className="space-y-8 h-full flex flex-col justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Temporizador</h1>
        <p className="text-muted-foreground mt-2">Enfócate en lo importante, un bloque a la vez.</p>
      </div>

      <PomodoroTimer />

      <div className="max-w-md mx-auto w-full">
        <div className="card p-6">
          <h3 className="font-bold mb-4">¿En qué estás trabajando?</h3>
          <select className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer">
            <option>Ningún proyecto seleccionado</option>
            <option>Rediseño Web</option>
            <option>App Tarea 2</option>
            <option>Lanzamiento Marketing</option>
          </select>
        </div>
      </div>
    </div>
  )
}
