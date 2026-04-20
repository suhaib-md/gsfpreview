import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/layout/PageHeader'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard"
        description="Foundation financial overview"
      />
      <div className="px-8 py-6">
        <div className="bg-surface-lowest rounded-xl border border-outline-variant/20 shadow-sm p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-outline mb-3 block">dashboard</span>
          <p className="text-on-surface-variant text-sm">Dashboard content coming in Phase 2</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
