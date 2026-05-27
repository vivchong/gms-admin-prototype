import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  Trophy,
  ClipboardList,
  FileCheck,
  CreditCard,
  FileText,
  Megaphone,
  Users,
  Settings,
  History,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', icon: LayoutGrid, path: '/' },
  { label: 'Sports', icon: Trophy, path: '/sports' },
  { label: 'Registrations', icon: ClipboardList, path: '/registrations' },
  { label: 'Document Review', icon: FileCheck, path: '/document-review' },
  { label: 'Refunds & Payments', icon: CreditCard, path: '/refunds' },
  { label: 'Indemnity', icon: FileText, path: '/indemnity' },
  { label: 'Comms', icon: Megaphone, path: '/comms' },
  { label: 'Roles & Access', icon: Users, path: '/roles' },
  { label: 'Settings', icon: Settings, path: '/settings' },
  { label: 'Audit log', icon: History, path: '/audit-log' },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const currentPath = location.pathname

  return (
    <aside className="w-56 bg-neutral-100 border-r border-neutral-200 flex flex-col py-3 flex-shrink-0">
      <nav className="flex flex-col gap-0.5 px-2">
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? currentPath === '/'
              : currentPath.startsWith(item.path)

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors',
                isActive
                  ? 'bg-neutral-200 text-neutral-900 font-medium'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'
              )}
            >
              <item.icon className={cn('w-4.5 h-4.5', isActive ? 'text-neutral-900' : 'text-neutral-400')} />
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
