'use client'

import { useCallback, useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/layout/PageHeader'
import KpiCard from '@/components/dashboard/KpiCard'
import DonationBreakdownChart from '@/components/dashboard/DonationBreakdownChart'
import ExpenseAllocationChart from '@/components/dashboard/ExpenseAllocationChart'
import CollectionRateChart from '@/components/dashboard/CollectionRateChart'
import RecentActivityTable from '@/components/dashboard/RecentActivityTable'
import LogTransactionModal from '@/components/modals/LogTransactionModal'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import type { LedgerEntry } from '@/types'

const MEDICAL_FUND = 120000 // hardcoded per spec — no dedicated table

interface DashboardData {
  generalBalance: number
  zakatBalance: number
  totalDues: number
  dueMemberCount: number
  recentEntries: LedgerEntry[]
}

function KpiSkeleton() {
  return (
    <div className="relative bg-surface-lowest rounded-xl border border-outline-variant/20 shadow-sm p-5 overflow-hidden animate-pulse">
      <div className="absolute top-0 left-0 w-full h-1 bg-surface-container" />
      <div className="pt-1 space-y-2">
        <div className="h-3 bg-surface-container rounded w-24" />
        <div className="h-7 bg-surface-container rounded w-32" />
        <div className="h-3 bg-surface-container rounded w-20" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [txOpen, setTxOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [ledgerRes, recentRes, duesRes] = await Promise.all([
      supabase.from('ledger_entries').select('account, amount'),
      supabase
        .from('ledger_entries')
        .select('*')
        .order('date', { ascending: false })
        .limit(5),
      supabase
        .from('subscriptions')
        .select('amount, member_id')
        .eq('status', 'due'),
    ])

    const entries = ledgerRes.data ?? []
    const generalBalance = entries
      .filter(e => e.account === 'general')
      .reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)
    const zakatBalance = entries
      .filter(e => e.account === 'zakat')
      .reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)

    const dueEntries = duesRes.data ?? []
    const totalDues = dueEntries.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)
    const dueMemberCount = new Set(dueEntries.map((e: { member_id: string }) => e.member_id)).size

    setData({
      generalBalance,
      zakatBalance,
      totalDues,
      dueMemberCount,
      recentEntries: (recentRes.data ?? []) as LedgerEntry[],
    })
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])


  const totalFunds = (data?.generalBalance ?? 0) + (data?.zakatBalance ?? 0) + MEDICAL_FUND

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard"
        description="Foundation financial overview"
      />

      <div className="px-8 py-6 space-y-6">
        {/* Quick Action */}
        <div>
          <button
            onClick={() => setTxOpen(true)}
            className="flex items-center gap-2 bg-linear-to-r from-primary to-primary-container text-on-primary font-label font-semibold px-5 py-2.5 rounded-md hover:opacity-95 transition-opacity text-sm"
          >
            <span className="material-symbols-outlined text-[18px] leading-none">add_circle</span>
            Log Transaction
          </button>
        </div>

        {/* KPI Bento Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Row 1 */}
          {loading ? (
            <>
              <div className="col-span-2"><KpiSkeleton /></div>
              <KpiSkeleton />
            </>
          ) : (
            <>
              <div className="col-span-2">
                <KpiCard
                  label="Total Foundation Funds"
                  value={formatCurrency(totalFunds)}
                  trend="+4.2%"
                  trendPositive
                  sublabel="General · Zakat · Medical reserves"
                  accentClass="bg-primary"
                  heroSize
                />
              </div>
              <KpiCard
                label="General Account"
                value={formatCurrency(data!.generalBalance)}
                sublabel={`${Math.round((data!.generalBalance / totalFunds) * 100)}% of total`}
                accentClass="bg-secondary-fixed"
              />
            </>
          )}

          {/* Row 2 */}
          {loading ? (
            <>
              <KpiSkeleton />
              <KpiSkeleton />
              <KpiSkeleton />
            </>
          ) : (
            <>
              <KpiCard
                label="Zakat Account"
                value={formatCurrency(data!.zakatBalance)}
                sublabel="Restricted — GFES fund"
                accentClass="bg-tertiary-fixed"
              />
              <KpiCard
                label="Medical Fund Pool"
                value={formatCurrency(MEDICAL_FUND)}
                sublabel="Emergency reserves"
                accentClass="bg-primary-fixed-dim"
              />
              <KpiCard
                label="Outstanding Dues"
                value={formatCurrency(data!.totalDues)}
                sublabel={`From ${data!.dueMemberCount} member${data!.dueMemberCount !== 1 ? 's' : ''}`}
                trendPositive={false}
                accentClass="bg-error-container"
              />
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-4">
          <DonationBreakdownChart />
          <ExpenseAllocationChart />
          <CollectionRateChart />
        </div>

        {/* Recent Ledger Activity */}
        <div className="bg-surface-lowest rounded-xl border border-outline-variant/20 shadow-sm">
          <div className="px-5 py-4 border-b border-outline-variant/15">
            <p className="font-label font-semibold text-on-surface text-sm">Recent Ledger Activity</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Last 5 transactions</p>
          </div>
          {loading ? (
            <div className="p-5 space-y-3 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-4 bg-surface-container rounded w-20" />
                  <div className="h-4 bg-surface-container rounded flex-1" />
                  <div className="h-4 bg-surface-container rounded w-16" />
                  <div className="h-4 bg-surface-container rounded w-20" />
                </div>
              ))}
            </div>
          ) : (
            <RecentActivityTable entries={data?.recentEntries ?? []} />
          )}
        </div>
      </div>

      <LogTransactionModal
        open={txOpen}
        onClose={() => setTxOpen(false)}
        onSaved={() => { setTxOpen(false); fetchData() }}
      />
    </DashboardLayout>
  )
}
