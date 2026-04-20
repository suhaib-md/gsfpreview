import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/layout/PageHeader'

export default function SubscriptionsPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Subscription Tracker"
        description="Monthly subscription status for all members"
      />
      <div className="px-8 py-6">
        <div className="bg-surface-lowest rounded-xl border border-outline-variant/20 shadow-sm p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-outline mb-3 block">calendar_month</span>
          <p className="text-on-surface-variant text-sm">Subscription tracker coming in Phase 4</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
