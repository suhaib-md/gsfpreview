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

export default function LogDonationModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline font-bold text-on-surface">
            Log Donation
          </DialogTitle>
        </DialogHeader>
        <div className="py-6 flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-outline">volunteer_activism</span>
          <p className="text-sm text-on-surface-variant text-center">
            Full donation form coming in Phase 6.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
