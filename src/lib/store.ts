import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Workspace, Sport, SportEvent, DocumentReview, Registration, Team } from './types'
import { injectDemoData } from './demoInjector'

const STORE_VERSION = 8

function createSeedWorkspace(): Workspace {
  return {
    id: 'ws-pesta-sukan-2027',
    gamesName: 'Pesta Sukan',
    year: 2027,
    dateRange: { start: '2027-07-24', end: '2027-08-01' },
    registrationWindow: { start: '2027-04-01', end: '2027-06-15' },
    workspaceRules: [
      {
        id: 'er-singpass',
        kind: 'requires_singpass',
        label: 'Singpass verification required',
        description: 'Every registerer must verify their identity through Singpass before submitting.',
        enabled: true,
      },
      {
        id: 'er-residency',
        kind: 'residency_allowed',
        label: 'Allowed residency statuses',
        description: 'Only Singapore Citizens, PRs, and valid pass holders may register.',
        parameters: { allowed: ['sg_citizen', 'sg_pr', 'valid_pass_holder'] },
        enabled: true,
      },
      {
        id: 'er-pass-types',
        kind: 'valid_pass_types',
        label: 'Accepted pass types for non-residents',
        description: 'These passes qualify a non-resident to register.',
        parameters: { types: ['student_pass', 'ltp', 'dependents_pass', 'work_permit', 's_pass', 'employment_pass'] },
        enabled: true,
      },
      {
        id: 'er-indemnity',
        kind: 'requires_indemnity_acknowledgement',
        label: 'Indemnity acknowledgement required',
        description: 'Participants (or their parent / guardian for minors) must acknowledge the Pesta Sukan 2027 indemnity before registration is confirmed.',
        parameters: { templateRef: 'PS27 Indemnity v1' },
        enabled: true,
      },
      {
        id: 'er-emergency',
        kind: 'requires_emergency_contact',
        label: 'Emergency contact required',
        description: "Every registration must include an emergency contact's name, relationship, and phone.",
        enabled: true,
      },
      {
        id: 'er-parental',
        kind: 'requires_parental_consent_if_minor',
        label: 'Parental consent required for minors',
        description: 'Participants born after a given year require parental acknowledgement of the indemnity.',
        parameters: { minorIfBornAfter: 2009 },
        enabled: true,
      },
      {
        id: 'er-id-doc',
        kind: 'requires_id_document',
        label: 'ID document required at competition day',
        description: 'Participants must bring an accepted ID document to the competition venue.',
        parameters: { accepted: ['nric', 'passport', 'birth_cert', 'driver_licence', 'student_pass'] },
        enabled: true,
      },
    ],
    foreignerQuotaTable: [
      { totalParticipants: 2, minSgOrPr: 1, maxForeigners: 1 },
      { totalParticipants: 3, minSgOrPr: 2, maxForeigners: 1 },
      { totalParticipants: 4, minSgOrPr: 3, maxForeigners: 1 },
      { totalParticipants: 5, minSgOrPr: 4, maxForeigners: 1 },
      { totalParticipants: 6, minSgOrPr: 5, maxForeigners: 1 },
      { totalParticipants: 7, minSgOrPr: 5, maxForeigners: 2 },
      { totalParticipants: 8, minSgOrPr: 6, maxForeigners: 2 },
      { totalParticipants: 9, minSgOrPr: 7, maxForeigners: 2 },
      { totalParticipants: 10, minSgOrPr: 7, maxForeigners: 3 },
      { totalParticipants: 11, minSgOrPr: 8, maxForeigners: 3 },
      { totalParticipants: 12, minSgOrPr: 9, maxForeigners: 3 },
      { totalParticipants: 13, minSgOrPr: 10, maxForeigners: 3 },
      { totalParticipants: 14, minSgOrPr: 10, maxForeigners: 4 },
      { totalParticipants: 15, minSgOrPr: 11, maxForeigners: 4 },
      { totalParticipants: 16, minSgOrPr: 12, maxForeigners: 4 },
      { totalParticipants: 17, minSgOrPr: 12, maxForeigners: 5 },
      { totalParticipants: 18, minSgOrPr: 13, maxForeigners: 5 },
      { totalParticipants: 19, minSgOrPr: 14, maxForeigners: 5 },
      { totalParticipants: 20, minSgOrPr: 14, maxForeigners: 6 },
      { totalParticipants: 21, minSgOrPr: 15, maxForeigners: 6 },
      { totalParticipants: 22, minSgOrPr: 16, maxForeigners: 6 },
      { totalParticipants: 23, minSgOrPr: 17, maxForeigners: 6 },
      { totalParticipants: 24, minSgOrPr: 17, maxForeigners: 7 },
      { totalParticipants: 25, minSgOrPr: 18, maxForeigners: 7 },
      { totalParticipants: 26, minSgOrPr: 19, maxForeigners: 7 },
      { totalParticipants: 27, minSgOrPr: 19, maxForeigners: 8 },
      { totalParticipants: 28, minSgOrPr: 20, maxForeigners: 8 },
      { totalParticipants: 29, minSgOrPr: 21, maxForeigners: 8 },
      { totalParticipants: 30, minSgOrPr: 21, maxForeigners: 9 },
    ],
    categories: [
      { id: 'cat-open', name: 'Open', description: 'No age limit. Default adult competitive category.' },
      { id: 'cat-masters-54', name: 'Masters (54 and below)', description: "Senior players up to age 54. Sport sets the exact age threshold; pricing is the standard Masters rate." },
      { id: 'cat-masters-55', name: 'Masters (55 and above)', description: 'Senior players aged 55 and above. Discounted entry per the General R&R.' },
      { id: 'cat-youth', name: 'Youth', description: 'Under-18 players. Sport sets the exact age bands per event.' },
      { id: 'cat-corporate', name: 'Corporate', description: 'Teams from a single private / public / non-profit organisation.' },
      { id: 'cat-international', name: 'International', description: 'Open to overseas participants alongside locals. No prize money.' },
      { id: 'cat-para', name: 'Para', description: 'Para and inclusive events. Classification required.' },
    ],
    feeStructure: {
      perCategory: {
        'cat-youth': { individualFee: 10, teamFeePerPlayer: 10 },
        'cat-open': { individualFee: 15, teamFeePerPlayer: 15 },
        'cat-masters-54': { individualFee: 15, teamFeePerPlayer: 15 },
        'cat-masters-55': { individualFee: 5, teamFeePerPlayer: 5 },
        'cat-corporate': { individualFee: 15, teamFeePerPlayer: 15 },
        'cat-international': { individualFee: 15, teamFeePerPlayer: 15 },
        'cat-para': { individualFee: 5, teamFeePerPlayer: 5 },
      },
    },
    sports: [],
    teams: [],
    registrations: [],
    documentReviews: [],
  }
}

type StoreState = {
  workspace: Workspace
  toggleWorkspaceRule: (ruleId: string) => void
  addSport: (sport: Sport) => void
  updateSport: (sportId: string, updates: Partial<Sport>) => void
  saveEvent: (sportId: string, event: SportEvent) => void
  updateEvent: (sportId: string, eventId: string, updates: Partial<SportEvent>) => void
  deleteEvent: (sportId: string, eventId: string) => void
  updateDocumentReview: (reviewId: string, updates: Partial<DocumentReview>) => void
  addRegistrations: (registrations: Registration[]) => void
  addTeams: (teams: Team[]) => void
  resetPrototype: () => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      workspace: createSeedWorkspace(),

      toggleWorkspaceRule: (ruleId: string) => {
        set((state) => ({
          workspace: {
            ...state.workspace,
            workspaceRules: state.workspace.workspaceRules.map((rule) =>
              rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
            ),
          },
        }))
      },

      addSport: (sport: Sport) => {
        set((state) => ({
          workspace: {
            ...state.workspace,
            sports: [...state.workspace.sports, sport],
          },
        }))
      },

      updateSport: (sportId: string, updates: Partial<Sport>) => {
        set((state) => ({
          workspace: {
            ...state.workspace,
            sports: state.workspace.sports.map((s) =>
              s.id === sportId ? { ...s, ...updates } : s
            ),
          },
        }))
      },

      saveEvent: (sportId: string, event: SportEvent) => {
        const state = get()
        const isFirstEvent = state.workspace.sports.every(
          (s) => s.events.length === 0
        )

        set((state) => {
          const updatedSports = state.workspace.sports.map((s) =>
            s.id === sportId
              ? { ...s, events: [...s.events, event] }
              : s
          )

          let updatedWorkspace = {
            ...state.workspace,
            sports: updatedSports,
          }

          if (isFirstEvent && !state.workspace._demoInjected) {
            updatedWorkspace = injectDemoData(updatedWorkspace, sportId, event.id)
            updatedWorkspace._demoInjected = true
          }

          return { workspace: updatedWorkspace }
        })
      },

      updateEvent: (sportId: string, eventId: string, updates: Partial<SportEvent>) => {
        set((state) => ({
          workspace: {
            ...state.workspace,
            sports: state.workspace.sports.map((s) =>
              s.id === sportId
                ? {
                    ...s,
                    events: s.events.map((e) =>
                      e.id === eventId ? { ...e, ...updates } : e
                    ),
                  }
                : s
            ),
          },
        }))
      },

      deleteEvent: (sportId: string, eventId: string) => {
        set((state) => ({
          workspace: {
            ...state.workspace,
            sports: state.workspace.sports.map((s) =>
              s.id === sportId
                ? { ...s, events: s.events.filter((e) => e.id !== eventId) }
                : s
            ),
          },
        }))
      },

      updateDocumentReview: (reviewId: string, updates: Partial<DocumentReview>) => {
        set((state) => ({
          workspace: {
            ...state.workspace,
            documentReviews: state.workspace.documentReviews.map((dr) =>
              dr.id === reviewId ? { ...dr, ...updates } : dr
            ),
          },
        }))
      },

      addRegistrations: (registrations: Registration[]) => {
        set((state) => ({
          workspace: {
            ...state.workspace,
            registrations: [...state.workspace.registrations, ...registrations],
          },
        }))
      },

      addTeams: (teams: Team[]) => {
        set((state) => ({
          workspace: {
            ...state.workspace,
            teams: [...state.workspace.teams, ...teams],
          },
        }))
      },

      resetPrototype: () => {
        set({ workspace: createSeedWorkspace() })
      },
    }),
    {
      name: 'gms-admin-store',
      version: STORE_VERSION,
      migrate: () => {
        return { workspace: createSeedWorkspace() } as unknown as StoreState
      },
    }
  )
)
