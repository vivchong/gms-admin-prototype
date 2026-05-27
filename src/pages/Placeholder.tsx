import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'

type PlaceholderPageProps = {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div>
      <PageHeader title={title} />
      <Card className="border-neutral-200">
        <CardContent className="p-8">
          <div className="text-center max-w-md mx-auto">
            <p className="text-sm text-neutral-500 leading-relaxed">
              {description}
            </p>
            <p className="text-xs text-neutral-400 mt-4">
              Coming after UT
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function RefundsPayments() {
  return (
    <PlaceholderPage
      title="Refunds & Payments"
      description="This area will include payment tracking, refund processing with reason codes, and daily payout reconciliation across all sports."
    />
  )
}

export function Indemnity() {
  return (
    <PlaceholderPage
      title="Indemnity"
      description="This area will include versioned indemnity templates, a template editor, and workspace-default assignment for all events."
    />
  )
}

export function Comms() {
  return (
    <PlaceholderPage
      title="Comms"
      description="This area will include transactional email and SMS templates, a broadcast composer with audience filtering, and send history with delivery metrics."
    />
  )
}

export function RolesAccess() {
  return (
    <PlaceholderPage
      title="Roles & Access"
      description="This area will include role management (Workspace Admin, Sport Admin, Reviewer, Finance Officer, Observer) with workspace-scoped permissions and invite flows."
    />
  )
}

export function AuditLog() {
  return (
    <PlaceholderPage
      title="Audit log"
      description="This area will include an append-only log of every admin action — rule changes, refunds, approvals, role changes — filterable by user, scope, and time range."
    />
  )
}
