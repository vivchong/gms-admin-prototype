import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MoreHorizontal, Plus, Search, Trash2, PlusCircle } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useStore } from '@/lib/store'
import { FormBuilder } from '@/components/forms/FormBuilder'

function formatDate(iso: string | undefined) {
  if (!iso) return '—'
  return format(new Date(iso), 'd MMM yyyy')
}

function SectionHeader({ title, onEdit, editing }: { title: string; onEdit?: () => void; editing?: boolean }) {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
      <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
      {onEdit && !editing && (
        <Button variant="outline" size="sm" onClick={onEdit}>Edit</Button>
      )}
    </div>
  )
}

export function SportDetail() {
  const { sportId } = useParams()
  const navigate = useNavigate()
  const workspace = useStore((s) => s.workspace)
  const updateSport = useStore((s) => s.updateSport)
  const sport = workspace.sports.find((s) => s.id === sportId)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editVenue, setEditVenue] = useState('')
  const [editCompStart, setEditCompStart] = useState('')
  const [editCompEnd, setEditCompEnd] = useState('')
  const [editRegOpen, setEditRegOpen] = useState('')
  const [editRegClose, setEditRegClose] = useState('')
  const [editLastChange, setEditLastChange] = useState('')

  if (!sport) {
    navigate('/sports')
    return null
  }

  function openEditModal() {
    setEditName(sport!.name)
    setEditDescription(sport!.description || '')
    setEditVenue(sport!.venue || '')
    setEditCompStart(sport!.competitionDates.start)
    setEditCompEnd(sport!.competitionDates.end)
    setEditRegOpen(sport!.registrationOpenAt || '')
    setEditRegClose(sport!.registrationCloseAt || '')
    setEditLastChange(sport!.lastChangeDate || '')
    setEditModalOpen(true)
  }

  function saveEdit() {
    updateSport(sportId!, {
      name: editName.trim(),
      description: editDescription.trim() || undefined,
      venue: editVenue.trim() || undefined,
      competitionDates: { start: editCompStart, end: editCompEnd },
      registrationOpenAt: editRegOpen || undefined,
      registrationCloseAt: editRegClose || undefined,
      lastChangeDate: editLastChange || undefined,
    })
    setEditModalOpen(false)
    toast('Sport updated')
  }

  const pricingLabel = sport.pricingType === 'per_event' ? 'Per event' : 'Bundle'

  return (
    <div className="-m-8">
      {/* White header area */}
      <div className="bg-white px-8 pt-8 pb-0">
        <PageHeader
          title={sport.name}
          subtitle={sport.venue || undefined}
          breadcrumbs={[
            { label: 'Sports', path: '/sports' },
            { label: sport.name },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-neutral-100 text-neutral-700"
              >
                {sport.events.some((e) => e.publicationStatus === 'published') ? 'Has published events' : 'Draft'}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toast('Duplicate not available in prototype')}>
                    Duplicate sport
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => toast('Delete not available in prototype')}>
                    Delete sport
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
        />

        {/* Sport details shown in header */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 pb-6 max-w-[720px]">
          {sport.description && (
            <div className="col-span-2">
              <p className="text-xs text-neutral-500">Description</p>
              <p className="text-sm text-neutral-900">{sport.description}</p>
            </div>
          )}
          <div className="space-y-2">
            <div>
              <p className="text-xs text-neutral-500">Registration window</p>
              <p className="text-sm text-neutral-900">{formatDate(sport.registrationOpenAt)} – {formatDate(sport.registrationCloseAt)}</p>
            </div>
            {sport.lastChangeDate && (
              <div>
                <p className="text-xs text-neutral-500">Last date for registration changes</p>
                <p className="text-sm text-neutral-900">{formatDate(sport.lastChangeDate)}</p>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-neutral-500">Competition period</p>
            <p className="text-sm text-neutral-900">{formatDate(sport.competitionDates.start)} – {formatDate(sport.competitionDates.end)}</p>
          </div>
          
        </div>

<Tabs defaultValue="events">
          <TabsList variant="line" className="border-b border-neutral-200">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="form-questions">Additional form questions</TabsTrigger>
          </TabsList>

          {/* Gray content area below tabs */}
          <div className="bg-neutral-50 -mx-8 px-8 py-6">
            <div className="max-w-[840px]">
              <TabsContent value="events">
                <EventsTab sport={sport} sportId={sportId!} />
              </TabsContent>

              <TabsContent value="settings">
                <SettingsTab sport={sport} sportId={sportId!} updateSport={updateSport} />
              </TabsContent>

              <TabsContent value="rules">
                <RulesTab sport={sport} sportId={sportId!} updateSport={updateSport} />
              </TabsContent>

              <TabsContent value="form-questions">
                <div className="space-y-6">
                  <FormBuilder
                    section="athlete"
                    title="Athlete details questions"
                    helperText="These questions appear in the Athlete details section of the registration form for every event under this sport."
                    questions={sport.customQuestions.filter((q) => q.appliesTo === 'athlete')}
                    onChange={(updated) => {
                      const teamQs = sport.customQuestions.filter((q) => q.appliesTo === 'team')
                      updateSport(sportId!, { customQuestions: [...updated, ...teamQs] })
                      toast('Form questions updated')
                    }}
                    defaultFields={[
                      { label: 'Name of athlete', type: 'Short answer' },
                      { label: 'NRIC or FIN', type: 'Short answer' },
                      { label: 'Citizenship / Residency status', type: 'Short answer' },
                      { label: 'Date of birth', type: 'Short answer' },
                      { label: 'Gender', type: 'Short answer' },
                      { label: 'Mobile number', type: 'Short answer' },
                      { label: 'Email address', type: 'Short answer' },
                    ]}
                  />
                  <FormBuilder
                    section="team"
                    title="Team details questions"
                    helperText="Team questions only appear when the event under this sport is a team event."
                    questions={sport.customQuestions.filter((q) => q.appliesTo === 'team')}
                    onChange={(updated) => {
                      const athleteQs = sport.customQuestions.filter((q) => q.appliesTo === 'athlete')
                      updateSport(sportId!, { customQuestions: [...athleteQs, ...updated] })
                      toast('Form questions updated')
                    }}
                    defaultFields={[
                      { label: 'Team name', type: 'Short answer' },
                    ]}
                  />
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Edit sport modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit sport</DialogTitle>
            <DialogDescription>Update sport details and dates.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Sport name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Optional" rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Venue</Label>
              <Input value={editVenue} onChange={(e) => setEditVenue(e.target.value)} placeholder="Optional" />
            </div>
            <div className="border-t border-neutral-200 pt-4 space-y-4">
              <div className="space-y-2">
                <Label>Competition start</Label>
                <Input type="date" value={editCompStart} onChange={(e) => setEditCompStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Competition end</Label>
                <Input type="date" value={editCompEnd} onChange={(e) => setEditCompEnd(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Registration opens</Label>
                <Input type="date" value={editRegOpen} onChange={(e) => setEditRegOpen(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Registration closes</Label>
                <Input type="date" value={editRegClose} onChange={(e) => setEditRegClose(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Last date for changes</Label>
                <Input type="date" value={editLastChange} onChange={(e) => setEditLastChange(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={!editName.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EventsTab({ sport, sportId }: { sport: ReturnType<typeof useStore.getState>['workspace']['sports'][number]; sportId: string }) {
  const navigate = useNavigate()
  const workspace = useStore((s) => s.workspace)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const events = sport.events
  const filteredEvents = events.filter((ev) => {
    const matchesSearch = ev.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || ev.categoryId === categoryFilter
    return matchesSearch && matchesCategory
  })

  function getCategoryName(catId: string) {
    return workspace.categories.find((c) => c.id === catId)?.name || catId
  }

  function getRegistrationCount(eventId: string) {
    return workspace.registrations.filter((r) => r.eventId === eventId).length
  }

  function getAgeRange(ev: typeof events[number]) {
    if (!ev.ageRange?.minAge && !ev.ageRange?.maxAge) return '—'
    if (ev.ageRange?.minAge && ev.ageRange?.maxAge) return `${ev.ageRange.minAge} – ${ev.ageRange.maxAge} years`
    if (ev.ageRange?.minAge) return `At least ${ev.ageRange.minAge} years`
    return `Up to ${ev.ageRange!.maxAge} years`
  }

  function getFee(ev: typeof events[number]) {
    if (ev.fee !== undefined) return `S$${ev.fee.toFixed(2)}`
    return '—'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {workspace.categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => navigate(`/sports/${sportId}/events/new`)}>
          <Plus className="h-4 w-4" />
          Add event
        </Button>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Search event name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Age range</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Registrations</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm font-medium text-neutral-900 mb-1">
                      {search || categoryFilter !== 'all' ? 'No matching events' : 'No events yet'}
                    </p>
                    {!search && categoryFilter === 'all' && (
                      <p className="text-sm text-neutral-500">
                        Add an event to this sport to start accepting registrations.
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
            {filteredEvents.map((ev) => (
              <TableRow
                key={ev.id}
                className="cursor-pointer"
                onClick={() => navigate(`/sports/${sportId}/events/${ev.id}`)}
              >
                <TableCell className="font-medium">{ev.name}</TableCell>
                <TableCell>{getCategoryName(ev.categoryId)}</TableCell>
                <TableCell className="capitalize">{ev.gender || '—'}</TableCell>
                <TableCell>{getAgeRange(ev)}</TableCell>
                <TableCell>{getFee(ev)}</TableCell>
                <TableCell>{getRegistrationCount(ev.id)}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      ev.publicationStatus === 'published'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-neutral-100 text-neutral-700'
                    }
                  >
                    {ev.publicationStatus === 'published' ? 'Published' : 'Draft'}
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

function RulesTab({ sport, sportId, updateSport }: {
  sport: ReturnType<typeof useStore.getState>['workspace']['sports'][number]
  sportId: string
  updateSport: (id: string, updates: Partial<typeof sport>) => void
}) {
  const workspace = useStore((s) => s.workspace)
  const enabledRules = workspace.workspaceRules.filter((r) => r.enabled)

  const [editing, setEditing] = useState(false)
  const [noLimit, setNoLimit] = useState(sport.maxEventsPerParticipant === undefined)
  const [maxEvents, setMaxEvents] = useState(sport.maxEventsPerParticipant?.toString() || '')
  const [exemptIds, setExemptIds] = useState<string[]>(sport.exemptCategoryIds)

  function saveRules() {
    updateSport(sportId, {
      maxEventsPerParticipant: noLimit ? undefined : (parseInt(maxEvents) || undefined),
      exemptCategoryIds: exemptIds,
    })
    setEditing(false)
    toast('Sport rules updated')
  }

  function cancelEdit() {
    setNoLimit(sport.maxEventsPerParticipant === undefined)
    setMaxEvents(sport.maxEventsPerParticipant?.toString() || '')
    setExemptIds(sport.exemptCategoryIds)
    setEditing(false)
  }

  function toggleExempt(catId: string) {
    setExemptIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <SectionHeader title="This sport's rules" onEdit={() => setEditing(true)} editing={editing} />

          {editing ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="max-events">Maximum events per participant</Label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="no-limit" className="text-xs text-neutral-500 font-normal">No limit</Label>
                    <Switch
                      id="no-limit"
                      checked={noLimit}
                      onCheckedChange={(checked) => {
                        setNoLimit(checked as boolean)
                        if (checked) setMaxEvents('')
                      }}
                    />
                  </div>
                </div>
                <Input
                  id="max-events"
                  type="number"
                  min={1}
                  placeholder="e.g. 2"
                  value={maxEvents}
                  onChange={(e) => setMaxEvents(e.target.value)}
                  disabled={noLimit}
                />
              </div>

              <div className="space-y-3">
                <Label>Categories that don't count toward this limit</Label>
                <p className="text-xs text-neutral-500">
                  Tick any category whose events shouldn't count against the limit.
                </p>
                <div className="space-y-2 pt-1">
                  {workspace.categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={exemptIds.includes(cat.id)}
                        onCheckedChange={() => toggleExempt(cat.id)}
                        disabled={noLimit}
                      />
                      <span className="text-sm text-neutral-700">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button size="sm" onClick={saveRules}>Save</Button>
                <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="py-3 border-b border-neutral-100">
                <p className="text-xs text-neutral-500 mb-0.5">Maximum events per participant</p>
                <p className="text-sm text-neutral-900">
                  {sport.maxEventsPerParticipant !== undefined ? sport.maxEventsPerParticipant : 'No limit'}
                </p>
              </div>
              <div className="py-3">
                <p className="text-xs text-neutral-500 mb-0.5">Exempt categories</p>
                <p className="text-sm text-neutral-900">
                  {sport.exemptCategoryIds.length > 0
                    ? sport.exemptCategoryIds.map((id) => workspace.categories.find((c) => c.id === id)?.name || id).join(', ')
                    : 'None'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {enabledRules.length > 0 && (
        <Card>
          <CardContent>
            <SectionHeader title="Inherited from workspace" />
            <p className="text-xs text-neutral-500 mb-4">
              These apply to every registration in this sport. Edit them in Settings if needed.
            </p>
            <div>
              {enabledRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
                  <p className="text-sm text-neutral-700">{rule.label}</p>
                  <Badge variant="secondary" className="bg-neutral-100 text-neutral-500 text-xs">
                    Workspace default
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SettingsTab({ sport, sportId, updateSport }: {
  sport: ReturnType<typeof useStore.getState>['workspace']['sports'][number]
  sportId: string
  updateSport: (id: string, updates: Partial<typeof sport>) => void
}) {
  const workspace = useStore((s) => s.workspace)

  const [editingDetails, setEditingDetails] = useState(false)
  const [detailName, setDetailName] = useState(sport.name)
  const [detailPricing, setDetailPricing] = useState(sport.pricingType)
  const [detailDescription, setDetailDescription] = useState(sport.description || '')
  const [detailVenue, setDetailVenue] = useState(sport.venue || '')

  const [editingTimelines, setEditingTimelines] = useState(false)
  const [tlRegOpen, setTlRegOpen] = useState(sport.registrationOpenAt || '')
  const [tlRegClose, setTlRegClose] = useState(sport.registrationCloseAt || '')
  const [tlLastChange, setTlLastChange] = useState(sport.lastChangeDate || '')
  const [tlCompStart, setTlCompStart] = useState(sport.competitionDates.start)
  const [tlCompEnd, setTlCompEnd] = useState(sport.competitionDates.end)

  const [editingFormats, setEditingFormats] = useState(false)
  const [fmtList, setFmtList] = useState<string[]>(sport.formats || [])

  function saveDetails() {
    updateSport(sportId, {
      name: detailName.trim(),
      pricingType: detailPricing,
      description: detailDescription.trim() || undefined,
      venue: detailVenue.trim() || undefined,
    })
    setEditingDetails(false)
    toast('Sport details updated')
  }

  function cancelDetails() {
    setDetailName(sport.name)
    setDetailPricing(sport.pricingType)
    setDetailDescription(sport.description || '')
    setDetailVenue(sport.venue || '')
    setEditingDetails(false)
  }

  function saveTimelines() {
    updateSport(sportId, {
      registrationOpenAt: tlRegOpen || undefined,
      registrationCloseAt: tlRegClose || undefined,
      lastChangeDate: tlLastChange || undefined,
      competitionDates: { start: tlCompStart, end: tlCompEnd },
    })
    setEditingTimelines(false)
    toast('Timelines updated')
  }

  function cancelTimelines() {
    setTlRegOpen(sport.registrationOpenAt || '')
    setTlRegClose(sport.registrationCloseAt || '')
    setTlLastChange(sport.lastChangeDate || '')
    setTlCompStart(sport.competitionDates.start)
    setTlCompEnd(sport.competitionDates.end)
    setEditingTimelines(false)
  }

  function saveFormats() {
    const filled = fmtList.map((f) => f.trim()).filter(Boolean)
    updateSport(sportId, { formats: filled.length > 0 ? filled : undefined })
    setEditingFormats(false)
    toast('Format filters updated')
  }

  function cancelFormats() {
    setFmtList(sport.formats || [])
    setEditingFormats(false)
  }

  const pricingLabel = sport.pricingType === 'per_event' ? 'Per event' : 'Bundle'
  void workspace

  return (
    <div className="space-y-6">
      {/* Sport details */}
      <Card className="py-0 gap-0">
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-900">Sport details</h3>
            {!editingDetails && (
              <Button variant="outline" size="sm" onClick={() => setEditingDetails(true)}>Edit</Button>
            )}
          </div>
          <div className="px-6 py-6">
            {editingDetails ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name of sport</Label>
                  <Input value={detailName} onChange={(e) => setDetailName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Pricing type</Label>
                  <Select value={detailPricing} onValueChange={(v) => setDetailPricing(v as 'per_event' | 'bundle')}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_event">Per event</SelectItem>
                      <SelectItem value="bundle">Bundle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={detailDescription} onChange={(e) => setDetailDescription(e.target.value)} placeholder="Optional" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Venue</Label>
                  <Input value={detailVenue} onChange={(e) => setDetailVenue(e.target.value)} placeholder="Optional" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={saveDetails} disabled={!detailName.trim()}>Save</Button>
                  <Button size="sm" variant="outline" onClick={cancelDetails}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-neutral-500">Name of sport</p>
                  <p className="text-sm text-neutral-900">{sport.name}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Pricing type</p>
                  <p className="text-sm text-neutral-900">{pricingLabel}</p>
                </div>
                {sport.description && (
                  <div>
                    <p className="text-xs text-neutral-500">Description</p>
                    <p className="text-sm text-neutral-900">{sport.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-neutral-500">Venue</p>
                  <p className="text-sm text-neutral-900">{sport.venue || '—'}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timelines & schedules */}
      <Card className="py-0 gap-0">
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-900">Timelines & schedules</h3>
            {!editingTimelines && (
              <Button variant="outline" size="sm" onClick={() => setEditingTimelines(true)}>Edit</Button>
            )}
          </div>
          <div className="px-6 py-6">
            {editingTimelines ? (
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Registration window</Label>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-neutral-500 font-normal">Opens</Label>
                      <Input type="date" value={tlRegOpen} onChange={(e) => setTlRegOpen(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-neutral-500 font-normal">Closes</Label>
                      <Input type="date" value={tlRegClose} onChange={(e) => setTlRegClose(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="border-t border-neutral-200 pt-4 space-y-2">
                  <Label>Last date for registration changes</Label>
                  <Input type="date" value={tlLastChange} onChange={(e) => setTlLastChange(e.target.value)} />
                </div>
                <div className="border-t border-neutral-200 pt-4">
                  <Label className="mb-2 block">Competition period</Label>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-neutral-500 font-normal">Start date</Label>
                      <Input type="date" value={tlCompStart} onChange={(e) => setTlCompStart(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-neutral-500 font-normal">End date</Label>
                      <Input type="date" value={tlCompEnd} onChange={(e) => setTlCompEnd(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={saveTimelines}>Save</Button>
                  <Button size="sm" variant="outline" onClick={cancelTimelines}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-neutral-500">Registration window</p>
                  <p className="text-sm text-neutral-900">{formatDate(sport.registrationOpenAt)} – {formatDate(sport.registrationCloseAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Last date for registration changes</p>
                  <p className="text-sm text-neutral-900">{formatDate(sport.lastChangeDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Competition period</p>
                  <p className="text-sm text-neutral-900">{formatDate(sport.competitionDates.start)} – {formatDate(sport.competitionDates.end)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Format filters */}
      <Card className="py-0 gap-0">
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-900">Format filters</h3>
            {!editingFormats && (
              <Button variant="outline" size="sm" onClick={() => { setFmtList(sport.formats || []); setEditingFormats(true) }}>Edit</Button>
            )}
          </div>
          <div className="px-6 py-6">
            {editingFormats ? (
              <div className="space-y-4">
                <p className="text-sm text-neutral-700">
                  Create filters for each format in your sport, so users can easily find events.
                </p>
                <div className="space-y-2">
                  <Label className="font-semibold">Formats</Label>
                  <p className="text-xs text-neutral-500">Each label should not exceed 50 characters</p>
                  <div className="space-y-3">
                    {fmtList.map((fmt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          value={fmt}
                          onChange={(e) => {
                            const updated = [...fmtList]
                            updated[i] = e.target.value.slice(0, 50)
                            setFmtList(updated)
                          }}
                          maxLength={50}
                        />
                        <button
                          type="button"
                          onClick={() => setFmtList(fmtList.filter((_, idx) => idx !== i))}
                          className="p-2 text-blue-600 hover:text-red-600 hover:bg-red-50 rounded shrink-0"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setFmtList([...fmtList, ''])}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mt-3"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add another format
                  </button>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={saveFormats}>Save</Button>
                  <Button size="sm" variant="outline" onClick={cancelFormats}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div>
                {sport.formats && sport.formats.length > 0 ? (
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 mb-2">Formats</p>
                    <ul className="list-disc list-inside space-y-1">
                      {sport.formats.map((fmt, i) => (
                        <li key={i} className="text-sm text-neutral-900">{fmt}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">No format filters defined.</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
