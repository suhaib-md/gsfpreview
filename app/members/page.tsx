import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/layout/PageHeader'

export default function MembersPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Members Directory"
        description="All Foundation members"
      />
      <div className="px-8 py-6">
        <div className="bg-surface-lowest rounded-xl border border-outline-variant/20 shadow-sm p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-outline mb-3 block">group</span>
          <p className="text-on-surface-variant text-sm">Members directory coming in Phase 3</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
