'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import type { LedgerEntry } from '@/types'

interface Props {
  entry: LedgerEntry | null
  onClose: () => void
}

const SOURCE_ICONS: Record<string, string> = {
  subscription: 'calendar_month',
  donation:     'volunteer_activism',
  expense:      'payments',
}

export default function TransactionDetailModal({ entry, onClose }: Props) {
  if (!entry) return null

  const isCredit = entry.amount >= 0
  const sourceIcon = SOURCE_ICONS[entry.source_type ?? ''] ?? 'receipt_long'

  return (
    <Dialog open={!!entry} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline font-bold text-on-surface">
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        {/* Amount hero */}
        <div className={cn(
          'rounded-xl px-5 py-4 flex items-center justify-between',
          isCredit ? 'bg-primary-fixed/30' : 'bg-error-container/30'
        )}>
          <div>
            <p className="text-xs font-label text-on-surface-variant mb-1">
              {isCredit ? 'Credit' : 'Debit'}
            </p>
            <p className={cn(
              'font-headline font-bold text-2xl',
              isCredit ? 'text-primary' : 'text-on-error-container'
            )}>
              {isCredit ? '+' : '−'}{formatCurrency(Math.abs(entry.amount))}
            </p>
          </div>
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            isCredit ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-error-container text-on-error-container'
          )}>
            <span className="material-symbols-outlined text-[22px]">{sourceIcon}</span>
          </div>
        </div>

        {/* Details list */}
        <div className="space-y-0 divide-y divide-outline-variant/15 rounded-xl border border-outline-variant/15 overflow-hidden">
          <Row label="Date" value={formatDate(entry.date)} />
          <Row label="Description" value={entry.description} />
          <Row
            label="Category"
            value={entry.category + (entry.sub_category ? ` / ${entry.sub_category}` : '')}
          />
          <Row
            label="Account"
            value={
              <span className={cn(
                'text-xs font-bold px-2 py-0.5 rounded-full',
                entry.account === 'zakat'
                  ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                  : 'bg-primary-fixed text-on-primary-fixed-variant'
              )}>
                {entry.account === 'zakat' ? 'Zakat (GFES)' : 'General'}
              </span>
            }
          />
          {entry.member_code && (
            <Row
              label="Member"
              value={
                <span className="font-mono text-xs bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">
                  #{entry.member_code}
                </span>
              }
            />
          )}
          {entry.running_balance != null && (
            <Row
              label="Running Balance"
              value={
                <span className="font-label font-semibold text-on-surface">
                  {formatCurrency(entry.running_balance)}
                </span>
              }
            />
          )}
          {entry.source_type && (
            <Row label="Source" value={
              <span className="capitalize text-on-surface-variant">{entry.source_type}</span>
            } />
          )}
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="text-sm font-label font-medium text-on-surface-variant hover:text-on-surface transition-colors px-4 py-2 rounded-lg hover:bg-surface-container"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3 bg-white">
      <span className="text-xs font-label text-on-surface-variant shrink-0 mt-0.5">{label}</span>
      <span className="text-xs text-on-surface text-right">{value}</span>
    </div>
  )
}
