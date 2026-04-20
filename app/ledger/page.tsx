'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/layout/PageHeader'
import { supabase } from '@/lib/supabase'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import type { LedgerEntry } from '@/types'

const PAGE_SIZE = 20

const CATEGORIES = ['All', 'Subscription', 'Hadiya', 'Zakat', 'Medical', 'Scholarship', 'Amanath']

function RowSkeleton() {
  return (
    <tr className="animate-pulse">
      {[20, 32, 12, 48, 16, 20].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className={`h-3 bg-surface-container rounded w-${w} ${i >= 4 ? 'ml-auto' : ''}`} />
        </td>
      ))}
    </tr>
  )
}

export default function LedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [memberCodeFilter, setMemberCodeFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(0)

  useEffect(() => { fetchEntries() }, [])

  // Reset to page 0 whenever a filter changes
  useEffect(() => { setPage(0) }, [categoryFilter, memberCodeFilter, dateFrom, dateTo])

  async function fetchEntries() {
    setLoading(true)
    const { data } = await supabase
      .from('ledger_entries')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
    setEntries((data ?? []) as LedgerEntry[])
    setLoading(false)
  }

  const filtered = entries.filter(e => {
    if (categoryFilter !== 'All' && e.category !== categoryFilter) return false
    if (memberCodeFilter && !e.member_code?.toLowerCase().includes(memberCodeFilter.toLowerCase())) return false
    if (dateFrom && e.date < dateFrom) return false
    if (dateTo && e.date > dateTo) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  // General account balance (always from full unfiltered data)
  const generalBalance = entries
    .filter(e => e.account === 'general')
    .reduce((sum, e) => sum + e.amount, 0)

  function clearFilters() {
    setCategoryFilter('All')
    setMemberCodeFilter('')
    setDateFrom('')
    setDateTo('')
  }

  const hasActiveFilters = categoryFilter !== 'All' || memberCodeFilter || dateFrom || dateTo

  return (
    <DashboardLayout>
      <PageHeader
        title="General Ledger"
        description="All Foundation transactions"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.info('Export feature coming in the full version')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-label font-medium text-on-surface-variant border border-outline-variant bg-white hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] leading-none">picture_as_pdf</span>
              Export PDF
            </button>
            <button
              onClick={() => toast.info('Export feature coming in the full version')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-label font-medium text-on-surface-variant border border-outline-variant bg-white hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] leading-none">table_view</span>
              Export Excel
            </button>
          </div>
        }
      />

      <div className="px-8 py-6 space-y-4">
        {/* Filter panel + Balance KPI */}
        <div className="flex items-start gap-4">
          {/* Filters */}
          <div className="flex-1 bg-white rounded-xl border border-outline-variant/20 shadow-sm p-4">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Date from */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-label text-on-surface-variant whitespace-nowrap">From</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="bg-surface-highest border-none rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              {/* Date to */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-label text-on-surface-variant whitespace-nowrap">To</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="bg-surface-highest border-none rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="w-px h-5 bg-outline-variant/30 mx-1" />

              {/* Category */}
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-surface-highest border-none rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                ))}
              </select>

              {/* Member code */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[14px] text-outline">
                  person
                </span>
                <input
                  type="text"
                  value={memberCodeFilter}
                  onChange={e => setMemberCodeFilter(e.target.value)}
                  placeholder="Member code…"
                  className="bg-surface-highest border-none rounded-lg pl-7 pr-3 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary w-32"
                />
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

            {/* Active filter summary */}
            {hasActiveFilters && (
              <p className="text-xs text-on-surface-variant mt-2.5">
                Showing <span className="font-semibold text-primary">{filtered.length}</span> of {entries.length} entries
              </p>
            )}
          </div>

          {/* Balance KPI card */}
          <div className="relative bg-white rounded-xl border border-outline-variant/20 shadow-sm p-4 overflow-hidden w-52 shrink-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
            <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wide mt-1 mb-1.5">
              General Account
            </p>
            {loading ? (
              <div className="h-7 bg-surface-container rounded animate-pulse w-28" />
            ) : (
              <>
                <p className="font-headline font-bold text-xl text-on-surface">
                  {formatCurrency(generalBalance)}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label font-semibold">
                    +4.2%
                  </span>
                  <span className="text-xs text-on-surface-variant">vs last month</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Transactions table */}
        <div className="bg-surface-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-low border-b border-outline-variant/15">
                  <th className="text-left px-4 py-3 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide whitespace-nowrap">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide whitespace-nowrap">Member</th>
                  <th className="text-left px-4 py-3 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide">Description</th>
                  <th className="text-right px-4 py-3 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide whitespace-nowrap">Amount</th>
                  <th className="text-right px-4 py-3 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide whitespace-nowrap">Balance</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-14 text-center">
                      <span className="material-symbols-outlined text-3xl text-outline block mb-2">inbox</span>
                      <p className="text-sm text-on-surface-variant">No records found</p>
                    </td>
                  </tr>
                ) : (
                  paged.map((entry, i) => (
                    <tr
                      key={entry.id}
                      className={cn(
                        'hover:bg-surface-high/50 transition-colors border-b border-outline-variant/10 last:border-0',
                        i % 2 === 0 ? 'bg-white' : 'bg-surface-low/40'
                      )}
                    >
                      {/* Date */}
                      <td className="px-4 py-3.5 text-xs text-on-surface-variant whitespace-nowrap">
                        {formatDate(entry.date)}
                      </td>

                      {/* Category / Sub + account chip */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label whitespace-nowrap">
                            {entry.category}{entry.sub_category ? ` / ${entry.sub_category}` : ''}
                          </span>
                          {entry.account === 'zakat' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant">
                              ZAKAT
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Member code */}
                      <td className="px-4 py-3.5">
                        {entry.member_code ? (
                          <span className="text-xs font-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                            #{entry.member_code}
                          </span>
                        ) : (
                          <span className="text-xs text-outline">—</span>
                        )}
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3.5 text-xs text-on-surface max-w-xs">
                        <span className="line-clamp-1">{entry.description}</span>
                      </td>

                      {/* Amount */}
                      <td className={cn(
                        'px-4 py-3.5 text-right text-xs font-label font-medium whitespace-nowrap',
                        entry.amount >= 0 ? 'text-primary' : 'text-on-error-container'
                      )}>
                        {entry.amount >= 0 ? '+' : '−'}
                        {formatCurrency(Math.abs(entry.amount))}
                      </td>

                      {/* Running balance */}
                      <td className="px-4 py-3.5 text-right text-xs text-on-surface-variant whitespace-nowrap">
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
            <div className="px-4 py-3 border-t border-outline-variant/15 flex items-center justify-between">
              <p className="text-xs text-on-surface-variant">
                Showing{' '}
                <span className="font-medium text-on-surface">
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)}
                </span>{' '}
                of{' '}
                <span className="font-medium text-on-surface">{filtered.length}</span> entries
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
    </DashboardLayout>
  )
}
