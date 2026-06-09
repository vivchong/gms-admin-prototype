import type { WorkBook } from 'xlsx'
import * as XLSX from 'xlsx'
import type { Sport, Workspace, Registration, Team } from './types'

export type ParseError = {
  sheet: string
  row: number
  message: string
}

export type ParseResult = {
  registrations: Registration[]
  teams: Team[]
  errors: ParseError[]
  totalRows: number
}

function normalizeGender(val: string): 'male' | 'female' | undefined {
  const lower = val.toLowerCase().trim()
  if (lower === 'male' || lower === 'm') return 'male'
  if (lower === 'female' || lower === 'f') return 'female'
  return undefined
}

function normalizeResidency(val: string): Registration['participantResidency'] | undefined {
  const lower = val.toLowerCase().trim()
  if (lower.includes('citizen') || lower === 'sg citizen') return 'sg_citizen'
  if (lower.includes('pr') || lower === 'sg pr') return 'sg_pr'
  if (lower.includes('pass') || lower === 'valid pass holder') return 'valid_pass_holder'
  return undefined
}

export function parseUpload(workbook: WorkBook, sports: Sport[], workspace: Workspace): ParseResult {
  const registrations: Registration[] = []
  const teams: Team[] = []
  const errors: ParseError[] = []
  let totalRows = 0

  const teamMap = new Map<string, Team>()

  for (const sheetName of workbook.SheetNames) {
    const sport = sports.find((s) => s.name.slice(0, 31) === sheetName)
    if (!sport) {
      errors.push({ sheet: sheetName, row: 0, message: `Sheet "${sheetName}" does not match any selected sport` })
      continue
    }

    const ws = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2
      totalRows++

      const participantName = (row['Participant Name'] || '').trim()
      const eventName = (row['Event Name'] || '').trim()
      const nric = (row['NRIC/FIN'] || '').trim()
      const dob = (row['Date of Birth (YYYY-MM-DD)'] || '').trim()
      const genderRaw = (row['Gender (Male/Female)'] || '').trim()
      const residencyRaw = (row['Residency (SG Citizen/SG PR/Valid Pass Holder)'] || '').trim()
      const mobile = (row['Mobile'] || '').trim()
      const email = (row['Email'] || '').trim()
      const teamName = (row['Team Name'] || '').trim()

      if (!participantName) {
        errors.push({ sheet: sheetName, row: rowNum, message: 'Missing participant name' })
        continue
      }
      if (!eventName) {
        errors.push({ sheet: sheetName, row: rowNum, message: 'Missing event name' })
        continue
      }
      if (!dob) {
        errors.push({ sheet: sheetName, row: rowNum, message: 'Missing date of birth' })
        continue
      }
      if (!residencyRaw) {
        errors.push({ sheet: sheetName, row: rowNum, message: 'Missing residency status' })
        continue
      }

      const event = sport.events.find((e) => e.name.toLowerCase() === eventName.toLowerCase())
      if (!event) {
        errors.push({ sheet: sheetName, row: rowNum, message: `Event "${eventName}" not found in ${sport.name}` })
        continue
      }

      const gender = genderRaw ? normalizeGender(genderRaw) : undefined
      if (genderRaw && !gender) {
        errors.push({ sheet: sheetName, row: rowNum, message: `Invalid gender "${genderRaw}". Use Male or Female` })
        continue
      }

      const residency = normalizeResidency(residencyRaw)
      if (!residency) {
        errors.push({ sheet: sheetName, row: rowNum, message: `Invalid residency "${residencyRaw}". Use SG Citizen, SG PR, or Valid Pass Holder` })
        continue
      }

      const regId = `reg-bulk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      let teamId: string | undefined
      if (teamName && event.isTeamEvent) {
        const teamKey = `${sport.id}:${event.id}:${teamName}`
        if (!teamMap.has(teamKey)) {
          const newTeam: Team = {
            id: `team-bulk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: teamName,
            sportId: sport.id,
            categoryId: event.categoryId,
            eventId: event.id,
            managerRegistrationId: regId,
            memberRegistrationIds: [regId],
            minMembers: event.minTeamMembers || 2,
            maxMembers: event.maxTeamMembers || 20,
            status: 'forming',
            createdAt: new Date().toISOString(),
          }
          teamMap.set(teamKey, newTeam)
        } else {
          const existingTeam = teamMap.get(teamKey)!
          existingTeam.memberRegistrationIds.push(regId)
        }
        teamId = teamMap.get(teamKey)!.id
      }

      const fee = event.fee || 0
      const catFees = workspace.feeStructure.perCategory[event.categoryId]
      const computedFee = fee || (catFees
        ? (event.isTeamEvent ? catFees.teamFeePerPlayer : catFees.individualFee)
        : 0)

      const registration: Registration = {
        id: regId,
        participantName,
        participantNric: nric || undefined,
        participantDob: dob,
        participantGender: gender,
        participantResidency: residency,
        participantPassType: undefined,
        participantMobile: mobile || undefined,
        participantEmail: email || undefined,
        registeredBy: {
          name: 'Admin (Bulk Upload)',
          relationship: 'self',
          nric: '',
          mobile: '',
          email: '',
        },
        emergencyContact: {
          name: 'Not provided',
          relationship: 'Not provided',
          phone: '',
        },
        sportId: sport.id,
        categoryId: event.categoryId,
        eventId: event.id,
        teamId,
        status: 'confirmed',
        feePaid: computedFee,
        registeredAt: new Date().toISOString(),
        documentIds: [],
      }

      registrations.push(registration)
    }
  }

  teams.push(...teamMap.values())

  return { registrations, teams, errors, totalRows }
}
