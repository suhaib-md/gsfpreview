'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
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
    <div className="bg-white rounded-xl border border-outline-variant/20 shadow-sm px-4 py-3.5 md:px-5 md:py-4 animate-pulse">
      <div className="flex items-center gap-3 md:hidden">
        <div className="w-9 h-9 rounded-full bg-surface-container shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-surface-container rounded w-32" />
          <div className="h-2.5 bg-surface-container rounded w-16" />
        </div>
        <div className="h-6 bg-surface-container rounded-full w-14" />
      </div>
      <div className="hidden md:grid grid-cols-[72px_1fr_200px_130px_90px_72px] items-center gap-4">
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
        <div className="h-6 bg-surface-container rounded w-12 ml-auto" />
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
  const [modalMember, setModalMember] = useState<Member | null | undefined>(undefined)
  // undefined = closed, null = add new, Member = edit
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteBlocked, setDeleteBlocked] = useState(false)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('members').select('*').order('code')
    setMembers((data ?? []) as Member[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    if (q && !m.name.toLowerCase().includes(q) && !m.code.includes(q) && !(m.email?.toLowerCase().includes(q)))
      return false
    if (statusFilter !== 'all' && m.status !== statusFilter) return false
    if (bodOnly && !m.is_bod) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function handleSearchChange(val: string) { setSearch(val); setPage(0) }
  function handleStatusFilter(val: StatusFilter) { setStatusFilter(val); setPage(0) }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await supabase.from('members').delete().eq('id', deleteTarget.id)
    setDeleting(false)
    if (error) {
      setDeleteBlocked(true)
    } else {
      toast.success(`${deleteTarget.name} removed from members.`)
      setDeleteTarget(null)
      setDeleteBlocked(false)
      fetchMembers()
    }
  }

  async function handleMarkInactive() {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await supabase.from('members').update({ status: 'inactive' }).eq('id', deleteTarget.id)
    setDeleting(false)
    if (error) {
      toast.error('Failed to update member status.')
    } else {
      toast.success(`${deleteTarget.name} marked as inactive.`)
      setDeleteTarget(null)
      setDeleteBlocked(false)
      fetchMembers()
    }
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
            onClick={() => setModalMember(null)}
            className="flex items-center gap-2 bg-linear-to-r from-primary to-primary-container text-on-primary font-label font-semibold px-4 py-2 rounded-md hover:opacity-95 transition-opacity text-sm"
          >
            <span className="material-symbols-outlined text-[18px] leading-none">person_add</span>
            <span className="hidden sm:inline">Add Member</span>
            <span className="sm:hidden">Add</span>
          </button>
        }
      />

      <div className="px-4 py-4 md:px-8 md:py-6 space-y-4">
        {/* Search + Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
          <div className="relative flex-1 min-w-0">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">search</span>
            <input
              type="text"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search by name, code or email…"
              className="w-full bg-surface-highest border-none rounded-lg pl-9 pr-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
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
        </div>

        {/* Table header — desktop only */}
        <div className="hidden md:grid grid-cols-[72px_1fr_200px_130px_90px_72px] gap-4 px-5 pb-1">
          {['Code', 'Member', 'Contact', 'Joined', 'Status', ''].map((h, i) => (
            <span key={i} className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide last:text-right">
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
            paged.map(m => (
              <MemberRow
                key={m.id}
                member={m}
                onEdit={member => setModalMember(member)}
                onDelete={member => setDeleteTarget(member)}
              />
            ))
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
              <span className="text-xs text-on-surface-variant px-2">{page + 1} / {totalPages}</span>
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

      {/* Add / Edit modal */}
      <AddMemberModal
        open={modalMember !== undefined}
        member={modalMember ?? undefined}
        onClose={() => setModalMember(undefined)}
        onSaved={fetchMembers}
      />

      {/* Delete confirmation overlay */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-outline-variant/20 p-6 max-w-sm w-full">
            {!deleteBlocked ? (
              <>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-error">delete</span>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-on-surface text-base">Delete Member</h3>
                    <p className="text-sm text-on-surface-variant mt-1">
                      Remove <span className="font-semibold text-on-surface">{deleteTarget.name}</span> (#{deleteTarget.code}) permanently? This cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => { setDeleteTarget(null); setDeleteBlocked(false) }}
                    disabled={deleting}
                    className="text-sm font-label text-on-surface-variant hover:text-on-surface transition-colors px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-2 bg-error text-white font-label font-semibold px-5 py-2.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-60 text-sm"
                  >
                    {deleting ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <span className="material-symbols-outlined text-[16px] leading-none">delete</span>}
                    {deleting ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-on-tertiary-fixed-variant">link</span>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-on-surface text-base">Cannot Delete</h3>
                    <p className="text-sm text-on-surface-variant mt-1">
                      <span className="font-semibold text-on-surface">{deleteTarget.name}</span> has linked subscriptions or ledger records. Financial history must be preserved.
                    </p>
                  </div>
                </div>
                <div className="bg-surface-container rounded-lg px-4 py-3 mb-4">
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    <span className="font-semibold text-on-surface">Recommended:</span> Mark this member as <span className="font-semibold">Inactive</span> instead. Their records remain in the ledger but they won't appear in active member views.
                  </p>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => { setDeleteTarget(null); setDeleteBlocked(false) }}
                    disabled={deleting}
                    className="text-sm font-label text-on-surface-variant hover:text-on-surface transition-colors px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMarkInactive}
                    disabled={deleting}
                    className="flex items-center gap-2 bg-linear-to-r from-primary to-primary-container text-on-primary font-label font-semibold px-5 py-2.5 rounded-md hover:opacity-95 transition-opacity disabled:opacity-60 text-sm"
                  >
                    {deleting ? <span className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" /> : <span className="material-symbols-outlined text-[16px] leading-none">person_off</span>}
                    {deleting ? 'Updating…' : 'Mark as Inactive'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
