'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useQuickAction } from './QuickActionContext'

const NAV_ITEMS = [
  { label: 'Dashboard',     icon: 'dashboard',       href: '/dashboard' },
  { label: 'Members',       icon: 'group',            href: '/members' },
  { label: 'Subscriptions', icon: 'calendar_month',   href: '/subscriptions' },
  { label: 'Ledger',        icon: 'receipt_long',     href: '/ledger' },
] as const

interface Props {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const { openModal } = useQuickAction()

  function handleSignOut() {
    localStorage.removeItem('gsf_demo_authed')
    router.push('/login')
  }

  function handleNavClick() {
    onClose?.()
  }

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-72 bg-[#f8f9fa] shadow-[32px_0_64px_-20px_rgba(0,0,0,0.04)] flex flex-col z-40 border-r border-outline-variant/10 transition-transform duration-300',
          // Desktop: always visible. Mobile: slide in/out.
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo area */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
              <span className="text-on-primary-container font-headline font-extrabold text-sm">GS</span>
            </div>
            <div className="min-w-0">
              <p className="font-headline font-extrabold text-[#004235] text-sm leading-tight truncate">
                Project GSF
              </p>
              <p className="text-xs text-on-surface-variant leading-tight">Financial Integrity</p>
            </div>
          </div>
        </div>

        <div className="px-3 py-1">
          <div className="h-px bg-outline-variant/20" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-label transition-all duration-150',
                  isActive
                    ? 'bg-emerald-100/50 text-[#004235] font-semibold translate-x-1'
                    : 'text-on-surface-variant hover:bg-emerald-50 hover:text-emerald-900'
                )}
              >
                <span
                  className="material-symbols-outlined text-[20px] leading-none shrink-0"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-5 space-y-2">
          <div className="h-px bg-outline-variant/20 mb-3" />

          {/* Quick Action */}
          <button
            onClick={() => { openModal('subscription'); onClose?.() }}
            className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-primary to-primary-container text-on-primary font-label font-semibold px-4 py-2.5 rounded-md hover:opacity-95 transition-opacity text-sm"
          >
            <span className="material-symbols-outlined text-[18px] leading-none">add</span>
            Log Transaction
          </button>

          {/* Support + Sign Out */}
          <div className="flex items-center gap-1 px-1">
            <button className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[16px] leading-none">help</span>
              Support
            </button>
            <div className="flex-1" />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-on-surface-variant hover:text-error transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] leading-none">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
