import { useState } from 'react'
import { format } from 'date-fns'
import { ArrowRight, ChevronDown, Pencil, Search, UserPlus, X } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useStore } from '@/lib/store'
import type { Registration, Team } from '@/lib/types'

const statusStyles: Record<string, string> = {
  confirmed: 'bg-emerald-50 text-emerald-700',
  pending_indemnity: 'bg-amber-50 text-amber-700',
  refunded: 'bg-neutral-100 text-neutral-700',
  rejected: 'bg-red-50 text-red-700',
  waitlisted: 'bg-neutral-100 text-neutral-700',
}

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmed',
  pending_indemnity: 'Pending indemnity',
  refunded: 'Refunded',
  rejected: 'Rejected',
  waitlisted: 'Waitlisted',
}

const residencyLabels: Record<string, string> = {
  sg_citizen: 'SG Citizen',
  sg_pr: 'SG PR',
  valid_pass_holder: 'Valid pass holder',
}

type RowItem =
  | { kind: 'individual'; reg: Registration }
  | { kind: 'team'; team: Team; members: Registration[] }

export function Registrations() {
  const workspace = useStore((s) => s.workspace)
  const { registrations, teams, sports } = workspace

  const [search, setSearch] = useState('')
  const [eventFilter, setEventFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [eventPopoverOpen, setEventPopoverOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<RowItem | null>(null)
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set())
  const [rejectModal, setRejectModal] = useState<{ name: string; id: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  function getEventName(eventId: string): string {
    for (const sport of sports) {
      const event = sport.events.find((e) => e.id === eventId)
      if (event) return event.name
    }
    return '—'
  }

  function getSportName(sportId: string): string {
    return sports.find((s) => s.id === sportId)?.name || '—'
  }

  // Build row items: individual regs + one row per team
  const individualRegs = registrations.filter((r) => !r.teamId)
  const teamRows: RowItem[] = teams.map((team) => ({
    kind: 'team' as const,
    team,
    members: registrations.filter((r) => r.teamId === team.id),
  }))
  const individualRows: RowItem[] = individualRegs.map((reg) => ({
    kind: 'individual' as const,
    reg,
  }))
  const allRows: RowItem[] = [...individualRows, ...teamRows]

  // Apply filters
  const filtered = allRows.filter((item) => {
    if (item.kind === 'individual') {
      const r = item.reg
      if (eventFilter && r.eventId !== eventFilter) return false
      if (statusFilter && r.status !== statusFilter) return false
      if (search && !r.participantName.toLowerCase().includes(search.toLowerCase())) return false
    } else {
      const { team, members } = item
      if (eventFilter && team.eventId !== eventFilter) return false
      if (statusFilter) {
        const hasMatchingMember = members.some((m) => m.status === statusFilter)
        if (!hasMatchingMember) return false
      }
      if (search) {
        const matchesTeamName = team.name.toLowerCase().includes(search.toLowerCase())
        const matchesMember = members.some((m) => m.participantName.toLowerCase().includes(search.toLowerCase()))
        if (!matchesTeamName && !matchesMember) return false
      }
    }
    return true
  })

  const eventFilterLabel = eventFilter
    ? getEventName(eventFilter)
    : 'All events'

  function toggleMember(id: string) {
    setExpandedMembers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function getTeamStatusSummary(team: Team, members: Registration[]): { label: string; style: string } {
    if (members.length < team.minMembers) {
      return { label: `Need more members (${members.length}/${team.minMembers})`, style: 'bg-amber-50 text-amber-700' }
    }
    if (members.some((m) => m.status === 'pending_indemnity')) {
      return { label: 'Pending indemnity', style: 'bg-amber-50 text-amber-700' }
    }
    if (members.every((m) => m.status === 'confirmed')) {
      return { label: 'Confirmed', style: 'bg-emerald-50 text-emerald-700' }
    }
    return { label: team.status === 'forming' ? 'Forming' : 'In progress', style: 'bg-amber-50 text-amber-700' }
  }

  function handleReject() {
    if (!rejectModal) return
    toast(`Rejection email sent to participant`)
    setRejectModal(null)
    setRejectReason('')
  }

  return (
    <div>
      <PageHeader
        title="Registrations"
        subtitle="All registrations across Pesta Sukan 2027"
      />

      {/* Action card */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => toast('Create registration flow not available in prototype')}
          className="flex items-start justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-left hover:border-neutral-300 transition-colors"
        >
          <div>
            <p className="text-sm font-medium text-neutral-900 mb-1">Create registration</p>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Manually register a participant for an event.
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
        </button>
      </div>

      {registrations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-neutral-500">No registrations yet. Registrations will appear here once participants sign up for events.</p>
        </div>
      ) : (
        <>
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search by participant or team name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 max-w-sm"
            />
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 mb-4">
            <Popover open={eventPopoverOpen} onOpenChange={setEventPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  {eventFilter && <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />}
                  <span className="text-xs">{eventFilterLabel}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search events..." />
                  <CommandList>
                    <CommandEmpty>No events found.</CommandEmpty>
                    <CommandItem
                      onSelect={() => { setEventFilter(null); setEventPopoverOpen(false) }}
                      className="text-xs"
                    >
                      All events
                    </CommandItem>
                    {sports.filter((s) => s.events.length > 0).map((sport) => (
                      <CommandGroup key={sport.id} heading={sport.name}>
                        {sport.events.map((event) => (
                          <CommandItem
                            key={event.id}
                            value={`${sport.name} ${event.name}`}
                            onSelect={() => { setEventFilter(event.id); setEventPopoverOpen(false) }}
                            className="text-xs"
                          >
                            {event.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  {statusFilter && <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />}
                  <span className="text-xs">{statusFilter ? statusLabels[statusFilter] : 'All statuses'}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setStatusFilter(null)} className="text-xs">All statuses</DropdownMenuItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <DropdownMenuItem key={value} onClick={() => setStatusFilter(value)} className="text-xs">{label}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {(eventFilter || statusFilter) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-neutral-500"
                onClick={() => { setEventFilter(null); setStatusFilter(null) }}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Participant / Team</TableHead>
                  <TableHead className="text-xs">Event</TableHead>
                  <TableHead className="text-xs">Registered</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-neutral-500 py-8">
                      No registrations match the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => {
                    if (item.kind === 'individual') {
                      const reg = item.reg
                      return (
                        <TableRow
                          key={reg.id}
                          className="cursor-pointer hover:bg-neutral-50"
                          onClick={() => { setSelectedItem(item); setExpandedMembers(new Set()) }}
                        >
                          <TableCell className="text-sm font-medium">{reg.participantName}</TableCell>
                          <TableCell className="text-sm text-neutral-700">{getEventName(reg.eventId)}</TableCell>
                          <TableCell className="text-sm text-neutral-500">{format(new Date(reg.registeredAt), 'd MMM yyyy')}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={statusStyles[reg.status] || ''}>
                              {statusLabels[reg.status] || reg.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    } else {
                      const { team, members } = item
                      const earliest = members.length > 0
                        ? members.reduce((min, m) => m.registeredAt < min ? m.registeredAt : min, members[0].registeredAt)
                        : ''
                      const teamStatus = getTeamStatusSummary(team, members)
                      return (
                        <TableRow
                          key={team.id}
                          className="cursor-pointer hover:bg-neutral-50"
                          onClick={() => { setSelectedItem(item); setExpandedMembers(new Set()) }}
                        >
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{team.name}</p>
                              <p className="text-xs text-neutral-500">{members.length} member{members.length !== 1 ? 's' : ''}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-neutral-700">{getEventName(team.eventId)}</TableCell>
                          <TableCell className="text-sm text-neutral-500">{earliest ? format(new Date(earliest), 'd MMM yyyy') : '—'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={teamStatus.style}>
                              {teamStatus.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    }
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <p className="text-xs text-neutral-500 mt-3">{filtered.length} row{filtered.length !== 1 ? 's' : ''}</p>
        </>
      )}

      {/* Detail side panel */}
      <Sheet open={!!selectedItem} onOpenChange={(open) => { if (!open) setSelectedItem(null) }}>
        <SheetContent side="right" className="w-[480px] sm:max-w-[480px] overflow-hidden p-0">
          {selectedItem?.kind === 'individual' && (
            <IndividualDetailPanel
              reg={selectedItem.reg}
              getEventName={getEventName}
              getSportName={getSportName}
              onReject={(name, id) => setRejectModal({ name, id })}
            />
          )}
          {selectedItem?.kind === 'team' && (
            <TeamDetailPanel
              team={selectedItem.team}
              members={selectedItem.members}
              getEventName={getEventName}
              getSportName={getSportName}
              getTeamStatusSummary={getTeamStatusSummary}
              expandedMembers={expandedMembers}
              toggleMember={toggleMember}
              onReject={(name, id) => setRejectModal({ name, id })}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Reject modal */}
      <Dialog open={!!rejectModal} onOpenChange={(open) => { if (!open) { setRejectModal(null); setRejectReason('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject registration</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {rejectModal?.name}'s registration. This will be emailed to the participant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason for rejection</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete documentation, does not meet eligibility criteria"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectModal(null); setRejectReason('') }}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
              Reject and notify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function IndividualDetailPanel({
  reg,
  getEventName,
  getSportName,
  onReject,
}: {
  reg: Registration
  getEventName: (id: string) => string
  getSportName: (id: string) => string
  onReject: (name: string, id: string) => void
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-6 pb-6">
          <SheetHeader className="p-0 mb-6">
            <SheetTitle className="text-lg">{reg.participantName}</SheetTitle>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant="secondary" className={statusStyles[reg.status] || ''}>
                {statusLabels[reg.status] || reg.status}
              </Badge>
            </div>
          </SheetHeader>

          <DetailSection title="Participant">
            <DetailField label="Name" value={reg.participantName} />
            {reg.participantNric && <DetailField label="NRIC" value={reg.participantNric} />}
            <DetailField label="Date of birth" value={format(new Date(reg.participantDob), 'd MMM yyyy')} />
            {reg.participantGender && <DetailField label="Gender" value={reg.participantGender === 'male' ? 'Male' : 'Female'} />}
            <DetailField label="Residency" value={residencyLabels[reg.participantResidency]} />
            {reg.participantMobile && <DetailField label="Mobile" value={reg.participantMobile} />}
            {reg.participantEmail && <DetailField label="Email" value={reg.participantEmail} />}
          </DetailSection>

          <DetailSection title="Registered by">
            <DetailField label="Name" value={reg.registeredBy.name} />
            <DetailField label="Relationship" value={relationshipLabel(reg.registeredBy.relationship)} />
            <DetailField label="NRIC" value={reg.registeredBy.nric} />
            <DetailField label="Mobile" value={reg.registeredBy.mobile} />
            <DetailField label="Email" value={reg.registeredBy.email} />
          </DetailSection>

          <DetailSection title="Emergency contact">
            <DetailField label="Name" value={reg.emergencyContact.name} />
            <DetailField label="Relationship" value={reg.emergencyContact.relationship} />
            <DetailField label="Phone" value={reg.emergencyContact.phone} />
            {reg.emergencyContact.altPhone && <DetailField label="Alt phone" value={reg.emergencyContact.altPhone} />}
          </DetailSection>

          <DetailSection title="Registration">
            <DetailField label="Sport" value={getSportName(reg.sportId)} />
            <DetailField label="Event" value={getEventName(reg.eventId)} />
            <DetailField label="Registered" value={format(new Date(reg.registeredAt), 'd MMM yyyy, h:mm a')} />
            <DetailField label="Fee paid" value={`S$${reg.feePaid.toFixed(2)}`} />
            {reg.jerseyNumber !== undefined && <DetailField label="Jersey number" value={String(reg.jerseyNumber)} />}
          </DetailSection>
        </div>
      </ScrollArea>

      <div className="shrink-0 bg-white border-t border-neutral-200 px-6 py-4 flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => toast('Edit registration not available in prototype')}>
          <Pencil className="h-3.5 w-3.5 mr-1.5" />
          Edit
        </Button>
        {reg.status !== 'rejected' && (
          <Button variant="destructive" size="sm" onClick={() => onReject(reg.participantName, reg.id)}>
            Reject
          </Button>
        )}
      </div>
    </div>
  )
}

function TeamDetailPanel({
  team,
  members,
  getEventName,
  getSportName,
  getTeamStatusSummary,
  expandedMembers,
  toggleMember,
  onReject,
}: {
  team: Team
  members: Registration[]
  getEventName: (id: string) => string
  getSportName: (id: string) => string
  getTeamStatusSummary: (team: Team, members: Registration[]) => { label: string; style: string }
  expandedMembers: Set<string>
  toggleMember: (id: string) => void
  onReject: (name: string, id: string) => void
}) {
  const teamStatus = getTeamStatusSummary(team, members)
  const totalFee = members.reduce((sum, m) => sum + m.feePaid, 0)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-6 pb-6">
          <SheetHeader className="p-0 mb-6">
            <SheetTitle className="text-lg">{team.name}</SheetTitle>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant="secondary" className={teamStatus.style}>
                {teamStatus.label}
              </Badge>
            </div>
          </SheetHeader>

          <DetailSection title="Team details">
            <DetailField label="Sport" value={getSportName(team.sportId)} />
            <DetailField label="Event" value={getEventName(team.eventId)} />
            <DetailField label="Members" value={`${members.length} of ${team.minMembers}–${team.maxMembers}`} />
            <DetailField label="Total fee" value={`S$${totalFee.toFixed(2)}`} />
            <DetailField label="Created" value={format(new Date(team.createdAt), 'd MMM yyyy')} />
          </DetailSection>

          <DetailSection title={`Members (${members.length})`}>
            {members.map((member) => (
              <div key={member.id} className="border border-neutral-200 rounded-lg mb-2 overflow-hidden">
                <button
                  type="button"
                  className="flex items-center justify-between w-full px-3 py-2.5 text-left hover:bg-neutral-50"
                  onClick={() => toggleMember(member.id)}
                >
                  <span className="text-sm font-medium text-neutral-900">{member.participantName}</span>
                  <ChevronDown className={`h-4 w-4 text-neutral-400 shrink-0 transition-transform ${expandedMembers.has(member.id) ? 'rotate-180' : ''}`} />
                </button>
                {expandedMembers.has(member.id) && (
                  <div className="px-3 pb-3 border-t border-neutral-100 pt-2">
                    <div className="space-y-3">
                      {member.participantNric && <DetailField label="NRIC" value={member.participantNric} />}
                      <DetailField label="Date of birth" value={format(new Date(member.participantDob), 'd MMM yyyy')} />
                      {member.participantGender && <DetailField label="Gender" value={member.participantGender === 'male' ? 'Male' : 'Female'} />}
                      <DetailField label="Residency" value={residencyLabels[member.participantResidency]} />
                      {member.participantMobile && <DetailField label="Mobile" value={member.participantMobile} />}
                      {member.participantEmail && <DetailField label="Email" value={member.participantEmail} />}
                      <DetailField label="Fee paid" value={`S$${member.feePaid.toFixed(2)}`} />
                      <DetailField label="Registered" value={format(new Date(member.registeredAt), 'd MMM yyyy')} />
                    </div>
                    <div className="mt-3 pt-3 border-t border-neutral-100 space-y-3">
                      <p className="text-xs font-medium text-neutral-500">Emergency contact</p>
                      <DetailField label="Name" value={member.emergencyContact.name} />
                      <DetailField label="Relationship" value={member.emergencyContact.relationship} />
                      <DetailField label="Phone" value={member.emergencyContact.phone} />
                    </div>
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-neutral-100">
                      <Badge variant="secondary" className={statusStyles[member.status] || ''}>
                        {statusLabels[member.status] || member.status}
                      </Badge>
                      {member.status !== 'rejected' && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onReject(member.participantName, member.id)}>
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </DetailSection>
        </div>
      </ScrollArea>

      <div className="shrink-0 bg-white border-t border-neutral-200 px-6 py-4 flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => toast('Edit registration not available in prototype')}>
          <Pencil className="h-3.5 w-3.5 mr-1.5" />
          Edit
        </Button>
        <Button variant="outline" size="sm" onClick={() => toast('Add team member flow not available in prototype')}>
          <UserPlus className="h-3.5 w-3.5 mr-1.5" />
          Add member
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onReject(team.name, team.id)}>
          Reject team
        </Button>
      </div>
    </div>
  )
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="border border-neutral-200 rounded-lg bg-white p-4">
        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">{title}</h4>
        <div className="space-y-3">{children}</div>
      </div>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-neutral-500 mb-0.5">{label}</p>
      <p className="text-sm text-neutral-900">{value}</p>
    </div>
  )
}

function relationshipLabel(rel: string): string {
  const map: Record<string, string> = {
    self: 'Self',
    parent: 'Parent',
    guardian: 'Guardian',
    team_manager: 'Team manager',
  }
  return map[rel] || rel
}
