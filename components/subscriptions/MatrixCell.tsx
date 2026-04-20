'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn, formatCurrency, formatDate, getSubscriptionBadgeClass, MONTH_NAMES } from '@/lib/utils'
import type { Member, Subscription } from '@/types'

interface Props {
  subscription: Subscription | null
  member: Member
  month: number
  year: number
  isFuture: boolean
  isCurrent: boolean
  onClickDueOrEmpty: (member: Member, month: number, year: number) => void
}

export default function MatrixCell({
  subscription,
  member,
  month,
  year,
  isFuture,
  isCurrent,
  onClickDueOrEmpty,
}: Props) {
  // Future month — grey dot, no interaction
  if (isFuture) {
    return (
      <div className="flex items-center justify-center w-10 h-10">
        <div className="w-2 h-2 rounded-full bg-outline-variant/30" />
      </div>
    )
  }

  // No data yet — clickable empty cell to log subscription
  if (!subscription) {
    return (
      <div
        onClick={() => onClickDueOrEmpty(member, month, year)}
        className="flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer hover:bg-surface-container transition-colors"
        title={`Log subscription for ${member.name} — ${MONTH_NAMES[month - 1]} ${year}`}
      >
        <div className="w-2 h-2 rounded-full bg-outline-variant/30" />
      </div>
    )
  }

  // Paid — popover with payment details
  if (subscription.status === 'paid') {
    return (
      <Popover>
        <PopoverTrigger
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center text-[11px] font-bold cursor-pointer hover:opacity-80 transition-opacity select-none border-0 p-0',
            getSubscriptionBadgeClass('paid')
          )}
        >
          P
        </PopoverTrigger>
        <PopoverContent className="w-52 p-3" side="top" sideOffset={6}>
          <p className="text-xs font-label font-semibold text-on-surface mb-2">
            {MONTH_NAMES[month - 1]} {year}
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">Amount</span>
              <span className="font-medium text-primary">{formatCurrency(subscription.amount)}</span>
            </div>
            {subscription.paid_date && (
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">Paid on</span>
                <span className="text-on-surface">{formatDate(subscription.paid_date)}</span>
              </div>
            )}
            {subscription.mode && (
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">Mode</span>
                <span className="text-on-surface uppercase">{subscription.mode}</span>
              </div>
            )}
            {subscription.reference && (
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">Ref</span>
                <span className="text-on-surface truncate max-w-24">{subscription.reference}</span>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  // Due — clickable, ring on current month
  if (subscription.status === 'due') {
    return (
      <div
        onClick={() => onClickDueOrEmpty(member, month, year)}
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center text-[11px] font-bold cursor-pointer hover:opacity-80 transition-opacity select-none',
          getSubscriptionBadgeClass('due'),
          isCurrent && 'ring-2 ring-tertiary-fixed ring-offset-2'
        )}
        title={`Log payment for ${member.name} — ${MONTH_NAMES[month - 1]} ${year}`}
      >
        D
      </div>
    )
  }

  // N/A
  return (
    <div
      className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center text-[9px] font-bold select-none',
        getSubscriptionBadgeClass('na')
      )}
    >
      N/A
    </div>
  )
}
