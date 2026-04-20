'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  open: boolean
  onClose: () => void
  prefillMemberId?: string
  prefillMonth?: number
  prefillYear?: number
}

export default function LogSubscriptionModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline font-bold text-on-surface">
            Log Subscription
          </DialogTitle>
        </DialogHeader>
        <div className="py-6 flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-outline">calendar_month</span>
          <p className="text-sm text-on-surface-variant text-center">
            Full subscription form coming in Phase 6.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
