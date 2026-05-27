import { useState } from 'react'
import { ChevronDown, ChevronUp, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useStore } from '@/lib/store'
import type { WorkspaceRule } from '@/lib/types'

function formatParameters(rule: WorkspaceRule): string | null {
  if (!rule.parameters) return null

  if (rule.kind === 'residency_allowed') {
    const allowed = rule.parameters.allowed as string[]
    const labels: Record<string, string> = {
      sg_citizen: 'SG Citizen',
      sg_pr: 'SG PR',
      valid_pass_holder: 'Valid pass holder',
    }
    return `Allowed: ${allowed.map((a) => labels[a] || a).join(', ')}`
  }

  if (rule.kind === 'valid_pass_types') {
    const types = rule.parameters.types as string[]
    const labels: Record<string, string> = {
      student_pass: 'Student Pass',
      ltp: 'Long-Term Pass',
      dependents_pass: "Dependant's Pass",
      work_permit: 'Work Permit',
      s_pass: 'S Pass',
      employment_pass: 'Employment Pass',
    }
    return types.map((t) => labels[t] || t).join(', ')
  }

  if (rule.kind === 'requires_indemnity_acknowledgement') {
    return `Template: ${rule.parameters.templateRef as string}`
  }

  if (rule.kind === 'requires_parental_consent_if_minor') {
    return `Minor if born after ${rule.parameters.minorIfBornAfter as number}`
  }

  if (rule.kind === 'requires_id_document') {
    const accepted = rule.parameters.accepted as string[]
    const labels: Record<string, string> = {
      nric: 'NRIC',
      passport: 'Passport',
      birth_cert: 'Birth certificate',
      driver_licence: "Driver's licence",
      student_pass: 'Student Pass',
    }
    return `Accepted: ${accepted.map((a) => labels[a] || a).join(', ')}`
  }

  return null
}

function WorkspaceRulesSection() {
  const workspace = useStore((s) => s.workspace)
  const toggleWorkspaceRule = useStore((s) => s.toggleWorkspaceRule)

  function handleToggle(rule: WorkspaceRule) {
    toggleWorkspaceRule(rule.id)
    if (rule.enabled) {
      toast(`${rule.label} disabled — re-enable from this page`)
    } else {
      toast(`${rule.label} enabled`)
    }
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-neutral-900 mb-1">Workspace rules</h2>
      <p className="text-sm text-neutral-500 mb-4">
        Universal defaults from the General R&R. These apply to every registration regardless of sport.
      </p>
      <div className="space-y-3">
        {workspace.workspaceRules.map((rule) => (
          <Card key={rule.id} className={`py-4 ${!rule.enabled ? 'opacity-60' : ''}`}>
            <CardContent className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900">{rule.label}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{rule.description}</p>
                {rule.enabled && formatParameters(rule) && (
                  <p className="text-xs text-neutral-700 mt-2 bg-neutral-50 rounded px-2 py-1 inline-block">
                    {formatParameters(rule)}
                  </p>
                )}
              </div>
              <Switch
                checked={rule.enabled}
                onCheckedChange={() => handleToggle(rule)}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

function ForeignerQuotaSection() {
  const [expanded, setExpanded] = useState(false)
  const workspace = useStore((s) => s.workspace)

  return (
    <section>
      <Card>
        <CardContent>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Foreigner quota table</h2>
              <p className="text-sm text-neutral-500 mt-0.5">
                General R&R lookup — team sizes 2 through 30. Read-only.
              </p>
            </div>
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-neutral-500 shrink-0" />
            ) : (
              <ChevronDown className="h-5 w-5 text-neutral-500 shrink-0" />
            )}
          </button>
          {expanded && (
            <div className="mt-4 border-t border-neutral-200 pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Total participants</TableHead>
                    <TableHead>Min SG / PR</TableHead>
                    <TableHead>Max foreigners</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workspace.foreignerQuotaTable.map((row) => (
                    <TableRow key={row.totalParticipants}>
                      <TableCell>{row.totalParticipants}</TableCell>
                      <TableCell>{row.minSgOrPr}</TableCell>
                      <TableCell>{row.maxForeigners}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

function CategoryLabelsSection() {
  const workspace = useStore((s) => s.workspace)

  return (
    <section>
      <h2 className="text-lg font-semibold text-neutral-900 mb-1">Category labels</h2>
      <p className="text-sm text-neutral-500 mb-4">
        Defined by the General R&R — not editable in this workspace.
      </p>
      <Card>
        <CardContent>
          <div className="divide-y divide-neutral-200">
            {workspace.categories.map((cat) => (
              <div key={cat.id} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-medium text-neutral-900">{cat.name}</p>
                {cat.description && (
                  <p className="text-xs text-neutral-500 mt-0.5">{cat.description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

function FeeStructureSection() {
  const workspace = useStore((s) => s.workspace)
  const categoryMap = Object.fromEntries(workspace.categories.map((c) => [c.id, c.name]))

  return (
    <section>
      <h2 className="text-lg font-semibold text-neutral-900 mb-1">Fee structure</h2>
      <p className="text-sm text-neutral-500 mb-4">
        Set at workspace level — events derive their fee from this table.
      </p>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Individual fee</TableHead>
                <TableHead>Team fee per player</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(workspace.feeStructure.perCategory).map(([catId, fees]) => (
                <TableRow key={catId}>
                  <TableCell className="font-medium">{categoryMap[catId] || catId}</TableCell>
                  <TableCell>S${fees.individualFee.toFixed(2)}</TableCell>
                  <TableCell>S${fees.teamFeePerPlayer.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  )
}

function ResetSection() {
  const resetPrototype = useStore((s) => s.resetPrototype)

  function handleReset() {
    resetPrototype()
    location.reload()
  }

  return (
    <section>
      <Card className="border-red-200 bg-red-50 py-5">
        <CardContent>
          <div className="flex items-start gap-3">
            <TriangleAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-red-900">Reset prototype</h2>
              <p className="text-xs text-red-700 mt-1">
                Erase all sports, events, registrations, and settings changes. Resets the workspace to its initial empty state.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="mt-3 border-red-300 text-red-700 hover:bg-red-100">
                    Reset all data
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reset prototype</DialogTitle>
                    <DialogDescription>
                      This will erase all your changes and reset Pesta Sukan 2027 to a fresh state. Continue?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={handleReset}>
                      Reset
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

export function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Workspace-level configuration for Pesta Sukan 2027"
      />
      <div className="space-y-8">
        <WorkspaceRulesSection />
        <ForeignerQuotaSection />
        <CategoryLabelsSection />
        <FeeStructureSection />
        <ResetSection />
      </div>
    </div>
  )
}
