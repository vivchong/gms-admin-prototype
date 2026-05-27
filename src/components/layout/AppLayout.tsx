import { Outlet } from 'react-router-dom'
import { GovHeader } from './GovHeader'
import { AppHeader } from './AppHeader'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export function AppLayout() {
  useKeyboardShortcuts()

  return (
    <div className="min-h-screen flex flex-col">
      <GovHeader />
      <AppHeader />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-neutral-50 flex flex-col">
          <div className="flex-1 p-8">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
