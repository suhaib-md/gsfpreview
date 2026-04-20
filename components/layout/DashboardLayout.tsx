'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import { QuickActionProvider, useQuickAction } from './QuickActionContext'
import LogSubscriptionModal from '@/components/modals/LogSubscriptionModal'
import LogDonationModal from '@/components/modals/LogDonationModal'
import LogExpenseModal from '@/components/modals/LogExpenseModal'

function LayoutContent({ children }: { children: ReactNode }) {
  const { activeModal, closeModal } = useQuickAction()
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="ml-72 flex-1 overflow-y-auto min-h-screen">
        {children}
      </main>
      <LogSubscriptionModal open={activeModal === 'subscription'} onClose={closeModal} />
      <LogDonationModal    open={activeModal === 'donation'}     onClose={closeModal} />
      <LogExpenseModal     open={activeModal === 'expense'}      onClose={closeModal} />
    </div>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('gsf_demo_authed') !== 'true') {
      router.replace('/login')
    } else {
      setAuthed(true)
    }
  }, [router])

  if (!authed) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <QuickActionProvider>
      <LayoutContent>{children}</LayoutContent>
    </QuickActionProvider>
  )
}
