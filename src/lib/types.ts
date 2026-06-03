export type Workspace = {
  id: string
  gamesName: string
  year: number
  dateRange: { start: string; end: string }
  registrationWindow: { start: string; end: string }
  workspaceRules: WorkspaceRule[]
  foreignerQuotaTable: ForeignerQuotaRow[]
  categories: CategoryLabel[]
  feeStructure: FeeStructure
  sports: Sport[]
  teams: Team[]
  registrations: Registration[]
  documentReviews: DocumentReview[]
  _demoInjected?: boolean
}

export type WorkspaceRule = {
  id: string
  kind:
    | 'requires_singpass'
    | 'residency_allowed'
    | 'valid_pass_types'
    | 'requires_indemnity_acknowledgement'
    | 'requires_emergency_contact'
    | 'requires_parental_consent_if_minor'
    | 'requires_id_document'
  label: string
  description: string
  parameters?: Record<string, unknown>
  enabled: boolean
}

export type ForeignerQuotaRow = {
  totalParticipants: number
  minSgOrPr: number
  maxForeigners: number
}

export type CategoryLabel = {
  id: string
  name: string
  description?: string
}

export type FeeStructure = {
  perCategory: Record<string, {
    individualFee: number
    teamFeePerPlayer: number
  }>
}

export type Sport = {
  id: string
  name: string
  pricingType: 'per_event' | 'bundle'
  description?: string
  venue?: string
  competitionDates: { start: string; end: string }
  registrationOpenAt?: string
  registrationCloseAt?: string
  lastChangeDate?: string
  rulesRegulationPdfUrl?: string
  formats?: string[]
  maxEventsPerParticipant?: number
  exemptCategoryIds: string[]
  customQuestions: FormQuestion[]
  events: SportEvent[]
  publicationStatus: 'draft' | 'published'
}

export type SportEvent = {
  id: string
  sportId: string
  name: string
  description?: string
  categoryId: string
  gender?: 'male' | 'female' | 'mixed'
  ageRange?: {
    minAge?: number
    maxAge?: number
  }
  fee?: number
  capacity?: number
  competitionDates?: { start: string; end: string }
  isTeamEvent: boolean
  minTeamMembers?: number
  maxTeamMembers?: number
  teamEligibility?: {
    genderMix?:
      | 'all_male'
      | 'all_female'
      | 'mixed_any'
      | 'mixed_min_one_female'
      | 'mixed_min_one_male'
    combinedAge?: { min?: number; max?: number }
    foreignerQuota?: 'general_rnr_default' | 'custom'
    foreignerQuotaCustom?: { minSgPrRatio?: number; maxForeigners?: number }
    corporateStaffRatio?: number
    minSgPrAmongStaff?: number
    maxNonStaffPlayers?: number
  }
  isParentChildEvent: boolean
  childAgeRange?: { minAge?: number; maxAge?: number }
  requireApproval: boolean
  customQuestions: FormQuestion[]
  publicationStatus: 'draft' | 'published'
  _demoSeeded?: boolean
}

export type FormQuestion = {
  id: string
  appliesTo: 'athlete' | 'team'
  label: string
  description?: string
  type: 'short_text' | 'long_text' | 'single_select' | 'file_upload'
  options?: string[]
  required: boolean
}

export type Registration = {
  id: string
  participantName: string
  participantNric?: string
  participantDob: string
  participantGender?: 'male' | 'female'
  participantResidency: 'sg_citizen' | 'sg_pr' | 'valid_pass_holder'
  participantPassType?: string
  participantMobile?: string
  participantEmail?: string
  registeredBy: {
    name: string
    relationship: 'self' | 'parent' | 'guardian' | 'team_manager'
    nric: string
    mobile: string
    email: string
  }
  emergencyContact: {
    name: string
    relationship: string
    phone: string
    altPhone?: string
  }
  sportId: string
  categoryId: string
  eventId: string
  teamId?: string
  jerseyNumber?: number
  status:
    | 'confirmed'
    | 'pending_indemnity'
    | 'refunded'
    | 'rejected'
    | 'waitlisted'
  feePaid: number
  registeredAt: string
  documentIds: string[]
}

export type Team = {
  id: string
  name: string
  sportId: string
  categoryId: string
  eventId: string
  managerRegistrationId: string
  memberRegistrationIds: string[]
  minMembers: number
  maxMembers: number
  status: 'forming' | 'complete' | 'confirmed'
  createdAt: string
}

export type ReviewNote = {
  action: 'approved' | 'rejected' | 'reupload_requested'
  note?: string
  reviewedAt: string
  reviewer: string
}

export type DocumentReview = {
  id: string
  registrationId: string
  participantName: string
  sportId: string
  eventName: string
  documentType: 'para_classification' | 'corporate_hr_letter' | 'id_document' | 'other'
  fileName: string
  uploadedAt: string
  status: 'pending' | 'approved' | 'rejected' | 'reupload_requested'
  reviewerNote?: string
  notes: ReviewNote[]
}
