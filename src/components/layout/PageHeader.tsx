import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type Breadcrumb = {
  label: string
  path?: string
}

type PageHeaderProps = {
  title: string
  subtitle?: string
  breadcrumbs?: Breadcrumb[]
  actions?: React.ReactNode
  extra?: React.ReactNode
}

export function PageHeader({ title, subtitle, breadcrumbs, actions, extra }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-neutral-500 mb-2">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
              {crumb.path ? (
                <button
                  onClick={() => navigate(crumb.path!)}
                  className="hover:text-neutral-900 transition-colors"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-neutral-900 font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {extra}
    </div>
  )
}
