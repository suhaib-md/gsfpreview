import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string
  sublabel?: string
  trend?: string
  trendPositive?: boolean
  accentClass: string
  heroSize?: boolean
}

export default function KpiCard({
  label,
  value,
  sublabel,
  trend,
  trendPositive = true,
  accentClass,
  heroSize = false,
}: KpiCardProps) {
  return (
    <div className="relative bg-surface-lowest rounded-xl border border-outline-variant/20 shadow-sm p-5 overflow-hidden">
      {/* Accent bar */}
      <div className={cn('absolute top-0 left-0 w-full h-1', accentClass)} />

      <div className="pt-1">
        <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wide mb-2">
          {label}
        </p>
        <div className="flex items-end gap-2 flex-wrap">
          <p className={cn('font-headline font-bold text-on-surface', heroSize ? 'text-3xl' : 'text-2xl')}>
            {value}
          </p>
          {trend && (
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full font-label font-semibold mb-0.5',
                trendPositive
                  ? 'bg-primary-fixed text-on-primary-fixed-variant'
                  : 'bg-error-container text-on-error-container'
              )}
            >
              {trend}
            </span>
          )}
        </div>
        {sublabel && (
          <p className="text-xs text-on-surface-variant mt-1.5">{sublabel}</p>
        )}
      </div>
    </div>
  )
}
