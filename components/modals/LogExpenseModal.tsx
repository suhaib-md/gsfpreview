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
}

export default function LogExpenseModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline font-bold text-on-surface">
            Log Expense / Disbursal
          </DialogTitle>
        </DialogHeader>
        <div className="py-6 flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-outline">payments</span>
          <p className="text-sm text-on-surface-variant text-center">
            Full expense form coming in Phase 6.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
