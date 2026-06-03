import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
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
import { useStore } from '@/lib/store'
import { PreviewPanel } from '@/components/preview/PreviewPanel'
import { EventDetailsPreview } from '@/components/preview/EventDetailsPreview'
import type { SportEvent } from '@/lib/types'

export function CreateEvent() {
  const { sportId } = useParams()
  const navigate = useNavigate()
  const workspace = useStore((s) => s.workspace)
  const saveEvent = useStore((s) => s.saveEvent)
  const sport = workspace.sports.find((s) => s.id === sportId)


  // Step 1 fields
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [formatValue, setFormatValue] = useState('')
  const [capacity, setCapacity] = useState('')
  const [compStart, setCompStart] = useState(sport?.competitionDates.start || '')
  const [compEnd, setCompEnd] = useState(sport?.competitionDates.end || '')
  const [eventVenue, setEventVenue] = useState(sport?.venue || '')
  const [regOpen, setRegOpen] = useState(sport?.registrationOpenAt || '')
  const [regClose, setRegClose] = useState(sport?.registrationCloseAt || '')
  const [lastChangeDate, setLastChangeDate] = useState(sport?.lastChangeDate || '')
  const [gender, setGender] = useState<'male' | 'female' | 'mixed' | ''>('')
  const [minAge, setMinAge] = useState('')
  const [hasMaxAge, setHasMaxAge] = useState(false)
  const [maxAge, setMaxAge] = useState('')
  const [isTeamEvent, setIsTeamEvent] = useState(false)
  const [minTeamMembers, setMinTeamMembers] = useState('')
  const [maxTeamMembers, setMaxTeamMembers] = useState('')
  const [teamGenderMix, setTeamGenderMix] = useState<string>('mixed_any')
  const [combinedAgeMin, setCombinedAgeMin] = useState('')
  const [combinedAgeMax, setCombinedAgeMax] = useState('')
  const [foreignerQuota] = useState<'general_rnr_default' | 'custom'>('general_rnr_default')
  const [corpStaffRatio, setCorpStaffRatio] = useState('')
  const [corpMinSgPr, setCorpMinSgPr] = useState('')
  const [corpMaxNonStaff, setCorpMaxNonStaff] = useState('')
  const [hasAdditionalEligibility, setHasAdditionalEligibility] = useState(false)
  const [additionalEligibility, setAdditionalEligibility] = useState('Requirement 1\nRequirement 2')
  const [hasTeamAdditionalEligibility, setHasTeamAdditionalEligibility] = useState(false)
  const [teamAdditionalEligibility, setTeamAdditionalEligibility] = useState('Requirement 1\nRequirement 2')
  const [isParentChild, setIsParentChild] = useState(false)
  const [childMinAge, setChildMinAge] = useState('')
  const [childMaxAge, setChildMaxAge] = useState('')
  const [requireApproval, setRequireApproval] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const formRef = useRef<HTMLDivElement>(null)

  if (!sport) {
    navigate('/sports')
    return null
  }

  const isCorporate = categoryId === 'cat-corporate'
  const showGenderMix = isTeamEvent && gender !== 'male' && gender !== 'female'

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Event name is required'
    if (!categoryId) errs.category = 'Category is required'
    if (sport && sport.formats && sport.formats.length > 0 && !formatValue) errs.format = 'Format is required'
    return errs
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

  function getEffectiveGenderMix(): NonNullable<SportEvent['teamEligibility']>['genderMix'] {
    if (gender === 'male') return 'all_male'
    if (gender === 'female') return 'all_female'
    return teamGenderMix as NonNullable<SportEvent['teamEligibility']>['genderMix']
  }

  function handleSave() {
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      setTimeout(() => {
        const firstError = formRef.current?.querySelector('[data-error="true"]')
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 0)
      return
    }

    const event: SportEvent = {
      id: `event-${Date.now()}`,
      sportId: sportId!,
      name: name.trim(),
      description: undefined,
      categoryId,
      gender: gender || undefined,
      ageRange: {
        minAge: minAge ? parseInt(minAge) : undefined,
        maxAge: hasMaxAge && maxAge ? parseInt(maxAge) : undefined,
      },
      fee: computeFee(),
      capacity: capacity ? parseInt(capacity) : undefined,
      competitionDates: compStart && compEnd ? { start: compStart, end: compEnd } : undefined,
      isTeamEvent,
      minTeamMembers: isTeamEvent && minTeamMembers ? parseInt(minTeamMembers) : undefined,
      maxTeamMembers: isTeamEvent && maxTeamMembers ? parseInt(maxTeamMembers) : undefined,
      teamEligibility: isTeamEvent ? {
        genderMix: getEffectiveGenderMix(),
        combinedAge: (combinedAgeMin || combinedAgeMax) ? { min: combinedAgeMin ? parseInt(combinedAgeMin) : undefined, max: combinedAgeMax ? parseInt(combinedAgeMax) : undefined } : undefined,
        foreignerQuota,
        foreignerQuotaCustom: undefined,
        corporateStaffRatio: isCorporate && corpStaffRatio ? parseFloat(corpStaffRatio) : undefined,
        minSgPrAmongStaff: isCorporate && corpMinSgPr ? parseFloat(corpMinSgPr) : undefined,
        maxNonStaffPlayers: isCorporate && corpMaxNonStaff ? parseInt(corpMaxNonStaff) : undefined,
      } : undefined,
      isParentChildEvent: isTeamEvent && isParentChild,
      childAgeRange: isTeamEvent && isParentChild ? { minAge: childMinAge ? parseInt(childMinAge) : undefined, maxAge: childMaxAge ? parseInt(childMaxAge) : undefined } : undefined,
      requireApproval,
      customQuestions: [],
      publicationStatus: 'draft',
    }

    saveEvent(sportId!, event)
    toast('Event created')
    navigate(`/sports/${sportId}/events/${event.id}`)
  }

  const fee = computeFee()

  return (
    <div>
      <PageHeader
        title="Create event"
        subtitle={`Adding event to ${sport.name}`}
        breadcrumbs={[
          { label: 'Sports', path: '/sports' },
          { label: sport.name, path: `/sports/${sportId}` },
          { label: 'Create event' },
        ]}
      />

      <div ref={formRef} className="max-w-2xl space-y-6">
          {/* Event details section */}
          <Card>
            <CardContent>
              <h3 className="text-base font-semibold text-neutral-900 pb-4 border-b border-neutral-200 mb-4">Event details</h3>
              <div className="space-y-4">
                <div className="space-y-2" data-error={!!errors.name}>
                  <Label>Name of event</Label>
                  <Input
                    value={name}
                    onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((prev) => ({ ...prev, name: '' })) }}
                    placeholder="e.g. Open Women's Singles"
                    className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                  {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                </div>
                <div className="space-y-2" data-error={!!errors.category}>
                  <Label>Category</Label>
                  <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); if (errors.category) setErrors((prev) => ({ ...prev, category: '' })) }}>
                    <SelectTrigger className={`w-full ${errors.category ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {workspace.categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-xs text-red-600">{errors.category}</p>}
                </div>
                {sport.formats && sport.formats.length > 0 && (
                  <div className="space-y-2" data-error={!!errors.format}>
                    <Label>Format</Label>
                    <p className="text-xs text-neutral-500">Assign a format so users can filter for events with this format.</p>
                    <Select value={formatValue} onValueChange={(v) => { setFormatValue(v); if (errors.format) setErrors((prev) => ({ ...prev, format: '' })) }}>
                      <SelectTrigger className={`w-full ${errors.format ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select a format" />
                      </SelectTrigger>
                      <SelectContent>
                        {sport.formats.map((fmt) => (
                          <SelectItem key={fmt} value={fmt}>{fmt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.format && <p className="text-xs text-red-600">{errors.format}</p>}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Tournament period</Label>
                  <div className="flex items-center gap-0 border border-neutral-300 rounded-md overflow-hidden">
                    <input
                      type="date"
                      value={compStart}
                      onChange={(e) => setCompStart(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm bg-white focus:outline-none"
                    />
                    <span className="text-neutral-400 px-2 shrink-0">&rarr;</span>
                    <input
                      type="date"
                      value={compEnd}
                      onChange={(e) => setCompEnd(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm bg-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Venue</Label>
                  <Input value={eventVenue} onChange={(e) => setEventVenue(e.target.value)} placeholder="e.g. Our Tampines Hub, Kallang Sports Hall" />
                </div>
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Max participants or teams (optional)" />
                </div>
                <div className="space-y-2">
                  <Label>Registration window</Label>
                  <div className="flex items-center gap-0 border border-neutral-300 rounded-md overflow-hidden">
                    <input
                      type="date"
                      value={regOpen}
                      onChange={(e) => setRegOpen(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm bg-white focus:outline-none"
                    />
                    <span className="text-neutral-400 px-2 shrink-0">&rarr;</span>
                    <input
                      type="date"
                      value={regClose}
                      onChange={(e) => setRegClose(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm bg-white focus:outline-none"
                    />
                  </div>
                  <p className="text-xs text-neutral-500">Inherited from sport. Override per event if needed.</p>
                </div>
                <div className="space-y-2">
                  <Label>Last date for user to make changes</Label>
                  <Input type="date" value={lastChangeDate} onChange={(e) => setLastChangeDate(e.target.value)} />
                  <p className="text-xs text-neutral-500">Inherited from sport. After this date, participants cannot modify their registration.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Eligibility */}
          <Card>
            <CardContent>
              <h3 className="text-base font-semibold text-neutral-900 pb-4 border-b border-neutral-200 mb-4">Eligibility</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <div className="flex gap-4">
                    {([['male', 'Male only'], ['female', 'Female only'], ['mixed', 'Mixed']] as const).map(([val, label]) => (
                      <label key={val} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value={val}
                          checked={gender === val}
                          onChange={() => setGender(val)}
                          className="h-4 w-4 accent-neutral-900"
                        />
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

                <div className="border-t border-neutral-200 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Additional eligibility requirements</Label>
                      <p className="text-xs text-neutral-500 mt-0.5">Specify other requirements for each athlete</p>
                    </div>
                    <Switch checked={hasAdditionalEligibility} onCheckedChange={(c) => setHasAdditionalEligibility(c as boolean)} />
                  </div>
                  {hasAdditionalEligibility && (
                    <div className="space-y-2 mt-3">
                      <Label>Each participant must be...</Label>
                      <Textarea
                        value={additionalEligibility}
                        onChange={(e) => setAdditionalEligibility(e.target.value)}
                        rows={4}
                        placeholder="One requirement per line"
                      />
                      <p className="text-xs text-neutral-500">Enter one requirement per line.</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team event */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
                <h3 className="text-base font-semibold text-neutral-900">Team event?</h3>
                <Switch checked={isTeamEvent} onCheckedChange={(c) => setIsTeamEvent(c as boolean)} />
              </div>
              {isTeamEvent && (
                <div className="space-y-4">
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
                  <div className="space-y-2">
                    <Label>Combined age (optional)</Label>
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-1">
                        <span className="text-xs text-neutral-500">Minimum combined</span>
                        <Input type="number" value={combinedAgeMin} onChange={(e) => setCombinedAgeMin(e.target.value)} placeholder="Optional" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <span className="text-xs text-neutral-500">Maximum combined</span>
                        <Input type="number" value={combinedAgeMax} onChange={(e) => setCombinedAgeMax(e.target.value)} placeholder="Optional" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Foreigner quota</Label>
                    <p className="text-sm text-neutral-600">General R&R default applies</p>
                  </div>
                  {isCorporate && (
                    <div className="space-y-2 border-t border-neutral-200 pt-4">
                      <Label>Corporate team rules</Label>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <span className="text-xs text-neutral-500">Minimum company staff ratio</span>
                          <Input type="number" step="0.1" min={0} max={1} value={corpStaffRatio} onChange={(e) => setCorpStaffRatio(e.target.value)} placeholder="e.g. 0.7" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-neutral-500">Minimum SG/PR among staff</span>
                          <Input type="number" step="0.1" min={0} max={1} value={corpMinSgPr} onChange={(e) => setCorpMinSgPr(e.target.value)} placeholder="e.g. 0.5" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-neutral-500">Maximum non-staff players</span>
                          <Input type="number" min={0} value={corpMaxNonStaff} onChange={(e) => setCorpMaxNonStaff(e.target.value)} placeholder="e.g. 1" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Parent-Child (only in team event section) */}
                  <div className="border-t border-neutral-200 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Is this a Parent-Child event?</Label>
                        <p className="text-xs text-neutral-500 mt-0.5">An event where a parent and child team up to play.</p>
                      </div>
                      <Switch checked={isParentChild} onCheckedChange={(c) => setIsParentChild(c as boolean)} />
                    </div>
                    {isParentChild && (
                      <div className="space-y-2 mt-3">
                        <Label>Child age range</Label>
                        <div className="flex gap-4">
                          <div className="flex-1 space-y-1">
                            <span className="text-xs text-neutral-500">Min age</span>
                            <Input type="number" min={1} placeholder="e.g. 6" value={childMinAge} onChange={(e) => setChildMinAge(e.target.value)} />
                          </div>
                          <div className="flex-1 space-y-1">
                            <span className="text-xs text-neutral-500">Max age</span>
                            <Input type="number" min={1} placeholder="e.g. 12" value={childMaxAge} onChange={(e) => setChildMaxAge(e.target.value)} />
                          </div>
                        </div>
                        <p className="text-xs text-neutral-500">Age is calculated from the child's year of birth.</p>
                      </div>
                    )}
                  </div>

                  {/* Additional team eligibility */}
                  <div className="border-t border-neutral-200 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Additional team eligibility requirements</Label>
                        <p className="text-xs text-neutral-500 mt-0.5">Specify any requirements that apply to the whole team</p>
                      </div>
                      <Switch checked={hasTeamAdditionalEligibility} onCheckedChange={(c) => setHasTeamAdditionalEligibility(c as boolean)} />
                    </div>
                    {hasTeamAdditionalEligibility && (
                      <div className="space-y-2 mt-3">
                        <Label>Each member must be...</Label>
                        <Textarea
                          value={teamAdditionalEligibility}
                          onChange={(e) => setTeamAdditionalEligibility(e.target.value)}
                          rows={4}
                          placeholder="One requirement per line"
                        />
                        <p className="text-xs text-neutral-500">Enter one requirement per line.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approval */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-neutral-900">Approval required?</h3>
                <Switch checked={requireApproval} onCheckedChange={(c) => setRequireApproval(c as boolean)} />
              </div>
              <p className="text-sm text-neutral-600">
                If approval is required, all registrations will be pending until an admin reviews and approves the registration. Registrations will be routed to a review queue.
              </p>
            </CardContent>
          </Card>

          {/* Calculated fee at bottom */}
          {fee !== undefined && (
            <Card>
              <CardContent>
                <div className="rounded-lg bg-neutral-50 border border-neutral-200 px-4 py-3">
                  <p className="text-xs text-neutral-500 mb-0.5">Calculated fee</p>
                  <p className="text-sm font-medium text-neutral-900">S${fee.toFixed(2)}{isTeamEvent && minTeamMembers ? ' per team' : ' per participant'}</p>
                  <p className="text-xs text-neutral-500 mt-1">Auto-calculated from the workspace fee structure. Edit at workspace level.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview */}
          <PreviewPanel label="Participant view — Event page">
            <EventDetailsPreview
              event={{
                name: name || undefined,
                gender: gender || undefined,
                ageRange: minAge ? { minAge: parseInt(minAge), maxAge: hasMaxAge && maxAge ? parseInt(maxAge) : undefined } : undefined,
                fee,
                capacity: capacity ? parseInt(capacity) : undefined,
                competitionDates: compStart && compEnd ? { start: compStart, end: compEnd } : undefined,
                isTeamEvent,
                minTeamMembers: isTeamEvent && minTeamMembers ? parseInt(minTeamMembers) : undefined,
                maxTeamMembers: isTeamEvent && maxTeamMembers ? parseInt(maxTeamMembers) : undefined,
                teamEligibility: isTeamEvent ? {
                  genderMix: gender === 'male' ? 'all_male' : gender === 'female' ? 'all_female' : teamGenderMix as 'mixed_any',
                  foreignerQuota: foreignerQuota,
                  corporateStaffRatio: isCorporate && corpStaffRatio ? parseFloat(corpStaffRatio) : undefined,
                } : undefined,
                isParentChildEvent: isTeamEvent && isParentChild,
                requireApproval,
              }}
              sportName={sport.name}
              categoryName={workspace.categories.find((c) => c.id === categoryId)?.name}
              venue={sport.venue}
              additionalEligibility={hasAdditionalEligibility ? additionalEligibility.split('\n').filter((l) => l.trim()) : undefined}
              teamAdditionalEligibility={hasTeamAdditionalEligibility ? teamAdditionalEligibility.split('\n').filter((l) => l.trim()) : undefined}
              registrationCloseDate={regClose || undefined}
              lastChangeDate={lastChangeDate || undefined}
            />
          </PreviewPanel>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => navigate(`/sports/${sportId}`)}>Cancel</Button>
            <Button onClick={handleSave}>Create event</Button>
          </div>
        </div>
    </div>
  )
}
