import { CalendarDays, MapPin, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import type { SportEvent } from '@/lib/types'
import { useStore } from '@/lib/store'

type Props = {
  event: Partial<SportEvent> & { name?: string; sportId?: string }
  sportName: string
  categoryName?: string
  venue?: string
}

export function EventDetailsPreview({ event, sportName, categoryName, venue }: Props) {
  const workspace = useStore((s) => s.workspace)

  const genderLabel: Record<string, string> = { male: 'Male', female: 'Female', mixed: 'Male or Female' }
  const genderMixLabels: Record<string, string> = {
    all_male: 'All male',
    all_female: 'All female',
    mixed_any: 'Mixed (no constraint)',
    mixed_min_one_female: 'At least 1 female per team',
    mixed_min_one_male: 'At least 1 male per team',
  }

  const eligibility: string[] = []
  if (event.gender && event.gender !== 'mixed') {
    eligibility.push(genderLabel[event.gender] || event.gender)
  }
  if (event.ageRange?.minAge) {
    if (event.ageRange.maxAge) {
      eligibility.push(`Between ${event.ageRange.minAge} and ${event.ageRange.maxAge} years old this year`)
    } else {
      eligibility.push(`At least ${event.ageRange.minAge} years old this year`)
    }
  }
  eligibility.push('A Singapore citizen, permanent resident or foreigner with valid pass')

  const compStart = event.competitionDates?.start
  const compEnd = event.competitionDates?.end
  const regClose = workspace.registrationWindow.end

  return (
    <div className="font-[Inter,system-ui,sans-serif] text-[#282828] text-sm">
      {/* Header */}
      <div className="bg-neutral-100 rounded-xl p-5 mb-5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-600 mb-1">{sportName}{categoryName ? ` · ${categoryName}` : ''}</p>
        <h2 className="text-lg font-semibold leading-tight mb-3">{event.name || 'Untitled event'}</h2>
        {compStart && compEnd && (
          <div className="flex items-start gap-2 mb-2">
            <CalendarDays className="h-3.5 w-3.5 text-neutral-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-neutral-500">Tournament dates</p>
              <p className="text-xs">{format(new Date(compStart), 'd MMMM')} – {format(new Date(compEnd), 'd MMMM yyyy')}</p>
            </div>
          </div>
        )}
        {venue && (
          <div className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 text-neutral-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-neutral-500">Venue</p>
              <p className="text-xs">{venue}</p>
            </div>
          </div>
        )}
      </div>

      {/* Eligibility */}
      {eligibility.length > 0 && (
        <div className="mb-5">
          <h3 className="text-base font-semibold mb-2">Eligibility</h3>
          <p className="text-xs text-neutral-600 mb-2">Each participant must be:</p>
          <div className="space-y-2">
            {eligibility.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                <span className="text-xs">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team eligibility */}
      {event.isTeamEvent && (
        <div className="mb-5">
          <h3 className="text-base font-semibold mb-2">Team requirements</h3>
          <div className="space-y-1.5 text-xs text-neutral-700">
            {event.minTeamMembers && event.maxTeamMembers && (
              <p>Team size: {event.minTeamMembers} – {event.maxTeamMembers} members</p>
            )}
            {event.teamEligibility?.genderMix && (
              <p>Gender mix: {genderMixLabels[event.teamEligibility.genderMix] || event.teamEligibility.genderMix}</p>
            )}
            {event.teamEligibility?.foreignerQuota === 'general_rnr_default' && (
              <p>Foreigner quota: General R&R applies</p>
            )}
            {event.teamEligibility?.corporateStaffRatio && (
              <p>Minimum {Math.round(event.teamEligibility.corporateStaffRatio * 100)}% company staff</p>
            )}
          </div>
        </div>
      )}

      {/* Parent-child note */}
      {event.isParentChildEvent && (
        <div className="mb-5 rounded-lg bg-neutral-50 border border-neutral-200 p-3">
          <p className="text-xs text-neutral-700">A parent or guardian registers the child on their behalf.</p>
        </div>
      )}

      {/* Next steps */}
      <div className="mb-5">
        <h3 className="text-base font-semibold mb-3">Next steps</h3>
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-neutral-900" />
            <div className="w-px flex-1 bg-neutral-300" />
            <div className="w-2 h-2 rounded-full bg-neutral-300" />
          </div>
          <div className="space-y-4 flex-1 pb-1">
            <div>
              <p className="text-xs font-semibold">Register and pay</p>
              {regClose && (
                <span className="inline-block mt-1 text-[10px] border border-neutral-300 rounded px-1.5 py-0.5">
                  By {format(new Date(regClose), 'd MMM yyyy')}
                </span>
              )}
              {event.requireApproval && (
                <p className="text-[10px] text-neutral-600 mt-1">Registrations require admin approval before confirmation.</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold">Play!</p>
              <p className="text-[10px] text-neutral-600">Schedule will be released around 2 weeks before the event begins.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="border-t border-neutral-200 pt-3 mt-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-base font-bold">
              {event.fee !== undefined ? `$${event.fee.toFixed(2)}` : '—'}
            </span>
            <span className="text-xs text-neutral-500 ml-1">
              {event.isTeamEvent ? 'per team' : 'per person'}
            </span>
          </div>
          {event.capacity && (
            <span className="text-[10px] border border-neutral-300 rounded-full px-2 py-0.5">
              {event.capacity} spots
            </span>
          )}
        </div>
        {regClose && (
          <p className="text-[10px] text-neutral-500">Register by {format(new Date(regClose), 'd MMM yyyy')}</p>
        )}
        <button disabled className="w-full mt-3 bg-neutral-300 text-neutral-500 text-xs font-medium rounded-lg py-2.5 text-center cursor-not-allowed">
          Log in with Singpass to register
        </button>
      </div>
    </div>
  )
}
