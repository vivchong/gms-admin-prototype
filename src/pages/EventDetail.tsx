import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ArrowRight, ChevronDown, Eye, Pencil, Search, UserPlus, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useStore } from '@/lib/store'
import { FormBuilder } from '@/components/forms/FormBuilder'
import { EventDetailsPreview } from '@/components/preview/EventDetailsPreview'
import { RegistrationFormPreview } from '@/components/preview/RegistrationFormPreview'
import type { SportEvent, Registration, Team } from '@/lib/types'

function formatDate(iso: string | undefined) {
  if (!iso) return '—'
  return format(new Date(iso), 'd MMM yyyy')
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3 border-b border-neutral-100 last:border-0">
      <p className="text-xs text-neutral-500 mb-0.5">{label}</p>
      <p className="text-sm text-neutral-900">{value}</p>
    </div>
  )
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: 'bg-emerald-50 text-emerald-700',
    pending_indemnity: 'bg-amber-50 text-amber-700',
    refunded: 'bg-neutral-100 text-neutral-700',
    rejected: 'bg-red-50 text-red-700',
    waitlisted: 'bg-neutral-100 text-neutral-700',
    forming: 'bg-amber-50 text-amber-700',
    complete: 'bg-emerald-50 text-emerald-700',
  }
  const labels: Record<string, string> = {
    confirmed: 'Confirmed',
    pending_indemnity: 'Pending indemnity',
    refunded: 'Refunded',
    rejected: 'Rejected',
    waitlisted: 'Waitlisted',
    forming: 'Forming',
    complete: 'Complete',
  }
  return (
    <Badge variant="secondary" className={styles[status] || 'bg-neutral-100 text-neutral-700'}>
      {labels[status] || status}
    </Badge>
  )
}

export function EventDetail() {
  const { sportId, eventId } = useParams()
  const navigate = useNavigate()
  const workspace = useStore((s) => s.workspace)
  const updateEvent = useStore((s) => s.updateEvent)
  const sport = workspace.sports.find((s) => s.id === sportId)
  const event = sport?.events.find((e) => e.id === eventId)

  if (!sport || !event) {
    navigate('/sports')
    return null
  }

  const category = workspace.categories.find((c) => c.id === event.categoryId)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewTab, setPreviewTab] = useState<'event' | 'form'>('event')
  const [publishModalOpen, setPublishModalOpen] = useState(false)
  const [unpublishModalOpen, setUnpublishModalOpen] = useState(false)

  const regOpen = sport.registrationOpenAt || workspace.registrationWindow.start
  const regClose = sport.registrationCloseAt || workspace.registrationWindow.end

  return (
    <div className="-m-8">
      <div className="bg-white px-8 pt-8 pb-0">
        <PageHeader
          title={event.name}
          subtitle={
            event.publicationStatus === 'published' && regOpen && regClose
              ? `Registration opens on ${formatDate(regOpen)} and closes on ${formatDate(regClose)}`
              : category?.name
          }
          breadcrumbs={[
            { label: 'Sports', path: '/sports' },
            { label: sport.name, path: `/sports/${sportId}` },
            { label: event.name },
          ]}
          actions={
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
                <Eye className="h-4 w-4 mr-1.5" />
                Preview
              </Button>
              {event.publicationStatus === 'draft' ? (
                <Button size="sm" onClick={() => setPublishModalOpen(true)}>
                  Ready to publish
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setUnpublishModalOpen(true)}>
                  Unpublish
                </Button>
              )}
              <Badge
                variant="secondary"
                className={
                  event.publicationStatus === 'published'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-neutral-100 text-neutral-700'
                }
              >
                {event.publicationStatus === 'published' ? 'Published' : 'Draft'}
              </Badge>
            </div>
          }
        />

        {/* Publish confirmation modal */}
        <Dialog open={publishModalOpen} onOpenChange={setPublishModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Publish event</DialogTitle>
              <DialogDescription>
                Are you sure you want to publish this event? The event will only accept registrations from the registration start date ({formatDate(regOpen)}) as specified.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPublishModalOpen(false)}>Cancel</Button>
              <Button onClick={() => { updateEvent(sportId!, eventId!, { publicationStatus: 'published' }); setPublishModalOpen(false); toast('Event published') }}>
                Publish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Unpublish confirmation modal */}
        <Dialog open={unpublishModalOpen} onOpenChange={setUnpublishModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unpublish event</DialogTitle>
              <DialogDescription>
                This will revert the event back to draft and pause registration if it is currently open. Are you sure you want to continue?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUnpublishModalOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { updateEvent(sportId!, eventId!, { publicationStatus: 'draft' }); setUnpublishModalOpen(false); toast('Event reverted to draft') }}>
                Unpublish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Tabs defaultValue="overview">
          <TabsList variant="line" className="border-b border-neutral-200">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="form-questions">Additional form questions</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            {event.isTeamEvent && <TabsTrigger value="teams">Teams</TabsTrigger>}
          </TabsList>

          <div className="bg-neutral-50 -mx-8 px-8 py-6">
            <TabsContent value="overview">
              <div className="max-w-[840px]">
                <OverviewTab event={event} sport={sport} sportId={sportId!} updateEvent={updateEvent} />
              </div>
            </TabsContent>
            <TabsContent value="form-questions">
              <div className="max-w-[840px] space-y-6">
                {event.isTeamEvent && (
                  <FormBuilder
                    section="team"
                    title="Team details questions"
                    helperText="These questions appear in the Team details section of the registration form for this event."
                    questions={event.customQuestions.filter((q) => q.appliesTo === 'team')}
                    onChange={(updated) => {
                      const athleteQs = event.customQuestions.filter((q) => q.appliesTo === 'athlete')
                      updateEvent(sportId!, eventId!, { customQuestions: [...updated, ...athleteQs] })
                      toast('Form questions updated')
                    }}
                  />
                )}
                <FormBuilder
                  section="athlete"
                  title="Athlete details questions"
                  helperText="These questions appear in the Athlete details section of the registration form for this event."
                  questions={event.customQuestions.filter((q) => q.appliesTo === 'athlete')}
                  onChange={(updated) => {
                    const teamQs = event.customQuestions.filter((q) => q.appliesTo === 'team')
                    updateEvent(sportId!, eventId!, { customQuestions: [...teamQs, ...updated] })
                    toast('Form questions updated')
                  }}
                />
              </div>
            </TabsContent>
            <TabsContent value="registrations">
              <RegistrationsTab eventId={eventId!} />
            </TabsContent>
            {event.isTeamEvent && (
              <TabsContent value="teams">
                <TeamsTab eventId={eventId!} />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>

      {/* Preview modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPreviewOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-[480px] max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <div className="flex gap-1">
                <button
                  className={`px-3 py-1.5 text-xs font-medium rounded-md ${previewTab === 'event' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                  onClick={() => setPreviewTab('event')}
                >
                  Event page
                </button>
                <button
                  className={`px-3 py-1.5 text-xs font-medium rounded-md ${previewTab === 'form' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                  onClick={() => setPreviewTab('form')}
                >
                  Registration form
                </button>
              </div>
              <button onClick={() => setPreviewOpen(false)} className="text-neutral-500 hover:text-neutral-900 text-lg leading-none">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {previewTab === 'event' ? (
                <EventDetailsPreview
                  event={event}
                  sportName={sport.name}
                  categoryName={category?.name}
                  venue={sport.venue}
                />
              ) : (
                <RegistrationFormPreview
                  event={event}
                  sportQuestions={sport.customQuestions}
                  eventQuestions={event.customQuestions}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function OverviewTab({ event, sport, sportId, updateEvent }: {
  event: SportEvent
  sport: ReturnType<typeof useStore.getState>['workspace']['sports'][number]
  sportId: string
  updateEvent: (sportId: string, eventId: string, updates: Partial<SportEvent>) => void
}) {
  const workspace = useStore((s) => s.workspace)
  const category = workspace.categories.find((c) => c.id === event.categoryId)
  const enabledRules = workspace.workspaceRules.filter((r) => r.enabled)

  const [editingSection, setEditingSection] = useState<'details' | 'eligibility' | null>(null)

  // Event details edit state
  const [name, setName] = useState(event.name)
  const [description, setDescription] = useState(event.description || '')
  const [categoryId, setCategoryId] = useState(event.categoryId)
  const [capacity, setCapacity] = useState(event.capacity?.toString() || '')
  const [compStart, setCompStart] = useState(event.competitionDates?.start || '')
  const [compEnd, setCompEnd] = useState(event.competitionDates?.end || '')

  // Who can participate edit state
  const [gender, setGender] = useState<string>(event.gender || '')
  const [minAge, setMinAge] = useState(event.ageRange?.minAge?.toString() || '')
  const [hasMaxAge, setHasMaxAge] = useState(!!event.ageRange?.maxAge)
  const [maxAge, setMaxAge] = useState(event.ageRange?.maxAge?.toString() || '')
  const [isTeamEvent, setIsTeamEvent] = useState(event.isTeamEvent)
  const [minTeamMembers, setMinTeamMembers] = useState(event.minTeamMembers?.toString() || '')
  const [maxTeamMembers, setMaxTeamMembers] = useState(event.maxTeamMembers?.toString() || '')
  const [teamGenderMix, setTeamGenderMix] = useState<string>(event.teamEligibility?.genderMix || 'mixed_any')
  const [isParentChild, setIsParentChild] = useState(event.isParentChildEvent)
  const [requireApproval, setRequireApproval] = useState(event.requireApproval)

  const showGenderMix = isTeamEvent && gender !== 'male' && gender !== 'female'

  function getEffectiveGenderMix(): NonNullable<SportEvent['teamEligibility']>['genderMix'] {
    if (gender === 'male') return 'all_male'
    if (gender === 'female') return 'all_female'
    return teamGenderMix as NonNullable<SportEvent['teamEligibility']>['genderMix']
  }

  function computeFee(): number | undefined {
    if (!categoryId) return undefined
    const catFees = workspace.feeStructure.perCategory[categoryId]
    if (!catFees) return undefined
    if (isTeamEvent && minTeamMembers) {
      return catFees.teamFeePerPlayer * parseInt(minTeamMembers)
    }
    return catFees.individualFee
  }

  function saveDetails() {
    updateEvent(sportId, event.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      categoryId,
      capacity: capacity ? parseInt(capacity) : undefined,
      competitionDates: compStart && compEnd ? { start: compStart, end: compEnd } : undefined,
      fee: computeFee(),
    })
    setEditingSection(null)
    toast('Event details updated')
  }

  function saveEligibility() {
    updateEvent(sportId, event.id, {
      gender: (gender as SportEvent['gender']) || undefined,
      ageRange: {
        minAge: minAge ? parseInt(minAge) : undefined,
        maxAge: hasMaxAge && maxAge ? parseInt(maxAge) : undefined,
      },
      isTeamEvent,
      minTeamMembers: isTeamEvent && minTeamMembers ? parseInt(minTeamMembers) : undefined,
      maxTeamMembers: isTeamEvent && maxTeamMembers ? parseInt(maxTeamMembers) : undefined,
      teamEligibility: isTeamEvent ? {
        ...event.teamEligibility,
        genderMix: getEffectiveGenderMix(),
      } : undefined,
      isParentChildEvent: isTeamEvent && isParentChild,
      requireApproval,
      fee: computeFee(),
    })
    setEditingSection(null)
    toast('Eligibility updated')
  }

  function cancelDetails() {
    setName(event.name)
    setDescription(event.description || '')
    setCategoryId(event.categoryId)
    setCapacity(event.capacity?.toString() || '')
    setCompStart(event.competitionDates?.start || '')
    setCompEnd(event.competitionDates?.end || '')
    setEditingSection(null)
  }

  function cancelEligibility() {
    setGender(event.gender || '')
    setMinAge(event.ageRange?.minAge?.toString() || '')
    setHasMaxAge(!!event.ageRange?.maxAge)
    setMaxAge(event.ageRange?.maxAge?.toString() || '')
    setIsTeamEvent(event.isTeamEvent)
    setMinTeamMembers(event.minTeamMembers?.toString() || '')
    setMaxTeamMembers(event.maxTeamMembers?.toString() || '')
    setTeamGenderMix(event.teamEligibility?.genderMix || 'mixed_any')
    setIsParentChild(event.isParentChildEvent)
    setRequireApproval(event.requireApproval)
    setEditingSection(null)
  }

  const genderLabels: Record<string, string> = { male: 'Male only', female: 'Female only', mixed: 'Mixed' }
  const genderMixLabels: Record<string, string> = {
    all_male: 'All male',
    all_female: 'All female',
    mixed_any: 'Mixed (no constraint)',
    mixed_min_one_female: 'Mixed (at least 1 female)',
    mixed_min_one_male: 'Mixed (at least 1 male)',
  }

  return (
    <div className="space-y-6">
      {/* Event details */}
      <Card>
        <CardContent>
          <SectionHeader title="Event details" onEdit={() => setEditingSection('details')} editing={editingSection === 'details'} />
          {editingSection === 'details' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Event name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workspace.categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="No limit" />
              </div>
              <div className="space-y-2">
                <Label>Competition start</Label>
                <Input type="date" value={compStart} onChange={(e) => setCompStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Competition end</Label>
                <Input type="date" value={compEnd} onChange={(e) => setCompEnd(e.target.value)} />
              </div>
              <div className="flex gap-2 pt-4">
                <Button size="sm" onClick={saveDetails} disabled={!name.trim()}>Save</Button>
                <Button size="sm" variant="outline" onClick={cancelDetails}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div>
              <Field label="Event name" value={event.name} />
              <Field label="Description" value={event.description || '—'} />
              <Field label="Category" value={category?.name || '—'} />
              <Field label="Capacity" value={event.capacity?.toString() || '—'} />
              <Field label="Competition dates" value={event.competitionDates ? `${formatDate(event.competitionDates.start)} – ${formatDate(event.competitionDates.end)}` : '—'} />
              <Field label="Calculated fee" value={event.fee !== undefined ? `S$${event.fee.toFixed(2)}${event.isTeamEvent ? ' per team' : ' per participant'}` : '—'} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Who can participate */}
      <Card>
        <CardContent>
          <SectionHeader title="Who can participate" onEdit={() => setEditingSection('eligibility')} editing={editingSection === 'eligibility'} />
          {editingSection === 'eligibility' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Gender</Label>
                <div className="flex gap-4">
                  {([['male', 'Male only'], ['female', 'Female only'], ['mixed', 'Mixed']] as const).map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="ev-gender" value={val} checked={gender === val} onChange={() => setGender(val)} className="h-4 w-4 accent-neutral-900" />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Minimum age</Label>
                <Input type="number" min={1} value={minAge} onChange={(e) => setMinAge(e.target.value)} placeholder="e.g. 16" />
                <p className="text-xs text-neutral-500">Age is calculated from the participant's year of birth.</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Maximum age</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">Has max age</span>
                    <Switch checked={hasMaxAge} onCheckedChange={(c) => { setHasMaxAge(c as boolean); if (!c) setMaxAge('') }} />
                  </div>
                </div>
                {hasMaxAge && (
                  <Input type="number" min={1} value={maxAge} onChange={(e) => setMaxAge(e.target.value)} placeholder="e.g. 54" />
                )}
              </div>

              <div className="border-t border-neutral-200 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Team event</Label>
                  <Switch checked={isTeamEvent} onCheckedChange={(c) => setIsTeamEvent(c as boolean)} />
                </div>
                {isTeamEvent && (
                  <>
                    <div className="space-y-2">
                      <Label>Team size</Label>
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-1">
                          <span className="text-xs text-neutral-500">Minimum</span>
                          <Input type="number" min={1} value={minTeamMembers} onChange={(e) => setMinTeamMembers(e.target.value)} placeholder="e.g. 6" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <span className="text-xs text-neutral-500">Maximum</span>
                          <Input type="number" min={1} value={maxTeamMembers} onChange={(e) => setMaxTeamMembers(e.target.value)} placeholder="e.g. 9" />
                        </div>
                      </div>
                    </div>
                    {showGenderMix && (
                      <div className="space-y-2">
                        <Label>Gender mix</Label>
                        <Select value={teamGenderMix} onValueChange={setTeamGenderMix}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mixed_any">Mixed (no constraint)</SelectItem>
                            <SelectItem value="mixed_min_one_female">Mixed (at least 1 female)</SelectItem>
                            <SelectItem value="mixed_min_one_male">Mixed (at least 1 male)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {!showGenderMix && gender && (
                      <div className="space-y-1">
                        <Label>Gender mix</Label>
                        <p className="text-sm text-neutral-600">
                          {gender === 'male' ? 'All male' : 'All female'} (determined by the gender requirement above)
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Is this a Parent-Child event?</Label>
                        <p className="text-xs text-neutral-500 mt-0.5">A parent registers on behalf of their child.</p>
                      </div>
                      <Switch checked={isParentChild} onCheckedChange={(c) => setIsParentChild(c as boolean)} />
                    </div>
                  </>
                )}
              </div>

              <div className="border-t border-neutral-200 pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Approval required</Label>
                  <Switch checked={requireApproval} onCheckedChange={(c) => setRequireApproval(c as boolean)} />
                </div>
                <p className="text-sm text-neutral-600">
                  If approval is required, all registrations will be pending until an admin reviews and approves the registration. Registrations will be routed to a review queue.
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button size="sm" onClick={saveEligibility}>Save</Button>
                <Button size="sm" variant="outline" onClick={cancelEligibility}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div>
              <Field label="Gender" value={event.gender ? genderLabels[event.gender] : '—'} />
              <Field label="Minimum age" value={event.ageRange?.minAge ? `${event.ageRange.minAge} years` : '—'} />
              <Field label="Maximum age" value={event.ageRange?.maxAge ? `${event.ageRange.maxAge} years` : '—'} />
              <Field label="Team event" value={event.isTeamEvent ? 'Yes' : 'No'} />
              {event.isTeamEvent && (
                <>
                  <Field label="Team size" value={`${event.minTeamMembers || '—'} – ${event.maxTeamMembers || '—'} members`} />
                  <Field label="Gender mix" value={event.teamEligibility?.genderMix ? genderMixLabels[event.teamEligibility.genderMix] || event.teamEligibility.genderMix : '—'} />
                  <Field label="Parent-child event" value={event.isParentChildEvent ? 'Yes' : 'No'} />
                </>
              )}
              <Field label="Approval required" value={event.requireApproval ? 'Yes' : 'No'} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inherited from workspace + sport */}
      <Card>
        <CardContent>
          <SectionHeader title="Inherited from workspace + sport" />
          <p className="text-xs text-neutral-500 mb-4">These apply to every registration in this event. Edit them at the workspace or sport level if you need to change them.</p>
          <div>
            {enabledRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <p className="text-sm text-neutral-700">{rule.label}</p>
                <Badge variant="secondary" className="bg-neutral-100 text-neutral-500 text-xs">Workspace</Badge>
              </div>
            ))}
            {sport.maxEventsPerParticipant !== undefined && (
              <div className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <p className="text-sm text-neutral-700">Maximum {sport.maxEventsPerParticipant} events per participant</p>
                <Badge variant="secondary" className="bg-neutral-100 text-neutral-500 text-xs">Sport</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const regStatusStyles: Record<string, string> = {
  confirmed: 'bg-emerald-50 text-emerald-700',
  pending_indemnity: 'bg-amber-50 text-amber-700',
  refunded: 'bg-neutral-100 text-neutral-700',
  rejected: 'bg-red-50 text-red-700',
  waitlisted: 'bg-neutral-100 text-neutral-700',
}

const regStatusLabels: Record<string, string> = {
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

function relationshipLabel(rel: string): string {
  const map: Record<string, string> = { self: 'Self', parent: 'Parent', guardian: 'Guardian', team_manager: 'Team manager' }
  return map[rel] || rel
}

type RowItem =
  | { kind: 'individual'; reg: Registration }
  | { kind: 'team'; team: Team; members: Registration[] }

function RegistrationsTab({ eventId }: { eventId: string }) {
  const workspace = useStore((s) => s.workspace)
  const navigate = useNavigate()
  const registrations = workspace.registrations.filter((r) => r.eventId === eventId)
  const teams = workspace.teams.filter((t) => t.eventId === eventId)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<RowItem | null>(null)
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set())
  const [rejectModal, setRejectModal] = useState<{ name: string; id: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

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

  function toggleMember(id: string) {
    setExpandedMembers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleReject() {
    if (!rejectModal) return
    toast('Rejection email sent to participant')
    setRejectModal(null)
    setRejectReason('')
  }

  // Build row items
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
      if (statusFilter && r.status !== statusFilter) return false
      if (search && !r.participantName.toLowerCase().includes(search.toLowerCase())) return false
    } else {
      const { team, members } = item
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

  return (
    <div className="max-w-[800px]">
      {/* Link to full registrations page */}
      <button
        onClick={() => navigate('/registrations')}
        className="flex items-center justify-between w-full rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-left hover:border-neutral-300 transition-colors mb-6"
      >
        <div>
          <p className="text-sm font-medium text-neutral-900">Looking for registrations for all events?</p>
          <p className="text-xs text-neutral-500 mt-0.5">Go to registration page</p>
        </div>
        <ArrowRight className="h-4 w-4 text-neutral-400 shrink-0" />
      </button>

      {registrations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-neutral-500">No registrations yet for this event.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search by participant or team name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  {statusFilter && <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />}
                  <span className="text-xs">{statusFilter ? regStatusLabels[statusFilter] : 'All statuses'}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setStatusFilter(null)} className="text-xs">All statuses</DropdownMenuItem>
                {Object.entries(regStatusLabels).map(([value, label]) => (
                  <DropdownMenuItem key={value} onClick={() => setStatusFilter(value)} className="text-xs">{label}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {statusFilter && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-neutral-500"
                onClick={() => setStatusFilter(null)}
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
                  <TableHead className="text-xs">Registered</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-neutral-500 py-8">
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
                          <TableCell className="text-sm text-neutral-500">{format(new Date(reg.registeredAt), 'd MMM yyyy')}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={regStatusStyles[reg.status] || ''}>
                              {regStatusLabels[reg.status] || reg.status}
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
            <EventRegIndividualPanel
              reg={selectedItem.reg}
              onReject={(name, id) => setRejectModal({ name, id })}
            />
          )}
          {selectedItem?.kind === 'team' && (
            <EventRegTeamPanel
              team={selectedItem.team}
              members={selectedItem.members}
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

function EventRegDetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="border border-neutral-200 rounded-lg bg-white p-4">
        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">{title}</h4>
        <div className="space-y-3">{children}</div>
      </div>
    </div>
  )
}

function EventRegDetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-neutral-500 mb-0.5">{label}</p>
      <p className="text-sm text-neutral-900">{value}</p>
    </div>
  )
}

function EventRegIndividualPanel({
  reg,
  onReject,
}: {
  reg: Registration
  onReject: (name: string, id: string) => void
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-6 pb-6">
          <SheetHeader className="p-0 mb-6">
            <SheetTitle className="text-lg">{reg.participantName}</SheetTitle>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant="secondary" className={regStatusStyles[reg.status] || ''}>
                {regStatusLabels[reg.status] || reg.status}
              </Badge>
            </div>
          </SheetHeader>

          <EventRegDetailSection title="Participant">
            <EventRegDetailField label="Name" value={reg.participantName} />
            {reg.participantNric && <EventRegDetailField label="NRIC" value={reg.participantNric} />}
            <EventRegDetailField label="Date of birth" value={format(new Date(reg.participantDob), 'd MMM yyyy')} />
            {reg.participantGender && <EventRegDetailField label="Gender" value={reg.participantGender === 'male' ? 'Male' : 'Female'} />}
            <EventRegDetailField label="Residency" value={residencyLabels[reg.participantResidency]} />
            {reg.participantMobile && <EventRegDetailField label="Mobile" value={reg.participantMobile} />}
            {reg.participantEmail && <EventRegDetailField label="Email" value={reg.participantEmail} />}
          </EventRegDetailSection>

          <EventRegDetailSection title="Registered by">
            <EventRegDetailField label="Name" value={reg.registeredBy.name} />
            <EventRegDetailField label="Relationship" value={relationshipLabel(reg.registeredBy.relationship)} />
            <EventRegDetailField label="NRIC" value={reg.registeredBy.nric} />
            <EventRegDetailField label="Mobile" value={reg.registeredBy.mobile} />
            <EventRegDetailField label="Email" value={reg.registeredBy.email} />
          </EventRegDetailSection>

          <EventRegDetailSection title="Emergency contact">
            <EventRegDetailField label="Name" value={reg.emergencyContact.name} />
            <EventRegDetailField label="Relationship" value={reg.emergencyContact.relationship} />
            <EventRegDetailField label="Phone" value={reg.emergencyContact.phone} />
            {reg.emergencyContact.altPhone && <EventRegDetailField label="Alt phone" value={reg.emergencyContact.altPhone} />}
          </EventRegDetailSection>

          <EventRegDetailSection title="Registration">
            <EventRegDetailField label="Registered" value={format(new Date(reg.registeredAt), 'd MMM yyyy, h:mm a')} />
            <EventRegDetailField label="Fee paid" value={`S$${reg.feePaid.toFixed(2)}`} />
            {reg.jerseyNumber !== undefined && <EventRegDetailField label="Jersey number" value={String(reg.jerseyNumber)} />}
          </EventRegDetailSection>
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

function EventRegTeamPanel({
  team,
  members,
  getTeamStatusSummary,
  expandedMembers,
  toggleMember,
  onReject,
}: {
  team: Team
  members: Registration[]
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

          <EventRegDetailSection title="Team details">
            <EventRegDetailField label="Members" value={`${members.length} of ${team.minMembers}–${team.maxMembers}`} />
            <EventRegDetailField label="Total fee" value={`S$${totalFee.toFixed(2)}`} />
            <EventRegDetailField label="Created" value={format(new Date(team.createdAt), 'd MMM yyyy')} />
          </EventRegDetailSection>

          <EventRegDetailSection title={`Members (${members.length})`}>
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
                      {member.participantNric && <EventRegDetailField label="NRIC" value={member.participantNric} />}
                      <EventRegDetailField label="Date of birth" value={format(new Date(member.participantDob), 'd MMM yyyy')} />
                      {member.participantGender && <EventRegDetailField label="Gender" value={member.participantGender === 'male' ? 'Male' : 'Female'} />}
                      <EventRegDetailField label="Residency" value={residencyLabels[member.participantResidency]} />
                      {member.participantMobile && <EventRegDetailField label="Mobile" value={member.participantMobile} />}
                      {member.participantEmail && <EventRegDetailField label="Email" value={member.participantEmail} />}
                      <EventRegDetailField label="Fee paid" value={`S$${member.feePaid.toFixed(2)}`} />
                      <EventRegDetailField label="Registered" value={format(new Date(member.registeredAt), 'd MMM yyyy')} />
                    </div>
                    <div className="mt-3 pt-3 border-t border-neutral-100 space-y-3">
                      <p className="text-xs font-medium text-neutral-500">Emergency contact</p>
                      <EventRegDetailField label="Name" value={member.emergencyContact.name} />
                      <EventRegDetailField label="Relationship" value={member.emergencyContact.relationship} />
                      <EventRegDetailField label="Phone" value={member.emergencyContact.phone} />
                    </div>
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-neutral-100">
                      <Badge variant="secondary" className={regStatusStyles[member.status] || ''}>
                        {regStatusLabels[member.status] || member.status}
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
          </EventRegDetailSection>
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

function TeamsTab({ eventId }: { eventId: string }) {
  const workspace = useStore((s) => s.workspace)
  const teams = workspace.teams.filter((t) => t.eventId === eventId)

  if (teams.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-neutral-500">No teams yet for this event.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team name</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => {
            const manager = workspace.registrations.find((r) => r.id === team.managerRegistrationId)
            return (
              <TableRow key={team.id}>
                <TableCell>
                  <p className="font-medium text-sm">{team.name}</p>
                  {manager && <p className="text-xs text-neutral-500">Manager: {manager.participantName}</p>}
                </TableCell>
                <TableCell>{team.memberRegistrationIds.length} / {team.minMembers}–{team.maxMembers}</TableCell>
                <TableCell><StatusBadge status={team.status} /></TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
