import { formatCurrency, formatDate } from '@/lib/utils'
import type { LedgerEntry } from '@/types'

interface Props {
  entries: LedgerEntry[]
  onRowClick?: (entry: LedgerEntry) => void
}

export default function RecentActivityTable({ entries, onRowClick }: Props) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <span className="material-symbols-outlined text-3xl text-outline">inbox</span>
        <p className="text-sm text-on-surface-variant">No records found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-105">
        <thead>
          <tr className="bg-surface-low">
            <th className="text-left px-4 py-2.5 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide rounded-l-lg whitespace-nowrap">Date</th>
            <th className="text-left px-4 py-2.5 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide">Description</th>
            <th className="text-left px-4 py-2.5 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide hidden sm:table-cell">Category</th>
            <th className="text-right px-4 py-2.5 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide rounded-r-lg whitespace-nowrap">Amount</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr
              key={entry.id}
              onClick={() => onRowClick?.(entry)}
              className={`transition-colors border-b border-outline-variant/10 last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-surface-high/50' : ''} ${i % 2 === 0 ? 'bg-white' : 'bg-surface-low/40'}`}
            >
              <td className="px-4 py-3 text-xs text-on-surface-variant whitespace-nowrap">
                {formatDate(entry.date)}
              </td>
              <td className="px-4 py-3 text-xs text-on-surface max-w-35 sm:max-w-60">
                <span className="line-clamp-1">{entry.description}</span>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label">
                  {entry.category}
                  {entry.sub_category ? ` / ${entry.sub_category}` : ''}
                </span>
              </td>
              <td className={`px-4 py-3 text-right text-xs font-label font-medium whitespace-nowrap ${entry.amount >= 0 ? 'text-primary' : 'text-on-error-container'}`}>
                {entry.amount >= 0 ? '+' : '−'}{formatCurrency(Math.abs(entry.amount))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
