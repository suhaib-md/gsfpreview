'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MONTH_NAMES } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  prefillMemberName?: string
  prefillMonth?: number
  prefillYear?: number
}

export default function LogSubscriptionModal({
  open,
  onClose,
  prefillMemberName,
  prefillMonth,
  prefillYear,
}: Props) {
  const hasPrefill = prefillMemberName && prefillMonth && prefillYear

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline font-bold text-on-surface">
            Log Subscription
          </DialogTitle>
        </DialogHeader>

        {hasPrefill && (
          <div className="bg-surface-container rounded-lg px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0">
              calendar_month
            </span>
            <div>
              <p className="text-xs text-on-surface-variant font-label">Pre-filled</p>
              <p className="text-sm font-label font-semibold text-on-surface">
                {prefillMemberName} — {MONTH_NAMES[prefillMonth - 1]} {prefillYear}
              </p>
            </div>
          </div>
        )}

        <div className="py-4 flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-outline">calendar_month</span>
          <p className="text-sm text-on-surface-variant text-center">
            Full subscription form coming in Phase 6.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
