'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/layout/PageHeader'
import TransactionDetailModal from '@/components/modals/TransactionDetailModal'
import { supabase } from '@/lib/supabase'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import type { LedgerEntry } from '@/types'

const PAGE_SIZE = 20
const CATEGORIES = ['All', 'Zakat', 'Scholarship']

function RowSkeleton() {
  return (
    <tr className="animate-pulse">
      {[20, 32, 12, 48, 20].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className={`h-3 bg-surface-container rounded w-${w} ${i >= 3 ? 'ml-auto' : ''}`} />
        </td>
      ))}
    </tr>
  )
}

export default function ZakatPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(0)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null)

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('ledger_entries')
      .select('*')
      .eq('account', 'zakat')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
    setEntries((data ?? []) as LedgerEntry[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchEntries() }, [fetchEntries])
  useEffect(() => { setPage(0) }, [categoryFilter, dateFrom, dateTo])

  const filtered = entries.filter(e => {
    if (categoryFilter !== 'All' && e.category !== categoryFilter) return false
    if (dateFrom && e.date < dateFrom) return false
    if (dateTo && e.date > dateTo) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const zakatBalance = entries.reduce((sum, e) => sum + e.amount, 0)
  const totalInflow = entries.filter(e => e.amount > 0).reduce((sum, e) => sum + e.amount, 0)
  const totalDisbursed = entries.filter(e => e.amount < 0).reduce((sum, e) => sum + Math.abs(e.amount), 0)

  const hasActiveFilters = categoryFilter !== 'All' || dateFrom || dateTo

  function clearFilters() {
    setCategoryFilter('All')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Zakat (GFES) Account"
        description="Restricted fund — scholarship and zakat-eligible disbursements"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.info('Export feature coming in the full version')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-label font-medium text-on-surface-variant border border-outline-variant bg-white hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] leading-none">picture_as_pdf</span>
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        }
      />

      <div className="px-4 py-4 md:px-8 md:py-6 space-y-4">

        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {/* Zakat Balance */}
          <div className="relative bg-white rounded-xl border border-outline-variant/20 shadow-sm p-4 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-tertiary-fixed" />
            <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wide mt-1 mb-1.5">
              Zakat Balance
            </p>
            {loading ? (
              <div className="h-7 bg-surface-container rounded animate-pulse w-28" />
            ) : (
              <>
                <p className="font-headline font-bold text-xl text-on-surface">
                  {formatCurrency(zakatBalance)}
                </p>
                <p className="text-xs text-on-surface-variant mt-1">Restricted — GFES fund</p>
              </>
            )}
          </div>

          {/* Total Inflow */}
          <div className="relative bg-white rounded-xl border border-outline-variant/20 shadow-sm p-4 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary-fixed" />
            <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wide mt-1 mb-1.5">
              Total Received
            </p>
            {loading ? (
              <div className="h-7 bg-surface-container rounded animate-pulse w-28" />
            ) : (
              <>
                <p className="font-headline font-bold text-xl text-on-surface">
                  {formatCurrency(totalInflow)}
                </p>
                <p className="text-xs text-on-surface-variant mt-1">Zakat contributions</p>
              </>
            )}
          </div>

          {/* Total Disbursed */}
          <div className="relative bg-white rounded-xl border border-outline-variant/20 shadow-sm p-4 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-error-container" />
            <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wide mt-1 mb-1.5">
              Total Disbursed
            </p>
            {loading ? (
              <div className="h-7 bg-surface-container rounded animate-pulse w-28" />
            ) : (
              <>
                <p className="font-headline font-bold text-xl text-on-surface">
                  {formatCurrency(totalDisbursed)}
                </p>
                <p className="text-xs text-on-surface-variant mt-1">Scholarship payouts</p>
              </>
            )}
          </div>
        </div>

        {/* Zakat info callout */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-tertiary-fixed/30 border border-tertiary-fixed">
          <span className="material-symbols-outlined text-[18px] text-on-tertiary-fixed-variant shrink-0 mt-0.5">info</span>
          <p className="text-xs text-on-tertiary-fixed-variant leading-relaxed">
            Zakat contributions are restricted funds posted to the GFES account. Disbursements can only be made for eligible scholarship or zakat-approved expenses. This account is maintained separately from the General Account.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-outline-variant/20 shadow-sm p-4">
          <button
            className="flex items-center justify-between w-full md:hidden"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <span className="text-sm font-label font-medium text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-outline">filter_list</span>
              Filters
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
            </span>
            <span className="material-symbols-outlined text-[18px] text-outline">
              {filtersOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          <div className={cn('gap-2 flex-wrap', filtersOpen ? 'flex mt-3' : 'hidden md:flex')}>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-label text-on-surface-variant whitespace-nowrap">From</span>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="bg-surface-highest border-none rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-label text-on-surface-variant whitespace-nowrap">To</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="bg-surface-highest border-none rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="hidden md:block w-px h-5 bg-outline-variant/30 mx-1 self-center" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-surface-highest border-none rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-label text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px] leading-none">close</span>
                Clear
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <p className="text-xs text-on-surface-variant mt-2.5">
              Showing <span className="font-semibold text-primary">{filtered.length}</span> of {entries.length} entries
            </p>
          )}
        </div>

        {/* Transactions table */}
        <div className="bg-surface-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-low border-b border-outline-variant/15">
                  <th className="text-left px-4 py-3 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide whitespace-nowrap">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide hidden md:table-cell">Description</th>
                  <th className="text-right px-4 py-3 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide whitespace-nowrap">Amount</th>
                  <th className="text-right px-4 py-3 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide whitespace-nowrap hidden lg:table-cell">Running Balance</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-14 text-center">
                      <span className="material-symbols-outlined text-3xl text-outline block mb-2">inbox</span>
                      <p className="text-sm text-on-surface-variant">No records found</p>
                    </td>
                  </tr>
                ) : (
                  paged.map((entry, i) => (
                    <tr
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className={cn(
                        'cursor-pointer hover:bg-surface-high/50 transition-colors border-b border-outline-variant/10 last:border-0',
                        i % 2 === 0 ? 'bg-white' : 'bg-surface-low/40'
                      )}
                    >
                      <td className="px-4 py-3.5 text-xs text-on-surface-variant whitespace-nowrap">
                        {formatDate(entry.date)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label whitespace-nowrap">
                            {entry.category}{entry.sub_category ? ` / ${entry.sub_category}` : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-on-surface max-w-xs hidden md:table-cell">
                        <span className="line-clamp-1">{entry.description}</span>
                      </td>
                      <td className={cn(
                        'px-4 py-3.5 text-right text-xs font-label font-medium whitespace-nowrap',
                        entry.amount >= 0 ? 'text-primary' : 'text-on-error-container'
                      )}>
                        {entry.amount >= 0 ? '+' : '−'}
                        {formatCurrency(Math.abs(entry.amount))}
                      </td>
                      <td className="px-4 py-3.5 text-right text-xs text-on-surface-variant whitespace-nowrap hidden lg:table-cell">
                        {entry.running_balance != null
                          ? formatCurrency(entry.running_balance)
                          : <span className="text-outline">—</span>
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-outline-variant/15 flex items-center justify-between gap-4">
              <p className="text-xs text-on-surface-variant">
                <span className="font-medium text-on-surface">
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)}
                </span>{' '}
                of{' '}
                <span className="font-medium text-on-surface">{filtered.length}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-label text-on-surface-variant border border-outline-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px] leading-none">chevron_left</span>
                  Prev
                </button>
                <span className="text-xs text-on-surface-variant px-1">
                  {page + 1} / {Math.max(1, totalPages)}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-label text-on-surface-variant border border-outline-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <span className="material-symbols-outlined text-[14px] leading-none">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <TransactionDetailModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </DashboardLayout>
  )
}
