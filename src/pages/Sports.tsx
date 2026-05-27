import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Search, Trophy } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useStore } from '@/lib/store'

export function Sports() {
  const navigate = useNavigate()
  const workspace = useStore((s) => s.workspace)
  const sports = workspace.sports
  const [search, setSearch] = useState('')

  const filteredSports = sports.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  function getEventCount(sportId: string) {
    const sport = sports.find((s) => s.id === sportId)
    return sport?.events.length ?? 0
  }

  function getRegistrationCount(sportId: string) {
    return workspace.registrations.filter((r) => r.sportId === sportId).length
  }

  return (
    <div>
      <PageHeader
        title="Sports"
        subtitle="Manage sports for Pesta Sukan 2027"
      />

      {/* Action cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => navigate('/sports/new')}
          className="flex items-start justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-left hover:border-neutral-300 transition-colors"
        >
          <div>
            <p className="text-sm font-medium text-neutral-900 mb-1">Create sport</p>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Add a sport with events, registration settings, and custom form questions.
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Search sport name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <p className="text-sm text-neutral-500 mb-3">
        Showing {filteredSports.length} of {sports.length} results
      </p>

      {/* Table */}
      <div className="rounded-xl border border-neutral-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sport name</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Registrations</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSports.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 mb-4">
                      <Trophy className="h-6 w-6 text-neutral-400" />
                    </div>
                    <p className="text-sm font-medium text-neutral-900 mb-1">
                      {search ? `No sports match "${search}"` : 'No sports yet'}
                    </p>
                    {!search && (
                      <p className="text-sm text-neutral-500 max-w-xs">
                        Create a sport to begin setting up events and accepting registrations.
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
            {filteredSports.map((sport) => (
              <TableRow
                key={sport.id}
                className="cursor-pointer"
                onClick={() => navigate(`/sports/${sport.id}`)}
              >
                <TableCell className="font-medium">{sport.name}</TableCell>
                <TableCell className="text-neutral-500">{sport.venue || '—'}</TableCell>
                <TableCell>{getEventCount(sport.id)}</TableCell>
                <TableCell>{getRegistrationCount(sport.id)}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      sport.publicationStatus === 'published'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-neutral-100 text-neutral-700'
                    }
                  >
                    {sport.publicationStatus === 'published' ? 'Published' : 'Draft'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
