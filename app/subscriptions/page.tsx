'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/layout/PageHeader'
import MatrixCell from '@/components/subscriptions/MatrixCell'
import LogSubscriptionModal from '@/components/modals/LogSubscriptionModal'
import { supabase } from '@/lib/supabase'
import { cn, FY_MONTH_LABELS, FY_MONTHS, getSubscriptionBadgeClass } from '@/lib/utils'
import type { Member, Subscription } from '@/types'

const FY_OPTIONS = [
  { label: '2023–24', startYear: 2023 },
  { label: '2024–25', startYear: 2024 },
  { label: '2025–26', startYear: 2025 },
]

interface Prefill {
  memberId: string
  memberName: string
  month: number
  year: number
}

function MatrixSkeleton() {
  return (
    <div className="animate-pulse space-y-2 p-4">
      <div className="h-8 bg-surface-container rounded w-full" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-12 bg-surface-container rounded w-full" />
      ))}
    </div>
  )
}

export default function SubscriptionsPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [fyStartYear, setFyStartYear] = useState(() => {
    const now = new Date()
    return now.getMonth() + 1 >= 6 ? now.getFullYear() : now.getFullYear() - 1
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [prefill, setPrefill] = useState<Prefill | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const years = [fyStartYear, fyStartYear + 1]
    const [membersRes, subsRes] = await Promise.all([
      supabase.from('members').select('*').eq('status', 'active').order('code'),
      supabase.from('subscriptions').select('*').in('year', years),
    ])
    setMembers((membersRes.data ?? []) as Member[])
    setSubscriptions((subsRes.data ?? []) as Subscription[])
    setLoading(false)
  }, [fyStartYear])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const subMap = new Map<string, Subscription>()
  subscriptions.forEach(s => subMap.set(`${s.member_id}|${s.month}|${s.year}`, s))

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  function handleCellClick(member: Member, month: number, year: number) {
    setPrefill({ memberId: member.id, memberName: member.name, month, year })
    setModalOpen(true)
  }

  const paidCount = subscriptions.filter(s => s.status === 'paid').length
  const dueCount = subscriptions.filter(s => s.status === 'due').length
  const totalCells = members.length * FY_MONTHS.length

  return (
    <DashboardLayout>
      <PageHeader
        title="Subscription Tracker"
        description={`Monthly subscription status — FY ${FY_OPTIONS.find(o => o.startYear === fyStartYear)?.label ?? ''}`}
        actions={
          <button
            onClick={() => toast.info('Feature coming in the full version')}
            className="flex items-center gap-2 bg-surface-container text-on-surface-variant font-label font-medium px-3 py-2 rounded-md hover:bg-surface-high transition-colors text-xs border border-outline-variant"
          >
            <span className="material-symbols-outlined text-[16px] leading-none">check_circle</span>
            <span className="hidden sm:inline">Mark all as paid</span>
            <span className="sm:hidden">Mark all</span>
          </button>
        }
      />

      <div className="px-4 py-4 md:px-8 md:py-6 space-y-4">
        {/* FY Selector + summary chips */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-surface-container rounded-lg p-1">
            {FY_OPTIONS.map(opt => (
              <button
                key={opt.startYear}
                onClick={() => setFyStartYear(opt.startYear)}
                className={cn(
                  'px-3 py-1.5 rounded text-xs font-label font-medium transition-colors',
                  fyStartYear === opt.startYear
                    ? 'bg-white text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {!loading && (
            <div className="flex items-center gap-2 text-xs text-on-surface-variant flex-wrap">
              <span className="px-2 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label font-medium">
                {paidCount} paid
              </span>
              <span className="px-2 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label font-medium">
                {dueCount} due
              </span>
              <span className="hidden sm:inline text-outline">·</span>
              <span className="hidden sm:inline">{totalCells} total cells</span>
            </div>
          )}
        </div>

        {/* Matrix card */}
        <div className="bg-surface-lowest rounded-xl border border-outline-variant/20 shadow-sm">
          {loading ? (
            <MatrixSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0">
                {/* Header */}
                <thead>
                  <tr>
                    <th className="sticky left-0 z-20 bg-surface-low px-3 md:px-5 py-3 text-left text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide rounded-tl-xl min-w-36 md:min-w-48 border-b border-outline-variant/15">
                      Member
                    </th>
                    {FY_MONTH_LABELS.map((label, i) => (
                      <th
                        key={i}
                        className="px-1 py-3 text-center text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide min-w-11 border-b border-outline-variant/15 last:rounded-tr-xl"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Body */}
                <tbody>
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="px-5 py-12 text-center">
                        <span className="material-symbols-outlined text-3xl text-outline block mb-2">inbox</span>
                        <p className="text-sm text-on-surface-variant">No active members found</p>
                      </td>
                    </tr>
                  ) : (
                    members.map((member, rowIdx) => (
                      <tr
                        key={member.id}
                        className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-surface-low/30'}
                      >
                        {/* Sticky member name cell */}
                        <td
                          className={cn(
                            'sticky left-0 z-10 px-3 md:px-5 py-2.5 border-b border-outline-variant/10',
                            rowIdx % 2 === 0 ? 'bg-white' : 'bg-surface-low/30'
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                              <span className="text-on-primary-container text-[8px] md:text-[9px] font-bold">
                                {member.name.split(' ').slice(0,2).map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-label font-semibold text-on-surface truncate max-w-20 md:max-w-none">
                                  {member.name.split(' ')[0]}
                                  <span className="hidden md:inline"> {member.name.split(' ').slice(1).join(' ')}</span>
                                </span>
                                {member.is_bod && (
                                  <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed-variant shrink-0 hidden sm:inline">
                                    BOD
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] md:text-[10px] text-outline font-mono">#{member.code}</span>
                            </div>
                          </div>
                        </td>

                        {/* Month cells */}
                        {FY_MONTHS.map((month, colIdx) => {
                          const subYear = month >= 6 ? fyStartYear : fyStartYear + 1
                          const sub = subMap.get(`${member.id}|${month}|${subYear}`) ?? null
                          const isFuture =
                            subYear > currentYear ||
                            (subYear === currentYear && month > currentMonth)
                          const isCurrent =
                            subYear === currentYear && month === currentMonth

                          return (
                            <td
                              key={colIdx}
                              className="px-0.5 md:px-1 py-2 text-center border-b border-outline-variant/10"
                            >
                              <div className="flex justify-center">
                                <MatrixCell
                                  subscription={sub}
                                  member={member}
                                  month={month}
                                  year={subYear}
                                  isFuture={isFuture}
                                  isCurrent={isCurrent}
                                  onClickDueOrEmpty={handleCellClick}
                                />
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Legend */}
          {!loading && (
            <div className="px-4 md:px-5 py-3 border-t border-outline-variant/15 flex items-center gap-3 md:gap-5 flex-wrap">
              <p className="text-xs text-on-surface-variant font-label font-medium mr-1">Legend:</p>
              {[
                { text: 'P', label: 'Paid',           cls: getSubscriptionBadgeClass('paid'),  size: 'text-[11px]' },
                { text: 'D', label: 'Due',            cls: getSubscriptionBadgeClass('due'),   size: 'text-[11px]' },
                { text: 'N/A', label: 'Not Applicable', cls: getSubscriptionBadgeClass('na'),  size: 'text-[9px]' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className={cn('w-7 h-7 rounded flex items-center justify-center font-bold', item.size, item.cls)}>
                    {item.text}
                  </div>
                  <span className="text-xs text-on-surface-variant">{item.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-outline-variant/30" />
                </div>
                <span className="text-xs text-on-surface-variant">Future / No data</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <LogSubscriptionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setPrefill(null) }}
        onSaved={() => { setModalOpen(false); setPrefill(null); fetchData() }}
        prefillMemberId={prefill?.memberId}
        prefillMemberName={prefill?.memberName}
        prefillMonth={prefill?.month}
        prefillYear={prefill?.year}
      />
    </DashboardLayout>
  )
}
