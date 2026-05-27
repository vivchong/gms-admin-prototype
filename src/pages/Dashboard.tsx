import { useNavigate } from 'react-router-dom'
import { Trophy, CalendarDays, ClipboardList, FileCheck } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { format } from 'date-fns'

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <Card className="py-5">
      <CardContent className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
          <Icon className="h-5 w-5 text-neutral-700" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-neutral-900">{value}</p>
          <p className="text-sm text-neutral-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function Dashboard() {
  const navigate = useNavigate()
  const workspace = useStore((s) => s.workspace)

  const sportsCount = workspace.sports.length
  const eventsCount = workspace.sports.reduce((sum, s) => sum + s.events.length, 0)
  const registrationsCount = workspace.registrations.length
  const pendingDocReviews = workspace.documentReviews.filter((d) => d.status === 'pending').length

  const hasSports = sportsCount > 0

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`${workspace.gamesName} ${workspace.year} — ${format(new Date(workspace.dateRange.start), 'd MMM yyyy')} to ${format(new Date(workspace.dateRange.end), 'd MMM yyyy')}`}
      />

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard icon={Trophy} label="Sports" value={sportsCount} />
        <StatCard icon={CalendarDays} label="Events" value={eventsCount} />
        <StatCard icon={ClipboardList} label="Registrations" value={registrationsCount} />
        <StatCard icon={FileCheck} label="Pending reviews" value={pendingDocReviews} />
      </div>

      {!hasSports && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 mb-4">
              <Trophy className="h-6 w-6 text-neutral-500" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-1">
              Get started
            </h2>
            <p className="text-sm text-neutral-500 mb-6 max-w-sm">
              Create your first sport to begin setting up events and accepting registrations for Pesta Sukan 2027.
            </p>
            <Button onClick={() => navigate('/sports')}>
              Create your first sport
            </Button>
          </CardContent>
        </Card>
      )}

      {hasSports && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent>
              <h3 className="text-sm font-medium text-neutral-900 mb-3">Competition window</h3>
              <p className="text-sm text-neutral-700">
                {format(new Date(workspace.dateRange.start), 'd MMM yyyy')} – {format(new Date(workspace.dateRange.end), 'd MMM yyyy')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h3 className="text-sm font-medium text-neutral-900 mb-3">Registration window</h3>
              <p className="text-sm text-neutral-700">
                {format(new Date(workspace.registrationWindow.start), 'd MMM yyyy')} – {format(new Date(workspace.registrationWindow.end), 'd MMM yyyy')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
