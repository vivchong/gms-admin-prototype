# Progress

## Milestones

- [x] **1. Scaffolding**
- [x] **2. Dashboard**
- [x] **3. Settings page**
- [x] **4. Sports → Create sport flow**
- [x] **5. Sport detail page**
- [x] **6. Event creation + Event detail page**
- [x] **7. Demo data injection**
- [x] **8. Live form preview**
- [x] **9. Form builder**
- [x] **10. Registrations table**
- [x] **11. Document review queue**
- [x] **12. Polish + Reset prototype**

---

## Milestone 1: Scaffolding — DONE

**What shipped:**
- Vite + React 19 + TypeScript project with Tailwind CSS v4
- shadcn/ui components installed: button, input, select, dialog, sheet, table, tabs, dropdown-menu, badge, card, sonner (toast), separator, switch, label, command, popover, checkbox, textarea, scroll-area, tooltip
- React Router v6 with `HashRouter` — all IA routes stubbed
- Zustand store with `persist` middleware seeded with:
  - Workspace "Pesta Sukan 2027" with competition + registration windows
  - 7 edition rules (Singpass, residency, pass types, indemnity, emergency contact, parental consent, ID document)
  - Full foreigner quota table (29 rows, team sizes 2–30)
  - 7 category labels (Open, Masters 54-below, Masters 55+, Youth, Corporate, International, Para)
  - Fee structure per category (individual + team-per-player rates)
  - Empty arrays for sports, teams, registrations, document reviews
- Base layout: government header strip, app header (GMS logo + workspace pill + user avatar "AT"), left sidebar with 10 nav items, footer
- Route stubs for all 10 IA items + 404 fallback
- Placeholder pages for out-of-scope areas (Refunds, Indemnity, Comms, Roles, Audit log) with "Coming after UT" messaging
- Vite `base: './'` for GitHub Pages, `@/` path alias
- `npm run typecheck` and `npm run build` pass clean
- Demo injector skeleton ready for Milestone 7

**UT verification:**
- Sidebar navigation works across all routes
- Deep links via hash survive page refresh
- 404 route catches typos
- Placeholder pages tell participants these areas aren't built yet (no confusion)

---

## Milestone 2: Dashboard — DONE

**What shipped:**
- Four stat cards (Sports, Events, Registrations, Pending reviews) — all start at 0 on fresh workspace
- Empty state when no sports exist: centred card with Trophy icon, "Get started" heading, description, and "Create your first sport" primary CTA that navigates to /sports
- Post-sport state: competition window and registration window info cards shown below the stats
- Dates formatted with date-fns ("24 Jul 2027 – 1 Aug 2027" style)
- Stat counts are live — derived from Zustand store state

**UT verification:**
- Fresh workspace shows all-zero stats and empty state CTA
- CTA navigates to Sports list
- After demo injection (once an event is saved), stats update to reflect injected data

---

## Milestone 3: Settings page — DONE

**What shipped:**
- Single scrollable page with five sections:
  1. **Edition rules** — 7 rule cards with label, description, parameters formatted in plain English, and a disable/enable toggle. Toast on toggle confirms the action.
  2. **Foreigner quota table** — collapsible card with the full 29-row General R&R lookup (team sizes 2–30). Read-only.
  3. **Category labels** — 7 standard categories with descriptions. Read-only with helper text.
  4. **Fee structure** — read-only table showing individual and team-per-player fees per category, with helper text "Set at edition level."
  5. **Reset prototype** — danger-zone card (red-50 bg, red border) with confirm dialog. Clears localStorage and reloads.
- No "+ Add rule" button — list is fixed per spec
- Parameters rendered in plain English (pass type labels, residency labels, accepted ID docs, minor threshold year)

**UT verification:**
- Toggle any edition rule → toast confirms, card dims when disabled
- Expand/collapse foreigner quota table
- Fee structure shows correct S$ amounts matching General R&R
- Reset button → confirm dialog → clears all data, page reloads to fresh state

---

## Milestone 4: Sports → Create sport flow — DONE

**What shipped:**
- Sports list page with empty state ("No sports yet. Create your first sport." + CTA)
- Sports list row layout when sports exist: sport name (bold), venue (neutral-500), event count, registration count, publication status pill (Draft/Published). Row click → sport detail page.
- "Create sport" button in page header actions (shown when sports exist)
- Create sport form at `/sports/new` with fields:
  - Sport name (required), Pricing type (per event / bundle select), Description (textarea), Venue
  - Competition dates (start/end, defaults to edition window)
  - Registration window (open/close, defaults to edition window)
  - Last date for changes
- Form saves to Zustand store, toasts "Sport created", redirects to `/sports/:id`
- Breadcrumbs on create page: Sports › Create sport
- Sport detail page placeholder at `/sports/:sportId` showing sport name, venue, status badge, and breadcrumbs (full detail in M5)
- Routes: `/sports`, `/sports/new`, `/sports/:sportId/*`

**UT verification:**
- Empty state visible on fresh workspace, CTA navigates to create form
- Fill in sport name → Create → redirects to detail page, sport appears in list
- Cancel returns to list without saving
- Sport persists across page refresh (localStorage)

---

## Milestone 5: Sport detail page — DONE

**What shipped:**
- Full tabbed detail page at `/sports/:sportId` with 5 tabs:
  1. **Overview** — view/edit pattern for Basic information (name, description, venue, pricing type) and Dates (competition window, registration window, last change date). Edit button per section, save/cancel controls, toast on save.
  2. **Categories & Events** — flat event table with columns: Event name, Category, Gender, Age range / Fee, Registrations, Status. Category dropdown filter + search bar. "Add event" button wired to `/sports/:id/events/new`. Empty state when no events.
  3. **Rules** — read-only inherited edition rules list with "Edition default" badges + sport's own rules form (max events per participant with "No limit" toggle, exempt categories multi-select checkboxes). Save button, toast on save.
  4. **Form questions** — placeholder for Milestone 9.
  5. **Registrations** — sport-scoped registration table (participant, event, status, fee paid). Empty state until demo injection.
- Underline-style tabs matching BookingSG reference pattern
- Breadcrumbs: Sports › [Sport name]
- Publication status badge in header

**UT verification:**
- Create a sport → lands on detail page with all tabs navigable
- Edit basic info or dates → save → values persist, toast confirms
- Rules tab: set max events, toggle no limit, check exempt categories → save → persists
- Events tab: empty state with "Add event" CTA (wired for M6)
- Registrations tab: empty until demo data is injected

---

## Milestone 6: Event creation + Event detail page — DONE

**What shipped:**
- **Create Event wizard** at `/sports/:sportId/events/new`:
  - Step 1 — Event details + eligibility: name, description, category, capacity, competition dates, calculated fee display, gender, age range with "No limit" toggle, team event toggle (reveals min/max team size, gender mix dropdown, combined age, foreigner quota, corporate rules), parent/child toggle (reveals child age range), approval required toggle (reveals document type dropdown)
  - Step 2 — Form questions placeholder (M9 builds the full builder)
  - Step indicator (1 → 2) with visual progress
  - Calculated fee updates live based on category + team size
  - "Next" requires name + category; "Back" preserves state; "Save" commits atomically
  - Cancel navigates back to sport detail
- **Event detail page** at `/sports/:sportId/events/:eventId`:
  - White header / gray content split matching sport detail pattern
  - Breadcrumbs: Sports › [Sport] › [Event]
  - Tabs: Overview, Rules, Form questions, Registrations, Teams (only if team event)
  - Overview tab: view/edit for name, description, capacity; read-only calculated fee
  - Rules tab: inherited edition + sport rules (read-only), editable who-can-participate section (gender, age range, approval)
  - Registrations tab: event-scoped table
  - Teams tab: team table with name, member count, status (only for team events)
- Routes wired: `/sports/:sportId/events/new`, `/sports/:sportId/events/:eventId`

**UT verification:**
- From sport detail Events tab → "Add event" → wizard loads
- Fill name + pick category → fee displays → Next → Step 2 → Save → redirects to event detail
- Event appears in sport's Categories & Events table
- Event detail tabs all navigable, view/edit works
- Team event toggle reveals team eligibility sub-form
- Corporate category reveals corporate-specific fields

---

## Milestone 7: Demo data injection — DONE

**What shipped:**
- Full implementation of `src/lib/demoInjector.ts` per spec §4.6
- Triggered on first event save (guarded by `_demoInjected` workspace flag)
- Auto-creates 3 sibling demo events under the participant's sport:
  - "Youth U13 Singles" — Youth category, mixed gender, ages 12–13, fee S$10, individual
  - "Para Open Singles" — Para category, mixed gender, no age range, fee S$5, individual, approval required
  - "Corporate Team Event" — Corporate category, mixed, 20+ age, fee S$90, team (6–9 members), approval required, full corporate eligibility rules
- Injects 15 fake registrations with SG-typical names spread across all 4 events:
  - 9 confirmed, 3 pending_payment, 2 pending_indemnity (minors via parent), 1 refunded
  - All registrations carry full emergencyContact blocks
  - Parent-registered minors assigned to Youth U13 with appropriate DOBs
- Creates 1 team: "Team Sunrise Sports Co" under Corporate Team Event
  - Status `forming` (4 of 6 minimum members)
  - Manager registered self, other 3 added by team_manager
- Seeds 4 document review items (2 × para_classification, 2 × corporate_hr_letter), all pending
- Store version bumped to 3

**UT verification:**
- Clear localStorage → create a sport → create first event → demo data appears
- Dashboard stats update (4 events, 15 registrations, 4 pending reviews)
- Sport detail Events tab shows all 4 events
- Registrations tab shows populated data
- Second event save does not re-trigger injection

---

## Milestone 8: Live form preview — DONE

**What shipped:**
- **PreviewPanel** wrapper (`src/components/preview/PreviewPanel.tsx`) — sticky right-hand panel with "Preview" label, scrollable, 400px wide
- **EventDetailsPreview** (`src/components/preview/EventDetailsPreview.tsx`) — stylised citizen-portal event landing page:
  - Hero block: sport name + category, event name, tournament dates, venue
  - Eligibility section: gender, age, residency (checkmark list matching screenshot style)
  - Team requirements (if team event): size, gender mix, foreigner quota, corporate rules
  - Parent-child note (if applicable)
  - Next steps timeline (register + play)
  - Footer: fee, capacity, registration deadline, "Log in with Singpass" button
- **RegistrationFormPreview** (`src/components/preview/RegistrationFormPreview.tsx`) — stylised registration form:
  - Team details section (if team event) — rendered first, with team name + sport/event questions
  - Athlete details section: Singpass info banner, pre-filled identity fields (readonly style), mobile/email, custom questions
  - Supporting document upload (if approval required)
  - Emergency contact section
  - Declaration/indemnity section
  - Payment summary
- **Event detail page** — 2-column layout with preview on Overview and Form questions tabs. Registrations/Teams tabs hide the preview and use full width.
- **Create Event wizard** — 2-pane split (form left, preview right). Step 1 shows event details preview updating live. Step 2 shows registration form preview.
- Preview updates live as admin edits fields (category, gender, age, team, capacity, fee all reflected in real time)

**UT verification:**
- Create Event wizard step 1 → preview shows event page updating live as fields are filled
- Switch to step 2 → preview switches to registration form
- Event detail → Overview tab shows event details preview
- Event detail → Form questions tab shows registration form preview
- Event detail → Registrations/Teams tabs → preview hidden, full-width tables

---

## Milestone 9: Form builder — DONE

**What shipped:**
- **Reusable `FormBuilder` component** (`src/components/forms/FormBuilder.tsx`):
  - Two containers per context: "Athlete details questions" and "Team details questions"
  - Inline editor with fields: Input type (dropdown: Single-line text, Multi-line text, Dropdown, File upload), Question label (required), Description (optional), Required toggle
  - Dropdown type reveals an "Options" repeater with add/remove rows (min 2 options validated)
  - Per-question affordances: edit (pencil icon), delete (trash icon with confirm dialog), reorder (up/down chevrons)
  - `appliesTo` is set programmatically from the section container, not exposed to admin
- **Sport detail page → Form questions tab**: shows both Athlete and Team containers. Questions saved to `sport.customQuestions`. Helper text explains team questions only appear for team events.
- **Event detail page → Form questions tab**: shows Team container first (only if team event), then Athlete container. Questions saved to `event.customQuestions`.
- **Create Event wizard → Step 2**: full form builder (same layout as event detail) replacing the old placeholder. Questions stored in local state and committed atomically on save.
- **Live preview integration**: builder output appears in RegistrationFormPreview — sport-level questions with "Sport-specific question" pill, event-level questions without pill.

**UT verification:**
- Sport detail → Form questions → add a question to Athlete section → appears in preview for all events under this sport
- Event detail → Form questions → add a question → appears in event's registration form preview
- Create Event → step 2 → add questions → preview updates live → save → questions persist on event detail
- Edit a question → changes reflected immediately
- Delete a question → confirm dialog → removed
- Reorder with up/down arrows → order changes persist

---

## Milestone 10: Registrations table — DONE

**What shipped:**
- **Full workspace-wide registrations table** at `/registrations`:
  - Columns: Participant name, Event, Registered date, Fee paid, Status
  - Status column shows individual status pill + team pill (team name · team status) for team members
  - Row click opens side panel with full registration detail
- **Filter pills above the table**:
  - Event filter: shadcn Command/Combobox with sport-grouped collapsible sections, search matches sport and event names
  - Status filter: dropdown with all registration statuses
  - Residency filter: dropdown (SG Citizen, SG PR, Valid pass holder)
  - "Clear" button when any filter is active
- **Registration detail side panel** (Sheet, right-side, 480px):
  - Participant block: name, masked NRIC, DOB, gender, residency, contact
  - Registered by block: name, relationship pill, NRIC, contact
  - Emergency contact block
  - Registration details: sport, event, date, fee paid, jersey number
  - Team members section (if team registration): lists other team members in expandable rows showing their participant/status/payment details
- Empty state when no registrations exist
- Count shown below table

**UT verification:**
- Navigate to Registrations → table shows all 15 demo registrations
- Filter by event → table narrows to that event's registrations
- Filter by status (e.g. "Confirmed") → only confirmed shown
- Filter by residency → matches
- Click a row → side panel opens with full detail
- Team member row → click to expand → shows member details
- Clear filters → all registrations shown again

---

## Milestone 11: Document review queue — DONE

**What shipped:**
- **Document review queue page** at `/document-review`:
  - Table with columns: Participant, Sport, Event, Document type, Uploaded, Days waiting, Status
  - Status pill colours: pending (blue), approved (green), rejected (red), reupload requested (amber)
  - Filter pills: by sport, by document type, by status (defaults to "pending")
  - "Clear" button when any filter is active
  - Row count shown below table
- **Detail side panel** (Sheet, 480px right) on row click:
  - Document header: type, file name with mock file preview card, uploaded date, "View source event" link navigating to the event detail page
  - Participant context: name, NRIC, DOB, residency, sport, event, team (if applicable)
  - Registered by block: name, relationship, NRIC, mobile
  - Review history: chronological list of all prior review actions (approval, rejection, reupload requests) with timestamp, reviewer name, and note
  - Empty state when no prior reviews
- **Actions** (sticky bottom bar):
  - Approve — instantly updates status, appends note to history, closes panel, shows toast
  - Reject — opens modal with reason textarea (required), updates status on submit
  - Request reupload — opens modal with note textarea (required), updates status on submit
  - Actions hidden for already-approved or rejected documents (shows status message instead)
- **Store changes**:
  - `DocumentReview` type extended with `notes: ReviewNote[]` array for review history
  - `ReviewNote` type added: action, optional note, reviewedAt, reviewer
  - `updateDocumentReview` store action added
  - Store version bumped to 6

**UT verification:**
- Navigate to Document Review → table shows 4 demo documents (all pending)
- Default filter shows only pending → clear filters to see all
- Filter by document type → narrows to para_classification or corporate_hr_letter
- Click a row → side panel opens with full context
- Approve a document → status updates, toast confirms, review history shows the action
- Reject a document → modal requires reason → submit → status + history update
- Request reupload → modal requires note → submit → status + history update
- "View source event" link navigates to the correct event detail page

---

## Milestone 12: Polish + Reset prototype — DONE

**What shipped:**
- **Skeleton loading state** on live form preview (`PreviewPanel`): brief 300ms skeleton animation on mount before content renders, giving the preview a responsive feel
- **Keyboard shortcut**: pressing `/` focuses the nearest search input on the page (skips if user is already in an input/textarea)
- **Esc closes sheets/modals**: already handled natively by shadcn/Radix primitives (Sheet, Dialog)
- **Toast on save**: already in place for all state-mutating actions across the app
- **Reset prototype**: already implemented in Settings with confirm dialog, clears localStorage and reloads
- **404 fallback route**: already implemented with "Page not found — go back to Dashboard" card
- **Empty states on placeholder pages**: already implemented (Refunds & Payments, Indemnity, Comms, Roles & Access, Audit log) with description + "Coming after UT"
- **Breadcrumbs**: already present on all sport and event detail pages with full hierarchy

**UT verification:**
- Press `/` on any page with a search bar → search input focuses
- Press `Esc` while a side panel or dialog is open → it closes
- Navigate to Create Event → preview shows skeleton briefly, then renders content
- All placeholder pages show "Coming after UT" messaging
- Settings → Reset prototype → confirm → all data cleared, app reloads to fresh state
- Type a bad URL → 404 page shows with "Go back to Dashboard" button
