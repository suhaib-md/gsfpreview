'use client'

import { useCallback, useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/layout/PageHeader'
import TransactionDetailModal from '@/components/modals/TransactionDetailModal'
import { supabase } from '@/lib/supabase'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import type { LedgerEntry } from '@/types'

const PAGE_SIZE = 20

type DonationEntry = LedgerEntry & { donationType: 'hadiya' | 'zakat' | 'other' }

const TYPE_LABEL: Record<string, string> = {
  hadiya: 'Hadiya',
  zakat: 'Zakat',
  other: 'Other',
}

const TYPE_BADGE: Record<string, string> = {
  hadiya: 'bg-primary-fixed text-on-primary-fixed-variant',
  zakat: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  other: 'bg-secondary-container text-on-secondary-container',
}

function categoryToDonationType(category: string): 'hadiya' | 'zakat' | 'other' {
  const lower = category.toLowerCase()
  if (lower === 'hadiya') return 'hadiya'
  if (lower === 'zakat') return 'zakat'
  return 'other'
}

function RowSkeleton() {
  return (
    <tr className="animate-pulse">
      {[16, 28, 14, 20, 20].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className={`h-3 bg-surface-container rounded w-${w} ${i >= 4 ? 'ml-auto' : ''}`} />
        </td>
      ))}
    </tr>
  )
}

export default function DonationsPage() {
  const [entries, setEntries] = useState<DonationEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<'All' | 'hadiya' | 'zakat' | 'other'>('All')
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
      .in('category', ['Hadiya', 'Zakat'])
      .gt('amount', 0)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    const mapped: DonationEntry[] = (data ?? []).map((e: LedgerEntry) => ({
      ...e,
      donationType: categoryToDonationType(e.category),
    }))
    setEntries(mapped)
    setLoading(false)
  }, [])

  useEffect(() => { fetchEntries() }, [fetchEntries])
  useEffect(() => { setPage(0) }, [typeFilter, dateFrom, dateTo])

  const filtered = entries.filter(e => {
    if (typeFilter !== 'All' && e.donationType !== typeFilter) return false
    if (dateFrom && e.date < dateFrom) return false
    if (dateTo && e.date > dateTo) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const totalHadiya = entries.filter(e => e.donationType === 'hadiya').reduce((s, e) => s + e.amount, 0)
  const totalZakat = entries.filter(e => e.donationType === 'zakat').reduce((s, e) => s + e.amount, 0)
  const totalOther = entries.filter(e => e.donationType === 'other').reduce((s, e) => s + e.amount, 0)
  const grandTotal = entries.reduce((s, e) => s + e.amount, 0)

  const hasActiveFilters = typeFilter !== 'All' || dateFrom || dateTo

  function clearFilters() {
    setTypeFilter('All')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Donations"
        description="Hadiya, Zakat, and other contributions"
      />

      <div className="px-4 py-4 md:px-8 md:py-6 space-y-4">

        {/* Summary KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="relative bg-white rounded-xl border border-outline-variant/20 shadow-sm p-4 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
            <p className="text-xs font-label text-on-surface-variant uppercase tracking-wide mt-1 mb-1">Total</p>
            {loading ? (
              <div className="h-6 bg-surface-container rounded animate-pulse w-24" />
            ) : (
              <p className="font-headline font-bold text-lg text-on-surface">{formatCurrency(grandTotal)}</p>
            )}
          </div>

          <div className="relative bg-white rounded-xl border border-outline-variant/20 shadow-sm p-4 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary-fixed" />
            <p className="text-xs font-label text-on-surface-variant uppercase tracking-wide mt-1 mb-1">Hadiya</p>
            {loading ? (
              <div className="h-6 bg-surface-container rounded animate-pulse w-20" />
            ) : (
              <p className="font-headline font-bold text-lg text-on-surface">{formatCurrency(totalHadiya)}</p>
            )}
          </div>

          <div className="relative bg-white rounded-xl border border-outline-variant/20 shadow-sm p-4 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-tertiary-fixed" />
            <p className="text-xs font-label text-on-surface-variant uppercase tracking-wide mt-1 mb-1">Zakat</p>
            {loading ? (
              <div className="h-6 bg-surface-container rounded animate-pulse w-20" />
            ) : (
              <p className="font-headline font-bold text-lg text-on-surface">{formatCurrency(totalZakat)}</p>
            )}
          </div>

          <div className="relative bg-white rounded-xl border border-outline-variant/20 shadow-sm p-4 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-secondary-container" />
            <p className="text-xs font-label text-on-surface-variant uppercase tracking-wide mt-1 mb-1">Other</p>
            {loading ? (
              <div className="h-6 bg-surface-container rounded animate-pulse w-20" />
            ) : (
              <p className="font-headline font-bold text-lg text-on-surface">{formatCurrency(totalOther)}</p>
            )}
          </div>
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

          <div className={cn('gap-2 flex-wrap items-center', filtersOpen ? 'flex mt-3' : 'hidden md:flex')}>
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

            {/* Type filter pills */}
            <div className="flex gap-1.5 flex-wrap">
              {(['All', 'hadiya', 'zakat', 'other'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-label font-medium transition-colors',
                    typeFilter === t
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-highest text-on-surface-variant hover:bg-surface-container'
                  )}
                >
                  {t === 'All' ? 'All Types' : TYPE_LABEL[t]}
                </button>
              ))}
            </div>

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
              Showing <span className="font-semibold text-primary">{filtered.length}</span> of {entries.length} donations
            </p>
          )}
        </div>

        {/* Donations table */}
        <div className="bg-surface-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-low border-b border-outline-variant/15">
                  <th className="text-left px-4 py-3 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide whitespace-nowrap">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide hidden sm:table-cell">Member</th>
                  <th className="text-left px-4 py-3 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide hidden md:table-cell">Description</th>
                  <th className="text-right px-4 py-3 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide whitespace-nowrap">Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-14 text-center">
                      <span className="material-symbols-outlined text-3xl text-outline block mb-2">volunteer_activism</span>
                      <p className="text-sm text-on-surface-variant">No donations recorded yet</p>
                    </td>
                  </tr>
                ) : (
                  paged.map((e, i) => (
                    <tr
                      key={e.id}
                      onClick={() => setSelectedEntry(e)}
                      className={cn(
                        'cursor-pointer hover:bg-surface-high/50 transition-colors border-b border-outline-variant/10 last:border-0',
                        i % 2 === 0 ? 'bg-white' : 'bg-surface-low/40'
                      )}
                    >
                      <td className="px-4 py-3.5 text-xs text-on-surface-variant whitespace-nowrap">
                        {formatDate(e.date)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-label font-medium', TYPE_BADGE[e.donationType])}>
                          {TYPE_LABEL[e.donationType]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        {e.member_code ? (
                          <span className="text-xs font-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                            #{e.member_code}
                          </span>
                        ) : (
                          <span className="text-xs text-outline">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-on-surface max-w-xs hidden md:table-cell">
                        <span className="line-clamp-1">{e.description}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right text-xs font-label font-medium text-primary whitespace-nowrap">
                        +{formatCurrency(e.amount)}
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
