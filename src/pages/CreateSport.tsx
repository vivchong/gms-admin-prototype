import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  const [description, setDescription] = useState('')
  const [venue, setVenue] = useState('')
  const [competitionStart, setCompetitionStart] = useState(workspace.dateRange.start)
  const [competitionEnd, setCompetitionEnd] = useState(workspace.dateRange.end)
  const [registrationOpen, setRegistrationOpen] = useState(workspace.registrationWindow.start)
  const [registrationClose, setRegistrationClose] = useState(workspace.registrationWindow.end)
  const [lastChangeDate, setLastChangeDate] = useState('')
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

    const sport: Sport = {
      id: `sport-${Date.now()}`,
      name: name.trim(),
      pricingType,
      description: description.trim() || undefined,
      venue: venue.trim() || undefined,
      competitionDates: { start: competitionStart, end: competitionEnd },
      registrationOpenAt: registrationOpen || undefined,
      registrationCloseAt: registrationClose || undefined,
      lastChangeDate: lastChangeDate || undefined,
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

      <form ref={formRef} onSubmit={handleSubmit} className="max-w-2xl">
        <Card>
          <CardContent className="space-y-6">
            <div className="space-y-2" data-error={!!errors.name}>
              <Label htmlFor="name">Sport name</Label>
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the sport (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
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

            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-sm font-medium text-neutral-900 mb-4">Competition dates</h3>
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

            <div className="border-t border-neutral-200 pt-6">
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
                <Label htmlFor="last-change">Last date for changes</Label>
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
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 mt-6">
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
