import { Info, ChevronUp, Upload } from 'lucide-react'
import type { FormQuestion, SportEvent } from '@/lib/types'

type Props = {
  event: Partial<SportEvent>
  sportQuestions: FormQuestion[]
  eventQuestions: FormQuestion[]
}

function PreviewField({ label, value, readonly, description }: { label: string; value?: string; readonly?: boolean; description?: string }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-neutral-800 mb-1.5">{label}</p>
      {description && <p className="text-[10px] text-neutral-500 mb-1.5">{description}</p>}
      <div className={`rounded-lg px-3 py-2.5 text-xs ${readonly ? 'bg-neutral-100 text-neutral-700' : 'bg-white border border-neutral-300 text-neutral-400'}`}>
        {value || (readonly ? '—' : '')}
      </div>
    </div>
  )
}

function FileUploadField({ label, description }: { label: string; description?: string }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-neutral-800 mb-1.5">{label}</p>
      {description && <p className="text-[10px] text-neutral-500 mb-1.5">{description}</p>}
      <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center">
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-[10px] text-neutral-500">Maximum size per file: 2 MB</p>
          <p className="text-[10px] text-neutral-500">Supported file types: .JPG, .JPEG, .PNG, .PDF</p>
          <button className="mt-2 text-[10px] border border-neutral-300 rounded px-3 py-1.5 flex items-center gap-1">
            <Upload className="h-3 w-3" />
            Upload files
          </button>
          <p className="text-[10px] text-neutral-400">or drop them here</p>
        </div>
      </div>
    </div>
  )
}

function SectionBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-neutral-200 rounded-xl mb-4 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-white">
        <h4 className="text-sm font-semibold text-neutral-900">{title}</h4>
        <ChevronUp className="h-4 w-4 text-neutral-500" />
      </div>
      <div className="px-4 pb-4">
        {children}
      </div>
    </div>
  )
}

function QuestionField({ question }: { question: FormQuestion }) {
  if (question.type === 'file_upload') {
    return <FileUploadField label={question.label} description={question.description} />
  }
  if (question.type === 'long_text') {
    return (
      <div className="mb-4">
        <p className="text-xs font-semibold text-neutral-800 mb-1.5">{question.label}</p>
        {question.description && <p className="text-[10px] text-neutral-500 mb-1.5">{question.description}</p>}
        <div className="rounded-lg border border-neutral-300 px-3 py-2.5 text-xs text-neutral-400 min-h-[60px]" />
      </div>
    )
  }
  if (question.type === 'single_select') {
    return (
      <div className="mb-4">
        <p className="text-xs font-semibold text-neutral-800 mb-1.5">{question.label}</p>
        {question.description && <p className="text-[10px] text-neutral-500 mb-1.5">{question.description}</p>}
        <div className="rounded-lg border border-neutral-300 px-3 py-2.5 text-xs text-neutral-400 flex items-center justify-between">
          <span>Select</span>
          <ChevronUp className="h-3 w-3 rotate-180" />
        </div>
      </div>
    )
  }
  return <PreviewField label={question.label} description={question.description} />
}

export function RegistrationFormPreview({ event, sportQuestions, eventQuestions }: Props) {
  const athleteSportQs = sportQuestions.filter((q) => q.appliesTo === 'athlete')
  const athleteEventQs = eventQuestions.filter((q) => q.appliesTo === 'athlete')
  const teamSportQs = sportQuestions.filter((q) => q.appliesTo === 'team')
  const teamEventQs = eventQuestions.filter((q) => q.appliesTo === 'team')

  return (
    <div className="font-[Inter,system-ui,sans-serif] text-[#282828] text-sm">
      {/* Team details (before athlete if team event) */}
      {event.isTeamEvent && (
        <SectionBox title="Team details">
          <PreviewField label="Team name" />
          {teamSportQs.map((q) => (
            <div key={q.id}>
              <QuestionField question={q} />
              <span className="inline-block -mt-3 mb-3 text-[9px] bg-neutral-100 text-neutral-600 rounded px-1.5 py-0.5">Sport-specific question</span>
            </div>
          ))}
          {teamEventQs.map((q) => (
            <QuestionField key={q.id} question={q} />
          ))}
        </SectionBox>
      )}

      {/* Athlete details */}
      <SectionBox title="Athlete details">
        <div className="flex items-start gap-2 bg-neutral-50 border-l-3 border-neutral-300 rounded px-3 py-2 mb-4">
          <Info className="h-3.5 w-3.5 text-neutral-500 mt-0.5 shrink-0" />
          <p className="text-[10px] text-neutral-600">Your details have been pre-filled from Singpass. Only your name and NRIC cannot be edited.</p>
        </div>

        <PreviewField label="Name of athlete" value="Darren Ho Jun Le" readonly />
        <PreviewField label="NRIC or FIN" value="S8082763B" readonly />
        <PreviewField label="Date of birth" value="12 July 1980" readonly />
        <PreviewField label="Gender" value="Male" readonly />
        <PreviewField label="Citizenship / Residency status" value="Singapore citizen" readonly />
        <PreviewField label="Mobile number" value="99327476" />
        <PreviewField label="Email address" value="darren.ho@email.com" />

        {athleteSportQs.map((q) => (
          <div key={q.id}>
            <QuestionField question={q} />
            <span className="inline-block -mt-3 mb-3 text-[9px] bg-neutral-100 text-neutral-600 rounded px-1.5 py-0.5">Sport-specific question</span>
          </div>
        ))}
        {athleteEventQs.map((q) => (
          <QuestionField key={q.id} question={q} />
        ))}
      </SectionBox>

      {/* Approval document */}
      {event.requireApproval && (
        <SectionBox title="Supporting document">
          <FileUploadField label="Upload supporting document" description="Required for admin approval. Upload a clear scan or photo." />
        </SectionBox>
      )}

    </div>
  )
}
