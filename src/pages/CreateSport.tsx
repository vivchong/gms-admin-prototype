import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Trash2, PlusCircle, ChevronUp } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStore } from '@/lib/store'
import type { Sport } from '@/lib/types'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-red-600 mt-1">{message}</p>
}

export function CreateSport() {
  const navigate = useNavigate()
  const addSport = useStore((s) => s.addSport)
  const workspace = useStore((s) => s.workspace)
  const formRef = useRef<HTMLFormElement>(null)

  const [name, setName] = useState('')
  const [pricingType, setPricingType] = useState<'per_event' | 'bundle'>('per_event')
  const [venue, setVenue] = useState('')
  const [hasUploadedFile, setHasUploadedFile] = useState(false)
  const [competitionStart, setCompetitionStart] = useState(workspace.dateRange.start)
  const [competitionEnd, setCompetitionEnd] = useState(workspace.dateRange.end)
  const [registrationOpen, setRegistrationOpen] = useState(workspace.registrationWindow.start)
  const [registrationClose, setRegistrationClose] = useState(workspace.registrationWindow.end)
  const [lastChangeDate, setLastChangeDate] = useState('')
  const [formats, setFormats] = useState<string[]>(['', ''])
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Sport name is required'
    return errs
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)

    if (Object.keys(errs).length > 0) {
      const firstErrorField = formRef.current?.querySelector('[data-error="true"]')
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    const filledFormats = formats.map((f) => f.trim()).filter(Boolean)
    const sport: Sport = {
      id: `sport-${Date.now()}`,
      name: name.trim(),
      pricingType,
      description: undefined,
      venue: venue.trim() || undefined,
      competitionDates: { start: competitionStart, end: competitionEnd },
      registrationOpenAt: registrationOpen || undefined,
      registrationCloseAt: registrationClose || undefined,
      lastChangeDate: lastChangeDate || undefined,
      formats: filledFormats.length > 0 ? filledFormats : undefined,
      exemptCategoryIds: [],
      customQuestions: [],
      events: [],
      publicationStatus: 'draft',
    }

    addSport(sport)
    toast('Sport created')
    navigate(`/sports/${sport.id}`)
  }

  return (
    <div>
      <PageHeader
        title="Create sport"
        subtitle="Add a new sport to Pesta Sukan 2027"
        breadcrumbs={[
          { label: 'Sports', path: '/sports' },
          { label: 'Create sport' },
        ]}
      />

      <form ref={formRef} onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Section 1: Sport details */}
        <Card className="py-0 gap-0">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-base font-semibold text-neutral-900">Sport details</h2>
            </div>
            <div className="px-6 py-6 space-y-6">
            <div className="space-y-2" data-error={!!errors.name}>
              <Label htmlFor="name">Name of sport</Label>
              <Input
                id="name"
                placeholder="e.g. Pickleball, Basketball"
                value={name}
                onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((prev) => ({ ...prev, name: '' })) }}
                className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              <FieldError message={errors.name} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricing">Pricing type</Label>
              <Select value={pricingType} onValueChange={(v) => setPricingType(v as 'per_event' | 'bundle')}>
                <SelectTrigger id="pricing" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_event">Per event</SelectItem>
                  <SelectItem value="bundle">Bundle</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500">
                Per event charges each registration individually. Bundle pricing is not active for this prototype.
              </p>
            </div>


            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                placeholder="e.g. Our Tampines Hub, Kallang Sports Hall"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
            </div>

            {/* Rules & Regulations upload */}
            <div className="space-y-2">
              <Label>Rules & Regulations</Label>
              <div className="border border-dashed border-neutral-400 rounded-xl p-6">
                <h3 className="text-base font-normal text-neutral-900 mb-4">Upload Rules & Regulations for this sport</h3>

                <div className="bg-amber-50 border-l-4 border-amber-500 px-4 py-3 mb-6">
                  <p className="text-sm text-neutral-700">Maximum size per file: 2 MB</p>
                  <p className="text-sm text-neutral-700">Supported file type: .PDF</p>
                </div>

                {hasUploadedFile && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-center justify-between mb-6">
                    <span className="text-sm text-neutral-900">R&R.pdf</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-neutral-500">1 MB</span>
                      <button
                        type="button"
                        onClick={() => setHasUploadedFile(false)}
                        className="p-1.5 text-blue-700 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col items-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => setHasUploadedFile(true)}
                  >
                    Upload files
                  </Button>
                  <p className="text-sm text-neutral-500">or drop them here</p>
                </div>
              </div>
            </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Timelines & schedules */}
        <Card className="py-0 gap-0">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-base font-semibold text-neutral-900">Timelines & schedules</h2>
            </div>
            <div className="px-6 py-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-neutral-900 mb-4">Registration window</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-open">Opens</Label>
                  <Input
                    id="reg-open"
                    type="date"
                    value={registrationOpen}
                    onChange={(e) => setRegistrationOpen(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-close">Closes</Label>
                  <Input
                    id="reg-close"
                    type="date"
                    value={registrationClose}
                    onChange={(e) => setRegistrationClose(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Defaults to the workspace registration window. Override per sport if needed.
              </p>
            </div>

            <div className="border-t border-neutral-200 pt-6">
              <div className="space-y-2">
                <Label htmlFor="last-change">Last date for registration changes</Label>
                <Input
                  id="last-change"
                  type="date"
                  value={lastChangeDate}
                  onChange={(e) => setLastChangeDate(e.target.value)}
                />
                <p className="text-xs text-neutral-500">
                  After this date, participants cannot modify their registration details or team members.
                </p>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-sm font-medium text-neutral-900 mb-4">Competition period</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="comp-start">Start date</Label>
                  <Input
                    id="comp-start"
                    type="date"
                    value={competitionStart}
                    onChange={(e) => setCompetitionStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comp-end">End date</Label>
                  <Input
                    id="comp-end"
                    type="date"
                    value={competitionEnd}
                    onChange={(e) => setCompetitionEnd(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Defaults to the workspace competition window. Override per sport if needed.
              </p>
            </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Format filters */}
        <Card className="py-0 gap-0">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-base font-semibold text-neutral-900">Format filters</h2>
            </div>
            <div className="px-6 py-6 space-y-6">
              <p className="text-sm text-neutral-700">
                Create filters for each format in your sport, so users can easily find events.
              </p>

              <div>
                <p className="text-sm text-neutral-700 mb-2">Examples of formats:</p>
                <ul className="list-disc list-inside text-sm text-neutral-700 space-y-1 ml-1">
                  <li>Basketball: 5v5, 3x3</li>
                  <li>Pickleball: Singles, Doubles</li>
                  <li>Wushu: Taijiquan, Changquan, Nanquan, Broadsword, Spear, Sword, Cudgel, etc</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Formats (optional)</Label>
                <p className="text-xs text-neutral-500">Each label should not exceed 50 characters</p>
                <div className="space-y-3">
                  {formats.map((fmt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={fmt}
                        onChange={(e) => {
                          const updated = [...formats]
                          updated[i] = e.target.value.slice(0, 50)
                          setFormats(updated)
                        }}
                        maxLength={50}
                      />
                      <button
                        type="button"
                        onClick={() => setFormats(formats.filter((_, idx) => idx !== i))}
                        className="p-2 text-blue-600 hover:text-red-600 hover:bg-red-50 rounded shrink-0"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setFormats([...formats, ''])}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mt-3"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add format
                </button>
              </div>

              {/* Preview */}
              {formats.some((f) => f.trim()) && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-neutral-500">Preview</span>
                  </div>
                  <div className="border border-dashed border-neutral-300 rounded-xl bg-neutral-50 p-4 max-w-[220px]">
                    <div className="space-y-0">
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                        <span className="text-xs font-semibold text-neutral-900">Filters</span>
                        <span className="text-xs text-neutral-500">Clear</span>
                      </div>
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-neutral-700">Format</span>
                          <ChevronUp className="h-3 w-3 text-neutral-500" />
                        </div>
                        <p className="text-[10px] text-neutral-500 mb-2">Select all</p>
                        <div className="flex flex-wrap gap-1.5">
                          {formats.filter((f) => f.trim()).map((f, i) => (
                            <span key={i} className="inline-block text-[11px] border border-neutral-300 rounded px-2 py-0.5 text-neutral-700 bg-white">
                              {f.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>


        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/sports')}>
            Cancel
          </Button>
          <Button type="submit">
            Create sport
          </Button>
        </div>
      </form>
    </div>
  )
}
