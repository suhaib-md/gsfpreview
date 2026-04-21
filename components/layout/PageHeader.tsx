import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm border-b border-outline-variant/20 px-4 md:px-8 py-3 md:py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-headline font-bold text-lg md:text-xl text-on-surface leading-tight">{title}</h1>
          {description && (
            <p className="text-xs md:text-sm text-on-surface-variant mt-0.5 truncate">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
