'use client'

import { useDataSync } from '@/hooks/useDataSync'

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { loading } = useDataSync()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground flex-col gap-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium animate-pulse">Cargando Command Center...</p>
      </div>
    )
  }

  return <>{children}</>
}
