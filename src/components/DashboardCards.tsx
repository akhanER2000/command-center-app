interface CardProps {
  label: string
  value: string
  icon: React.ReactNode
  trend?: string
}

export function Card({ label, value, icon, trend }: CardProps) {
  return (
    <div className="card-premium flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/70 bg-muted/50 px-2 py-0.5 rounded-full">{trend}</span>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-muted-foreground tracking-tight">{label}</p>
        <p className="text-3xl font-black tracking-tighter mt-1">{value}</p>
      </div>
    </div>
  )
}

