'use client'

import { useCallback, useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/layout/PageHeader'
import MemberRow from '@/components/members/MemberRow'
import AddMemberModal from '@/components/modals/AddMemberModal'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { Member } from '@/types'

const PAGE_SIZE = 10
type StatusFilter = 'all' | 'active' | 'inactive'

function RowSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-outline-variant/20 shadow-sm px-5 py-4 animate-pulse">
      <div className="grid grid-cols-[72px_1fr_200px_130px_90px] items-center gap-4">
        <div className="h-6 bg-surface-container rounded w-full" />
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-surface-container" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 bg-surface-container rounded w-32" />
            <div className="h-3 bg-surface-container rounded w-20" />
          </div>
        </div>
        <div className="h-3 bg-surface-container rounded w-24" />
        <div className="h-3 bg-surface-container rounded w-20" />
        <div className="h-6 bg-surface-container rounded-full w-16 ml-auto" />
      </div>
    </div>
  )
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [bodOnly, setBodOnly] = useState(false)
  const [page, setPage] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('members').select('*').order('code')
    setMembers((data ?? []) as Member[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    if (
      q &&
      !m.name.toLowerCase().includes(q) &&
      !m.code.includes(q) &&
      !(m.email?.toLowerCase().includes(q))
    )
      return false
    if (statusFilter !== 'all' && m.status !== statusFilter) return false
    if (bodOnly && !m.is_bod) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function handleSearchChange(val: string) {
    setSearch(val)
    setPage(0)
  }
  function handleStatusFilter(val: StatusFilter) {
    setStatusFilter(val)
    setPage(0)
  }

  const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ]

  return (
    <DashboardLayout>
      <PageHeader
        title="Members Directory"
        description={`${members.filter(m => m.status === 'active').length} active members`}
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-linear-to-r from-primary to-primary-container text-on-primary font-label font-semibold px-4 py-2 rounded-md hover:opacity-95 transition-opacity text-sm"
          >
            <span className="material-symbols-outlined text-[18px] leading-none">person_add</span>
            Add Member
          </button>
        }
      />

      <div className="px-8 py-6 space-y-4">
        {/* Search + Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-55">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search by name, code or email…"
              className="w-full bg-surface-highest border-none rounded-lg pl-9 pr-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-1 bg-surface-container rounded-lg p-1">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => handleStatusFilter(f.value)}
                className={cn(
                  'px-3 py-1.5 rounded text-xs font-label font-medium transition-colors',
                  statusFilter === f.value
                    ? 'bg-white text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* BOD filter */}
          <button
            onClick={() => { setBodOnly(!bodOnly); setPage(0) }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-label font-medium border transition-colors',
              bodOnly
                ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant border-tertiary-fixed'
                : 'bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container'
            )}
          >
            <span className="material-symbols-outlined text-[14px] leading-none">verified</span>
            BOD Only
          </button>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[72px_1fr_200px_130px_90px] gap-4 px-5 pb-1">
          {['Code', 'Member', 'Contact', 'Joined', 'Status'].map(h => (
            <span key={h} className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide last:text-right">
              {h}
            </span>
          ))}
        </div>

        {/* Member rows */}
        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)
          ) : paged.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="material-symbols-outlined text-4xl text-outline">inbox</span>
              <p className="text-sm text-on-surface-variant">No records found</p>
            </div>
          ) : (
            paged.map(m => <MemberRow key={m.id} member={m} />)
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-on-surface-variant">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
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
              <span className="text-xs text-on-surface-variant px-2">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-label text-on-surface-variant border border-outline-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <span className="material-symbols-outlined text-[14px] leading-none">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <AddMemberModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={fetchMembers}
      />
    </DashboardLayout>
  )
}
