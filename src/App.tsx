import { HashRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { Sports } from '@/pages/Sports'
import { CreateSport } from '@/pages/CreateSport'
import { SportDetail } from '@/pages/SportDetail'
import { CreateEvent } from '@/pages/CreateEvent'
import { EventDetail } from '@/pages/EventDetail'
import { Registrations } from '@/pages/Registrations'
import { DocumentReview } from '@/pages/DocumentReview'
import { SettingsPage } from '@/pages/Settings'
import {
  RefundsPayments,
  Indemnity,
  Comms,
  RolesAccess,
  AuditLog,
} from '@/pages/Placeholder'
import { NotFound } from '@/pages/NotFound'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/sports/new" element={<CreateSport />} />
          <Route path="/sports/:sportId" element={<SportDetail />} />
          <Route path="/sports/:sportId/events/new" element={<CreateEvent />} />
          <Route path="/sports/:sportId/events/:eventId" element={<EventDetail />} />
          <Route path="/registrations" element={<Registrations />} />
          <Route path="/document-review" element={<DocumentReview />} />
          <Route path="/refunds" element={<RefundsPayments />} />
          <Route path="/indemnity" element={<Indemnity />} />
          <Route path="/comms" element={<Comms />} />
          <Route path="/roles" element={<RolesAccess />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/audit-log" element={<AuditLog />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" />
    </HashRouter>
  )
}
