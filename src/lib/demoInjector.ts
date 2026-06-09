import type { Workspace, SportEvent, Registration, Team, DocumentReview } from './types'

const SG_NAMES = [
  { name: 'Tan Wei Ming', gender: 'male' as const, residency: 'sg_citizen' as const },
  { name: 'Lim Shu Ting', gender: 'female' as const, residency: 'sg_citizen' as const },
  { name: 'Wong Kai Xiang', gender: 'male' as const, residency: 'sg_citizen' as const },
  { name: 'Singh Harjeet', gender: 'male' as const, residency: 'sg_pr' as const },
  { name: 'Kumar Priya', gender: 'female' as const, residency: 'sg_pr' as const },
  { name: 'Lee Jia Hui', gender: 'female' as const, residency: 'sg_citizen' as const },
  { name: 'Ng Chee Keong', gender: 'male' as const, residency: 'sg_citizen' as const },
  { name: 'Goh Mei Ling', gender: 'female' as const, residency: 'sg_citizen' as const },
  { name: 'Rahman Ismail', gender: 'male' as const, residency: 'valid_pass_holder' as const },
  { name: 'Lim Ah Kow', gender: 'male' as const, residency: 'sg_citizen' as const },
  { name: 'Tan Xiao Mei', gender: 'female' as const, residency: 'sg_citizen' as const },
  { name: 'Lee Wei Jie', gender: 'male' as const, residency: 'sg_pr' as const },
  { name: 'Wong Su Lin', gender: 'female' as const, residency: 'sg_citizen' as const },
  { name: 'Goh Jun Kai', gender: 'male' as const, residency: 'sg_citizen' as const },
  { name: 'Ng Hui Min', gender: 'female' as const, residency: 'sg_citizen' as const },
  { name: 'Kumar Arun', gender: 'male' as const, residency: 'valid_pass_holder' as const },
  { name: 'Tan Li Hua', gender: 'female' as const, residency: 'sg_citizen' as const },
]

function makeReg(
  idx: number,
  person: typeof SG_NAMES[number],
  sportId: string,
  categoryId: string,
  eventId: string,
  status: Registration['status'],
  fee: number,
  opts?: {
    teamId?: string
    registeredByRelationship?: Registration['registeredBy']['relationship']
    registeredByName?: string
    dob?: string
  }
): Registration {
  const dob = opts?.dob || `${1985 + (idx % 15)}-${String((idx % 12) + 1).padStart(2, '0')}-${String((idx % 28) + 1).padStart(2, '0')}`
  const relationship = opts?.registeredByRelationship || 'self'
  const registeredByName = opts?.registeredByName || person.name

  return {
    id: `reg-demo-${idx}`,
    participantName: person.name,
    participantNric: `S${8000 + idx}${String.fromCharCode(65 + (idx % 26))}`,
    participantDob: dob,
    participantGender: person.gender,
    participantResidency: person.residency,
    participantPassType: person.residency === 'valid_pass_holder' ? 'employment_pass' : undefined,
    participantMobile: `9${String(1000000 + idx * 7).slice(0, 7)}`,
    participantEmail: `${person.name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
    registeredBy: {
      name: registeredByName,
      relationship,
      nric: `S${9000 + idx}${String.fromCharCode(65 + (idx % 26))}`,
      mobile: `8${String(2000000 + idx * 3).slice(0, 7)}`,
      email: `${registeredByName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
    },
    emergencyContact: {
      name: `${person.name.split(' ')[0]} Parent`,
      relationship: 'Parent',
      phone: `6${String(3000000 + idx * 11).slice(0, 7)}`,
    },
    sportId,
    categoryId,
    eventId,
    teamId: opts?.teamId,
    status,
    feePaid: fee,
    registeredAt: `2027-04-${String((idx % 28) + 1).padStart(2, '0')}T${String(8 + (idx % 10)).padStart(2, '0')}:${String((idx * 7) % 60).padStart(2, '0')}:00.000Z`,
    documentIds: [],
  }
}

export function injectDemoData(
  workspace: Workspace,
  sportId: string,
  firstEventId: string
): Workspace {
  const sport = workspace.sports.find((s) => s.id === sportId)
  if (!sport) return workspace

  // 1. Create 3 sibling demo events
  const youthEvent: SportEvent = {
    id: 'event-demo-youth',
    sportId,
    name: 'Youth U13 Singles',
    categoryId: 'cat-youth',
    gender: 'mixed',
    ageRange: { minAge: 12, maxAge: 13 },
    fee: 10,
    isTeamEvent: false,
    isParentChildEvent: false,
    requireApproval: false,
    customQuestions: [],
    publicationStatus: 'registration_open',
    _demoSeeded: true,
  }

  const paraEvent: SportEvent = {
    id: 'event-demo-para',
    sportId,
    name: 'Para Open Singles',
    categoryId: 'cat-para',
    gender: 'mixed',
    fee: 5,
    isTeamEvent: false,
    isParentChildEvent: false,
    requireApproval: true,
    customQuestions: [],
    publicationStatus: 'registration_open',
    _demoSeeded: true,
  }

  const corpEvent: SportEvent = {
    id: 'event-demo-corp',
    sportId,
    name: 'Corporate Team Event',
    categoryId: 'cat-corporate',
    gender: 'mixed',
    ageRange: { minAge: 20 },
    fee: 90,
    isTeamEvent: true,
    minTeamMembers: 6,
    maxTeamMembers: 9,
    teamEligibility: {
      genderMix: 'mixed_any',
      corporateStaffRatio: 0.7,
      minSgPrAmongStaff: 0.5,
      maxNonStaffPlayers: 1,
      foreignerQuota: 'general_rnr_default',
    },
    isParentChildEvent: false,
    requireApproval: true,
    customQuestions: [],
    publicationStatus: 'registration_open',
    _demoSeeded: true,
  }

  // 2. Create ~15 registrations spread across events
  const registrations: Registration[] = []

  // User's event — 4 confirmed
  const userEventCat = sport.events.find((e) => e.id === firstEventId)?.categoryId || 'cat-open'
  const userEventFee = sport.events.find((e) => e.id === firstEventId)?.fee || 25
  registrations.push(makeReg(1, SG_NAMES[0], sportId, userEventCat, firstEventId, 'confirmed', userEventFee))
  registrations.push(makeReg(2, SG_NAMES[1], sportId, userEventCat, firstEventId, 'confirmed', userEventFee))
  registrations.push(makeReg(3, SG_NAMES[2], sportId, userEventCat, firstEventId, 'pending_indemnity', userEventFee))
  registrations.push(makeReg(4, SG_NAMES[3], sportId, userEventCat, firstEventId, 'confirmed', userEventFee))

  // Youth U13 — 2 pending_indemnity (minors registered by parent) + 1 confirmed
  registrations.push(makeReg(5, SG_NAMES[4], sportId, 'cat-youth', youthEvent.id, 'confirmed', 10, { dob: '2014-03-15' }))
  registrations.push(makeReg(6, { name: 'Tan Xiao Jun', gender: 'male', residency: 'sg_citizen' }, sportId, 'cat-youth', youthEvent.id, 'pending_indemnity', 10, {
    dob: '2014-08-22',
    registeredByRelationship: 'parent',
    registeredByName: 'Tan Wei Ming',
  }))
  registrations.push(makeReg(7, { name: 'Lee Jia Ying', gender: 'female', residency: 'sg_citizen' }, sportId, 'cat-youth', youthEvent.id, 'pending_indemnity', 10, {
    dob: '2015-01-10',
    registeredByRelationship: 'parent',
    registeredByName: 'Lee Jia Hui',
  }))

  // Para Open — 3 confirmed
  registrations.push(makeReg(8, SG_NAMES[5], sportId, 'cat-para', paraEvent.id, 'confirmed', 5))
  registrations.push(makeReg(9, SG_NAMES[6], sportId, 'cat-para', paraEvent.id, 'confirmed', 5))
  registrations.push(makeReg(10, SG_NAMES[7], sportId, 'cat-para', paraEvent.id, 'confirmed', 5))

  // Corporate Team Event — 4 members (team forming)
  const teamId = 'team-demo-sunrise'
  registrations.push(makeReg(11, SG_NAMES[8], sportId, 'cat-corporate', corpEvent.id, 'confirmed', 15, { teamId, registeredByRelationship: 'self' }))
  registrations.push(makeReg(12, SG_NAMES[9], sportId, 'cat-corporate', corpEvent.id, 'pending_indemnity', 15, { teamId, registeredByRelationship: 'team_manager', registeredByName: SG_NAMES[8].name }))
  registrations.push(makeReg(13, SG_NAMES[10], sportId, 'cat-corporate', corpEvent.id, 'pending_indemnity', 15, { teamId, registeredByRelationship: 'team_manager', registeredByName: SG_NAMES[8].name }))
  registrations.push(makeReg(14, SG_NAMES[11], sportId, 'cat-corporate', corpEvent.id, 'confirmed', 15, { teamId, registeredByRelationship: 'team_manager', registeredByName: SG_NAMES[8].name }))

  // 1 refunded in user's event
  registrations.push(makeReg(15, SG_NAMES[12], sportId, userEventCat, firstEventId, 'refunded', userEventFee))

  // Second team — "Dragon Boat Warriors" with 7 members (complete)
  const team2Id = 'team-demo-dragon'
  registrations.push(makeReg(16, SG_NAMES[13], sportId, 'cat-corporate', corpEvent.id, 'confirmed', 15, { teamId: team2Id, registeredByRelationship: 'self' }))
  registrations.push(makeReg(17, SG_NAMES[14], sportId, 'cat-corporate', corpEvent.id, 'confirmed', 15, { teamId: team2Id, registeredByRelationship: 'team_manager', registeredByName: SG_NAMES[13].name }))
  registrations.push(makeReg(18, SG_NAMES[15], sportId, 'cat-corporate', corpEvent.id, 'confirmed', 15, { teamId: team2Id, registeredByRelationship: 'team_manager', registeredByName: SG_NAMES[13].name }))
  registrations.push(makeReg(19, SG_NAMES[16], sportId, 'cat-corporate', corpEvent.id, 'confirmed', 15, { teamId: team2Id, registeredByRelationship: 'team_manager', registeredByName: SG_NAMES[13].name }))
  registrations.push(makeReg(20, SG_NAMES[0], sportId, 'cat-corporate', corpEvent.id, 'pending_indemnity', 15, { teamId: team2Id, registeredByRelationship: 'team_manager', registeredByName: SG_NAMES[13].name }))
  registrations.push(makeReg(21, SG_NAMES[1], sportId, 'cat-corporate', corpEvent.id, 'pending_indemnity', 15, { teamId: team2Id, registeredByRelationship: 'team_manager', registeredByName: SG_NAMES[13].name }))
  registrations.push(makeReg(22, SG_NAMES[2], sportId, 'cat-corporate', corpEvent.id, 'confirmed', 15, { teamId: team2Id, registeredByRelationship: 'team_manager', registeredByName: SG_NAMES[13].name }))

  // 3. Create teams
  const team: Team = {
    id: teamId,
    name: 'Team Sunrise Sports Co',
    sportId,
    categoryId: 'cat-corporate',
    eventId: corpEvent.id,
    managerRegistrationId: 'reg-demo-11',
    memberRegistrationIds: ['reg-demo-11', 'reg-demo-12', 'reg-demo-13', 'reg-demo-14'],
    minMembers: 6,
    maxMembers: 9,
    status: 'forming',
    createdAt: '2027-04-05T10:00:00.000Z',
  }

  const team2: Team = {
    id: team2Id,
    name: 'Dragon Boat Warriors',
    sportId,
    categoryId: 'cat-corporate',
    eventId: corpEvent.id,
    managerRegistrationId: 'reg-demo-16',
    memberRegistrationIds: ['reg-demo-16', 'reg-demo-17', 'reg-demo-18', 'reg-demo-19', 'reg-demo-20', 'reg-demo-21', 'reg-demo-22'],
    minMembers: 6,
    maxMembers: 9,
    status: 'complete',
    createdAt: '2027-04-03T08:30:00.000Z',
  }

  // 4. Document review items
  const documentReviews: DocumentReview[] = [
    {
      id: 'docrev-demo-1',
      registrationId: 'reg-demo-8',
      participantName: SG_NAMES[5].name,
      sportId,
      eventName: paraEvent.name,
      documentType: 'para_classification',
      fileName: 'para_classification_lee_jia_hui.pdf',
      uploadedAt: '2027-04-08T09:30:00.000Z',
      status: 'pending',
      notes: [],
    },
    {
      id: 'docrev-demo-2',
      registrationId: 'reg-demo-9',
      participantName: SG_NAMES[6].name,
      sportId,
      eventName: paraEvent.name,
      documentType: 'para_classification',
      fileName: 'para_classification_ng_chee_keong.pdf',
      uploadedAt: '2027-04-09T14:15:00.000Z',
      status: 'pending',
      notes: [],
    },
    {
      id: 'docrev-demo-3',
      registrationId: 'reg-demo-11',
      participantName: SG_NAMES[8].name,
      sportId,
      eventName: corpEvent.name,
      documentType: 'corporate_hr_letter',
      fileName: 'hr_letter_rahman_ismail.pdf',
      uploadedAt: '2027-04-06T11:00:00.000Z',
      status: 'pending',
      notes: [],
    },
    {
      id: 'docrev-demo-4',
      registrationId: 'reg-demo-12',
      participantName: SG_NAMES[9].name,
      sportId,
      eventName: corpEvent.name,
      documentType: 'corporate_hr_letter',
      fileName: 'hr_letter_lim_ah_kow.pdf',
      uploadedAt: '2027-04-07T16:45:00.000Z',
      status: 'pending',
      notes: [],
    },
  ]

  // Apply to workspace
  const updatedSports = workspace.sports.map((s) => {
    if (s.id === sportId) {
      return {
        ...s,
        events: [...s.events, youthEvent, paraEvent, corpEvent],
      }
    }
    return s
  })

  return {
    ...workspace,
    sports: updatedSports,
    registrations: [...workspace.registrations, ...registrations],
    teams: [...workspace.teams, team, team2],
    documentReviews: [...workspace.documentReviews, ...documentReviews],
  }
}
