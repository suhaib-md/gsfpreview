import { cn, FY_MONTH_LABELS, FY_MONTHS, getSubscriptionBadgeClass } from '@/lib/utils'
import type { Subscription } from '@/types'

interface Props {
  subscriptions: Subscription[]
  fyStartYear?: number
}

export default function SubscriptionHistoryGrid({ subscriptions, fyStartYear = 2024 }: Props) {
  const subMap = new Map(subscriptions.map(s => [`${s.month}-${s.year}`, s]))

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  return (
    <div>
      <div className="grid grid-cols-12 gap-1.5">
        {FY_MONTHS.map((month, i) => {
          const subYear = month >= 6 ? fyStartYear : fyStartYear + 1
          const sub = subMap.get(`${month}-${subYear}`)
          const isFuture =
            subYear > currentYear ||
            (subYear === currentYear && month > currentMonth)
          const isCurrent = subYear === currentYear && month === currentMonth

          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[9px] text-on-surface-variant font-label uppercase">
                {FY_MONTH_LABELS[i]}
              </span>

              {isFuture ? (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-outline-variant/30" />
                </div>
              ) : sub ? (
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity',
                    sub.status === 'na' ? 'text-[9px] font-bold' : 'text-[11px] font-bold',
                    getSubscriptionBadgeClass(sub.status),
                    isCurrent && sub.status === 'due'
                      ? 'ring-2 ring-tertiary-fixed ring-offset-1'
                      : ''
                  )}
                  title={
                    sub.paid_date
                      ? `Paid on ${sub.paid_date} · ₹${sub.amount}`
                      : sub.status === 'due'
                      ? `Due · ₹${sub.amount}`
                      : 'Not applicable'
                  }
                >
                  {sub.status === 'paid' ? 'P' : sub.status === 'due' ? 'D' : 'N/A'}
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-outline-variant/30" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-outline-variant/15">
        {[
          { label: 'Paid',           cls: 'bg-primary-fixed text-on-primary-fixed-variant',       text: 'P' },
          { label: 'Due',            cls: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',      text: 'D' },
          { label: 'Not Applicable', cls: 'bg-secondary-container text-on-secondary-container',   text: 'N/A' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={cn('w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold', item.cls)}>
              {item.text}
            </div>
            <span className="text-xs text-on-surface-variant">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
