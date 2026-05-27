import { useState } from 'react'
import { format, differenceInDays } from 'date-fns'
import { ChevronDown, ExternalLink, FileText, X } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useStore } from '@/lib/store'
import type { DocumentReview as DocReviewType, Registration, Team, ReviewNote } from '@/lib/types'

const statusStyles: Record<string, string> = {
  pending: 'bg-blue-50 text-blue-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
  reupload_requested: 'bg-amber-50 text-amber-700',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
  reupload_requested: 'Reupload requested',
}

const docTypeLabels: Record<string, string> = {
  para_classification: 'Para classification',
  corporate_hr_letter: 'Corporate HR letter',
  id_document: 'ID document',
  other: 'Other',
}

const residencyLabels: Record<string, string> = {
  sg_citizen: 'SG Citizen',
  sg_pr: 'SG PR',
  valid_pass_holder: 'Valid pass holder',
}

const relationshipLabels: Record<string, string> = {
  self: 'Self',
  parent: 'Parent',
  guardian: 'Guardian',
  team_manager: 'Team manager',
}

const NOW = new Date('2027-04-15T12:00:00.000Z')

export function DocumentReview() {
  const workspace = useStore((s) => s.workspace)
  const updateDocumentReview = useStore((s) => s.updateDocumentReview)
  const { documentReviews, sports, registrations, teams } = workspace

  const [sportFilter, setSportFilter] = useState<string | null>(null)
  const [docTypeFilter, setDocTypeFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>('pending')
  const [selected, setSelected] = useState<DocReviewType | null>(null)
  const [actionModal, setActionModal] = useState<{ type: 'reject' | 'reupload'; review: DocReviewType } | null>(null)
  const [actionNote, setActionNote] = useState('')

  function getSportName(sportId: string) {
    return sports.find((s) => s.id === sportId)?.name || '—'
  }

  function getDaysWaiting(uploadedAt: string) {
    return differenceInDays(NOW, new Date(uploadedAt))
  }

  // Apply filters
  const filtered = documentReviews.filter((dr) => {
    if (sportFilter && dr.sportId !== sportFilter) return false
    if (docTypeFilter && dr.documentType !== docTypeFilter) return false
    if (statusFilter && dr.status !== statusFilter) return false
    return true
  }).sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime())

  function handleApprove(review: DocReviewType) {
    const note: ReviewNote = {
      action: 'approved',
      reviewedAt: NOW.toISOString(),
      reviewer: 'Adam Tan',
    }
    updateDocumentReview(review.id, {
      status: 'approved',
      notes: [...review.notes, note],
    })
    setSelected(null)
    toast('Document approved')
  }

  function handleActionSubmit() {
    if (!actionModal) return
    const { type, review } = actionModal
    const note: ReviewNote = {
      action: type === 'reject' ? 'rejected' : 'reupload_requested',
      note: actionNote.trim() || undefined,
      reviewedAt: NOW.toISOString(),
      reviewer: 'Adam Tan',
    }
    updateDocumentReview(review.id, {
      status: type === 'reject' ? 'rejected' : 'reupload_requested',
      notes: [...review.notes, note],
    })
    setActionModal(null)
    setActionNote('')
    setSelected(null)
    toast(type === 'reject' ? 'Document rejected' : 'Reupload requested')
  }

  const hasFilters = sportFilter || docTypeFilter || statusFilter

  const sportFilterLabel = sportFilter ? getSportName(sportFilter) : 'All sports'
  const docTypeFilterLabel = docTypeFilter ? docTypeLabels[docTypeFilter] : 'All types'
  const statusFilterLabel = statusFilter ? statusLabels[statusFilter] : 'All statuses'

  return (
    <div>
      <PageHeader
        title="Document Review"
        subtitle="Review uploaded documents for registrations requiring approval"
      />

      {documentReviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-neutral-500">No documents to review. Documents will appear here when participants upload files for events that require approval.</p>
        </div>
      ) : (
        <>
          {/* Filter pills */}
          <div className="flex items-center gap-2 mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  {sportFilter && <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />}
                  <span className="text-xs">{sportFilterLabel}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setSportFilter(null)} className="text-xs">All sports</DropdownMenuItem>
                {sports.filter((s) => s.events.length > 0).map((sport) => (
                  <DropdownMenuItem key={sport.id} onClick={() => setSportFilter(sport.id)} className="text-xs">{sport.name}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  {docTypeFilter && <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />}
                  <span className="text-xs">{docTypeFilterLabel}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setDocTypeFilter(null)} className="text-xs">All types</DropdownMenuItem>
                {Object.entries(docTypeLabels).map(([value, label]) => (
                  <DropdownMenuItem key={value} onClick={() => setDocTypeFilter(value)} className="text-xs">{label}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  {statusFilter && <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />}
                  <span className="text-xs">{statusFilterLabel}</span>
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

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-neutral-500"
                onClick={() => { setSportFilter(null); setDocTypeFilter(null); setStatusFilter(null) }}
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
                  <TableHead className="text-xs">Participant</TableHead>
                  <TableHead className="text-xs">Sport</TableHead>
                  <TableHead className="text-xs">Event</TableHead>
                  <TableHead className="text-xs">Document type</TableHead>
                  <TableHead className="text-xs">Uploaded</TableHead>
                  <TableHead className="text-xs">Days waiting</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-neutral-500 py-8">
                      No documents match the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((dr) => (
                    <TableRow
                      key={dr.id}
                      className="cursor-pointer hover:bg-neutral-50"
                      onClick={() => setSelected(dr)}
                    >
                      <TableCell className="text-sm font-medium">{dr.participantName}</TableCell>
                      <TableCell className="text-sm text-neutral-700">{getSportName(dr.sportId)}</TableCell>
                      <TableCell className="text-sm text-neutral-700">{dr.eventName}</TableCell>
                      <TableCell className="text-sm text-neutral-700">{docTypeLabels[dr.documentType]}</TableCell>
                      <TableCell className="text-sm text-neutral-500">{format(new Date(dr.uploadedAt), 'd MMM yyyy')}</TableCell>
                      <TableCell className="text-sm text-neutral-500">{getDaysWaiting(dr.uploadedAt)}d</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusStyles[dr.status] || ''}>
                          {statusLabels[dr.status] || dr.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <p className="text-xs text-neutral-500 mt-3">{filtered.length} document{filtered.length !== 1 ? 's' : ''}</p>
        </>
      )}

      {/* Detail side panel */}
      <Sheet open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <SheetContent side="right" className="w-[480px] sm:max-w-[480px] overflow-hidden p-0">
          {selected && (
            <DetailPanel
              review={selected}
              registrations={registrations}
              teams={teams}
              getSportName={getSportName}
              onApprove={() => handleApprove(selected)}
              onReject={() => setActionModal({ type: 'reject', review: selected })}
              onReupload={() => setActionModal({ type: 'reupload', review: selected })}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Action modal (reject / reupload) */}
      <Dialog open={!!actionModal} onOpenChange={(open) => { if (!open) { setActionModal(null); setActionNote('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionModal?.type === 'reject' ? 'Reject document' : 'Request reupload'}
            </DialogTitle>
            <DialogDescription>
              {actionModal?.type === 'reject'
                ? `Provide a reason for rejecting ${actionModal.review.participantName}'s document. The participant will be notified.`
                : `Provide a note explaining what's needed from ${actionModal?.review.participantName}. The participant will be asked to reupload.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>{actionModal?.type === 'reject' ? 'Reason for rejection' : 'Note to participant'}</Label>
            <Textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder={actionModal?.type === 'reject'
                ? 'e.g. Document is illegible, classification expired'
                : 'e.g. Please upload a clearer copy, document must show full name'
              }
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionModal(null); setActionNote('') }}>Cancel</Button>
            <Button
              variant={actionModal?.type === 'reject' ? 'destructive' : 'default'}
              onClick={handleActionSubmit}
              disabled={!actionNote.trim()}
            >
              {actionModal?.type === 'reject' ? 'Reject' : 'Request reupload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DetailPanel({
  review,
  registrations,
  teams,
  getSportName,
  onApprove,
  onReject,
  onReupload,
}: {
  review: DocReviewType
  registrations: Registration[]
  teams: Team[]
  getSportName: (id: string) => string
  onApprove: () => void
  onReject: () => void
  onReupload: () => void
}) {
  const reg = registrations.find((r) => r.id === review.registrationId)
  const team = reg?.teamId ? teams.find((t) => t.id === reg.teamId) : null

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-6 pb-6">
          <SheetHeader className="p-0 mb-6">
            <SheetTitle className="text-lg">Document Review</SheetTitle>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant="secondary" className={statusStyles[review.status] || ''}>
                {statusLabels[review.status] || review.status}
              </Badge>
            </div>
          </SheetHeader>

          {/* Document header */}
          <DetailSection title="Document">
            <DetailField label="Type" value={docTypeLabels[review.documentType]} />
            <DetailField label="File name" value={review.fileName} />
            <DetailField label="Uploaded" value={format(new Date(review.uploadedAt), 'd MMM yyyy, h:mm a')} />
            <div className="pt-2">
              <button
                onClick={() => toast('File preview not available in prototype')}
                className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 w-full text-left hover:border-neutral-300 transition-colors"
              >
                <FileText className="h-5 w-5 text-neutral-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-neutral-700 truncate">{review.fileName}</p>
                  <p className="text-xs text-neutral-500">PDF document</p>
                </div>
                <ExternalLink className="h-4 w-4 text-neutral-400 shrink-0" />
              </button>
            </div>
          </DetailSection>

          {/* Participant context */}
          {reg && (
            <DetailSection title="Participant">
              <DetailField label="Name" value={reg.participantName} />
              {reg.participantNric && <DetailField label="NRIC" value={reg.participantNric} />}
              <DetailField label="Date of birth" value={format(new Date(reg.participantDob), 'd MMM yyyy')} />
              <DetailField label="Residency" value={residencyLabels[reg.participantResidency]} />
              <DetailField label="Sport" value={getSportName(reg.sportId)} />
              <DetailField label="Event" value={review.eventName} />
              {team && <DetailField label="Team" value={team.name} />}
            </DetailSection>
          )}

          {/* Registerer block */}
          {reg && (
            <DetailSection title="Registered by">
              <DetailField label="Name" value={reg.registeredBy.name} />
              <DetailField label="Relationship" value={relationshipLabels[reg.registeredBy.relationship] || reg.registeredBy.relationship} />
              <DetailField label="NRIC" value={reg.registeredBy.nric} />
              <DetailField label="Mobile" value={reg.registeredBy.mobile} />
            </DetailSection>
          )}

          {/* Prior reviews */}
          <DetailSection title="Review history">
            {review.notes.length === 0 ? (
              <p className="text-xs text-neutral-500">No prior reviews on this document.</p>
            ) : (
              <div className="space-y-3">
                {review.notes.map((note, idx) => (
                  <div key={idx} className="border border-neutral-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="secondary" className={`text-xs ${statusStyles[note.action] || ''}`}>
                        {statusLabels[note.action] || note.action}
                      </Badge>
                      <span className="text-xs text-neutral-500">{format(new Date(note.reviewedAt), 'd MMM yyyy')}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mb-1">by {note.reviewer}</p>
                    {note.note && <p className="text-sm text-neutral-700">{note.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </DetailSection>
        </div>
      </ScrollArea>

      {/* Sticky actions */}
      <div className="shrink-0 bg-white border-t border-neutral-200 px-6 py-4 flex items-center gap-2">
        {review.status === 'pending' || review.status === 'reupload_requested' ? (
          <>
            <Button size="sm" onClick={onApprove}>
              Approve
            </Button>
            <Button variant="outline" size="sm" onClick={onReupload}>
              Request reupload
            </Button>
            <Button variant="destructive" size="sm" onClick={onReject}>
              Reject
            </Button>
          </>
        ) : (
          <p className="text-xs text-neutral-500">This document has been {review.status === 'approved' ? 'approved' : 'rejected'}.</p>
        )}
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
