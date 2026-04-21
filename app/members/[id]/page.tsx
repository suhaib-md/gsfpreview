'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import SubscriptionHistoryGrid from '@/components/members/SubscriptionHistoryGrid'
import { supabase } from '@/lib/supabase'
import { cn, formatCurrency, formatDate, getInitials } from '@/lib/utils'
import type { Donation, Member, Subscription } from '@/types'

interface ProfileData {
  member: Member
  subscriptions: Subscription[]
  donations: Donation[]
}

function ProfileSkeleton() {
  return (
    <div className="px-4 py-4 md:px-8 md:py-6 animate-pulse">
      <div className="flex flex-col lg:grid lg:grid-cols-[288px_1fr] gap-5">
        <div className="bg-white rounded-xl border border-outline-variant/20 shadow-sm p-6 space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-surface-container" />
            <div className="h-4 bg-surface-container rounded w-32" />
            <div className="h-3 bg-surface-container rounded w-20" />
          </div>
          <div className="space-y-2 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-3 bg-surface-container rounded w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-outline-variant/20 shadow-sm p-4 h-20 bg-surface-container" />
            ))}
          </div>
          <div className="bg-white rounded-xl border border-outline-variant/20 shadow-sm p-5 h-40 bg-surface-container" />
        </div>
      </div>
    </div>
  )
}

export default function MemberProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function fetchData() {
      const [memberRes, subRes, donRes] = await Promise.all([
        supabase.from('members').select('*').eq('id', id).single(),
        supabase
          .from('subscriptions')
          .select('*')
          .eq('member_id', id)
          .order('year', { ascending: false })
          .order('month', { ascending: false }),
        supabase
          .from('donations')
          .select('*')
          .eq('member_id', id)
          .order('date', { ascending: false })
          .limit(10),
      ])
      if (memberRes.data) {
        setData({
          member: memberRes.data as Member,
          subscriptions: (subRes.data ?? []) as Subscription[],
          donations: (donRes.data ?? []) as Donation[],
        })
      }
      setLoading(false)
    }
    fetchData()
  }, [id])

  // Current FY
  const nowDate = new Date()
  const currentFyStartYear = nowDate.getMonth() + 1 >= 6 ? nowDate.getFullYear() : nowDate.getFullYear() - 1

  const totalContributed =
    data?.subscriptions
      .filter(s => s.status === 'paid')
      .reduce((sum, s) => sum + s.amount, 0) ?? 0

  const outstandingDues =
    data?.subscriptions
      .filter(s => s.status === 'due')
      .reduce((sum, s) => sum + s.amount, 0) ?? 0

  return (
    <DashboardLayout>
      {/* Back header */}
      <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm border-b border-outline-variant/20 px-4 md:px-8 py-4">
        <button
          onClick={() => router.push('/members')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] leading-none">arrow_back</span>
          <span className="text-sm font-label font-medium">Members</span>
        </button>
      </div>

      {loading ? (
        <ProfileSkeleton />
      ) : !data ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <span className="material-symbols-outlined text-4xl text-outline">person_off</span>
          <p className="text-sm text-on-surface-variant">Member not found</p>
        </div>
      ) : (
        <div className="px-4 py-4 md:px-8 md:py-6">
          <div className="flex flex-col lg:grid lg:grid-cols-[288px_1fr] gap-5 items-start">

            {/* ── Left: Profile identity card ── */}
            <div className="bg-white rounded-xl border border-outline-variant/20 shadow-sm p-6 lg:sticky lg:top-24">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center mb-5">
                <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-3">
                  <span className="text-on-primary-container font-headline font-bold text-xl">
                    {getInitials(data.member.name)}
                  </span>
                </div>
                <h2 className="font-headline font-bold text-on-surface text-base leading-tight">
                  {data.member.name}
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5 font-mono">
                  #{data.member.code}
                </p>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap justify-center">
                  <span
                    className={cn(
                      'text-xs px-2.5 py-0.5 rounded-full font-label font-medium',
                      data.member.status === 'active'
                        ? 'bg-primary-fixed text-on-primary-fixed-variant'
                        : 'bg-secondary-container text-on-secondary-container'
                    )}
                  >
                    {data.member.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                  {data.member.is_bod && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant">
                      BOD
                    </span>
                  )}
                </div>
                {data.member.bod_designation && (
                  <p className="text-xs text-on-surface-variant mt-1.5 font-medium">
                    {data.member.bod_designation}
                  </p>
                )}
              </div>

              <div className="h-px bg-outline-variant/20 mb-4" />

              {/* Contact details */}
              <div className="space-y-2.5">
                {data.member.email && (
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[16px] text-outline mt-0.5 shrink-0">mail</span>
                    <span className="text-xs text-on-surface break-all">{data.member.email}</span>
                  </div>
                )}
                {data.member.phone && (
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[16px] text-outline shrink-0">phone</span>
                    <span className="text-xs text-on-surface">{data.member.phone}</span>
                  </div>
                )}
                {data.member.address && (
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[16px] text-outline mt-0.5 shrink-0">location_on</span>
                    <span className="text-xs text-on-surface">{data.member.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[16px] text-outline shrink-0">calendar_today</span>
                  <span className="text-xs text-on-surface-variant">
                    Joined {formatDate(data.member.join_date)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Right: KPIs + History + Donations ── */}
            <div className="space-y-5 w-full">
              {/* KPI row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                {[
                  {
                    label: 'Total Contributed',
                    value: formatCurrency(totalContributed),
                    accent: 'bg-primary',
                    sub: 'Subscriptions paid',
                  },
                  {
                    label: 'Outstanding Dues',
                    value: formatCurrency(outstandingDues),
                    accent: 'bg-error-container',
                    sub: outstandingDues > 0 ? 'Pending payment' : 'All clear',
                  },
                  {
                    label: 'Total Donations',
                    value: formatCurrency(
                      data.donations.reduce((sum, d) => sum + d.amount, 0)
                    ),
                    accent: 'bg-primary-fixed-dim',
                    sub: `${data.donations.length} donation${data.donations.length !== 1 ? 's' : ''}`,
                  },
                ].map(kpi => (
                  <div
                    key={kpi.label}
                    className="relative bg-white rounded-xl border border-outline-variant/20 shadow-sm p-4 overflow-hidden"
                  >
                    <div className={`absolute top-0 left-0 w-full h-1 ${kpi.accent}`} />
                    <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wide mt-1 mb-1.5">
                      {kpi.label}
                    </p>
                    <p className="font-headline font-bold text-xl text-on-surface">{kpi.value}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{kpi.sub}</p>
                  </div>
                ))}
              </div>

              {/* Subscription history */}
              <div className="bg-white rounded-xl border border-outline-variant/20 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-label font-semibold text-on-surface text-sm">
                      Subscription History
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      FY {currentFyStartYear}–{String(currentFyStartYear + 1).slice(-2)} (Jun–May)
                    </p>
                  </div>
                </div>
                <SubscriptionHistoryGrid
                  subscriptions={data.subscriptions}
                  fyStartYear={currentFyStartYear}
                />
              </div>

              {/* Recent donations */}
              <div className="bg-white rounded-xl border border-outline-variant/20 shadow-sm">
                <div className="px-5 py-4 border-b border-outline-variant/15">
                  <p className="font-label font-semibold text-on-surface text-sm">Donations</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Hadiya, Zakat &amp; other contributions</p>
                </div>
                {data.donations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <span className="material-symbols-outlined text-3xl text-outline">inbox</span>
                    <p className="text-sm text-on-surface-variant">No donations recorded</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-surface-low">
                          <th className="text-left px-4 py-2.5 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide">Date</th>
                          <th className="text-left px-4 py-2.5 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide">Type</th>
                          <th className="text-left px-4 py-2.5 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide hidden sm:table-cell">Category</th>
                          <th className="text-right px-4 py-2.5 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.donations.map((d, i) => (
                          <tr
                            key={d.id}
                            className={`hover:bg-surface-high/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-surface-low/40'}`}
                          >
                            <td className="px-4 py-3 text-xs text-on-surface-variant whitespace-nowrap">
                              {formatDate(d.date)}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label font-medium capitalize">
                                {d.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-on-surface-variant capitalize hidden sm:table-cell">
                              {d.category}
                            </td>
                            <td className="px-4 py-3 text-right text-xs font-label font-medium text-primary whitespace-nowrap">
                              +{formatCurrency(d.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
