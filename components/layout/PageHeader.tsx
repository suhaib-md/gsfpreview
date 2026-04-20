import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm border-b border-outline-variant/20 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline font-bold text-xl text-on-surface">{title}</h1>
          {description && (
            <p className="text-sm text-on-surface-variant mt-0.5">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
