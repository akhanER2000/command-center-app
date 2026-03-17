interface CardProps {
  label: string
  value: string
  icon: React.ReactNode
  trend?: string
}

export function Card({ label, value, icon, trend }: CardProps) {
  return (
    <div className="card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-lg bg-muted">
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium text-muted-foreground">{trend}</span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  )
}
