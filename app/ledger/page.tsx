import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/layout/PageHeader'

export default function LedgerPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="General Ledger"
        description="All Foundation transactions"
      />
      <div className="px-8 py-6">
        <div className="bg-surface-lowest rounded-xl border border-outline-variant/20 shadow-sm p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-outline mb-3 block">receipt_long</span>
          <p className="text-on-surface-variant text-sm">General ledger coming in Phase 5</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
