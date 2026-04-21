'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Sidebar from './Sidebar'
import { QuickActionProvider, useQuickAction } from './QuickActionContext'
import LogTransactionModal, { type TransactionType } from '@/components/modals/LogTransactionModal'

function LayoutContent({ children }: { children: ReactNode }) {
  const { activeModal, closeModal } = useQuickAction()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const typeMap: Record<NonNullable<typeof activeModal>, TransactionType> = {
    subscription: 'subscription',
    donation: 'donation',
    expense: 'expense',
  }

  return (
    <div className="flex min-h-screen bg-surface overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col md:ml-72 min-h-screen min-w-0">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-surface/95 backdrop-blur-sm border-b border-outline-variant/20 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[22px] text-on-surface-variant">menu</span>
          </button>
          <div className="flex items-center gap-2.5">
            <Image src="/gsf-logo-def.jpeg" alt="GSF Logo" width={28} height={28} className="rounded-full shrink-0" />
            <span className="font-headline font-extrabold text-[#004235] text-sm">Project GSF</span>
          </div>
        </div>

        <main className="flex-1">
          {children}
        </main>
      </div>

      <LogTransactionModal
        open={activeModal !== null}
        initialType={activeModal ? typeMap[activeModal] : 'subscription'}
        onClose={closeModal}
        onSaved={() => window.location.reload()}
      />
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
