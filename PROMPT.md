# 🧳 Buddies — Trip Planner Web App | Master Build & Learning Prompt

> **Tagline:** Plan trips. Travel together. Remember everything.
> **Use this prompt with:** Cursor IDE / Claude Code (with Claude as the model)
> **Mode:** Teach-first learning + self-documenting project
> **Audience:** A 4+ year React/Next.js developer leveling up by shipping a real, end-to-end production app

---

## 0. Who I Am & How I Want to Work

I'm a **Full Stack Developer with 4+ years of experience** in React, Next.js, Node.js, MongoDB, and Prisma. I want to build a real, production-quality web app called **Buddies** — a trip planner built for groups of friends — and treat it as a public learning journey: every concept, every bug, every feature, documented for myself and anyone reading along.

This is a **single Next.js 14 (App Router) app** at the repo root. UI and API live in the same project and ship as one deploy. No separate mobile app, no microservices.

### My Learning Style — Read This Carefully

For **EVERY** concept, feature, library, or decision, you must explain in this exact order:

1. **WHAT** it is — definition in plain English
2. **WHY** we need it — what problem it solves, why this approach over alternatives
3. **HOW** we implement it — step-by-step with code

Never skip any of the three. Even for things that seem obvious. Assume nothing is obvious — write for the version of me reading this six months from now.

### Mental-model anchors

When introducing something Next.js–specific (RSC, server actions, route handlers, edge runtime, hydration), call out the model explicitly:

> *"In a classic SPA you'd `useEffect → fetch → setState`. With Server Components you just `await fetch()` at the top of the component — it runs on the server, the data is already in the HTML when the page lands."*

These anchors are the fastest way to learn — by linking the new mental model to the one already in my head.

---

## 1. 📚 THE DOCUMENTATION SYSTEM (Critical — Read & Follow Always)

**Every commit, every concept, every bug, every task gets documented.** Non-negotiable.

### Folder Structure

```
buddies/
├── app/                      # Next.js App Router — pages, layouts, route handlers
├── components/               # Shared React components (added as features land)
├── lib/                      # Server-only helpers, db client, etc.
├── prisma/                   # Prisma schema + generated client
│   └── schema.prisma
├── public/                   # Static assets
├── plans/                    # ⭐ One Markdown note per commit (beginner-friendly)
│   ├── Infra_01_Collapse_existing_structure.md
│   ├── Infra_02_Scaffold_root_nextjs.md
│   └── ...
├── PROMPT.md                 # This file
├── FUTURE_SCOPE.md           # V2 features playbook
└── docs/
    ├── README.md             # Master index — auto-update as new docs are added
    ├── COMMIT_CONVENTION.md  # `Infra_NN_Descriptive_name` + plan-file workflow
    ├── learning/             # Concept lessons, one per topic
    │   ├── day1_setup.md
    │   ├── day1_installation.md
    │   └── ...
    ├── bug/                  # Every bug encountered, sequentially numbered
    │   ├── 01_short_description.md
    │   └── ...
    └── task/                 # Every feature/task, sequentially numbered
        ├── 01_project_scaffolding.md
        └── ...
```

### Naming Conventions (Strict)

- **Plan docs (`/plans/`):** `<Category>_NN_Descriptive_name.md` — matches the commit message exactly. See `docs/COMMIT_CONVENTION.md`.
- **Learning docs:** `dayN_<snake_case_topic>.md` — multiple per day allowed.
- **Bug docs:** `NN_<snake_case_short_description>.md` — sequential, zero-padded.
- **Task docs:** `NN_<snake_case_feature_name>.md` — sequential, zero-padded.

### When to Create Each Doc Type

| Trigger                                  | Doc Type | Action                                                                 |
| ---------------------------------------- | -------- | ---------------------------------------------------------------------- |
| Starting any commit                      | Plan     | Create BEFORE making the changes; commit them together atomically.     |
| Starting a new concept/lesson            | Learning | Create BEFORE writing code, fill in WHAT/WHY/HOW upfront.              |
| Encountering any error/bug (even small)  | Bug      | Create immediately; update with solution after fixing.                 |
| Starting a new feature/task              | Task     | Create at task kickoff; update progressively as work continues.        |

### Master Index (`docs/README.md`)

Auto-maintain. Whenever you create a new doc, also add a line to `docs/README.md`.

```markdown
# Buddies — Documentation Index

## 📘 Learning Journal
- [Day 1 — Project Setup](./learning/day1_setup.md)
- ...

## 🐛 Bug Journal
- [Bug 01 — short description](./bug/01_short_description.md)
- ...

## 📋 Task Journal
- [Task 01 — Project Scaffolding](./task/01_project_scaffolding.md)
- ...

## 🔮 Future Scope
- See [FUTURE_SCOPE.md](../FUTURE_SCOPE.md) for V2 features playbook

## 📝 Convention
- See [COMMIT_CONVENTION.md](./COMMIT_CONVENTION.md) for the commit/plan-file convention
```

---

## 2. 📄 Doc Templates — Use These Exactly

### 2.1 Learning Doc Template (`/docs/learning/dayN_topic.md`)

```markdown
# Day N — <Topic Name>

> **Created:** YYYY-MM-DD
> **Phase:** <Phase number/name>

---

## 🎯 What Are We Learning?
## 🤔 Why Does This Matter?
## 🧠 How It Works (The Concept)
## 💻 Tiny Isolated Example

```tsx
// Smallest possible runnable code
```

## 🚀 Applied to Buddies
> See: [Task NN — <feature>](../task/NN_feature.md)

## ⚠️ Gotchas & Beginner Mistakes
## 🧪 Quick Quiz
## 📌 Key Takeaways
## 🔗 References
## ➡️ What's Next?
```

### 2.2 Bug Doc Template (`/docs/bug/NN_description.md`)

```markdown
# Bug NN — <Short Description>

> **Date:** YYYY-MM-DD
> **Severity:** 🔴 Critical / 🟡 Major / 🟢 Minor
> **Status:** 🔄 Open / ✅ Resolved
> **Time to fix:** <e.g., 30 mins>

---

## 🐛 What Happened?
### Error Message / Stack Trace
## 🎯 What I Was Trying to Do
> See: [Task NN — <feature>](../task/NN_feature.md)
## 🔍 Steps to Reproduce
## 🧪 What I Tried (That Didn't Work)
## 💡 Root Cause
## ✅ Solution
## 🤔 Why This Happened (Deep Dive)
> Related concept: [Day N — <topic>](../learning/dayN_topic.md)
## 🛡️ How to Avoid Next Time
## 🔗 References
```

### 2.3 Task Doc Template (`/docs/task/NN_feature_name.md`)

```markdown
# Task NN — <Feature Name>

> **Started:** YYYY-MM-DD
> **Completed:** YYYY-MM-DD
> **Status:** 📝 Planning / 🔄 In Progress / ✅ Done / ⏸️ Blocked
> **Phase:** <Phase number/name>

---

## 🎯 Goal
## 📖 User Story
## ✅ Acceptance Criteria
- [ ] Works on desktop and mobile breakpoints
- [ ] TypeScript-strict, no `any`
- [ ] Theme-aware (light + dark)
- [ ] Localized (no hardcoded English)
- [ ] Accessible (semantic HTML, ARIA where needed)

## 🛠️ Tech Decisions
### Decision 1: <choice>
- **Why:** <reasoning>
- **Alternatives considered:** <other options>
- **Trade-offs:** <what we gave up>

## 📋 Implementation Plan
## 🧠 Concepts Used (Links to Learning Docs)
## 📁 Files Created / Modified
## 💻 Code Highlights
## 🧪 How I Tested It
## 🐛 Bugs Encountered During This Task
## 📸 Screenshots
## ➡️ What's Next? (Follow-ups)
```

### 2.4 Plan Doc Template (`/plans/<Category>_NN_Descriptive_name.md`)

See [`docs/COMMIT_CONVENTION.md`](./docs/COMMIT_CONVENTION.md) for the canonical template. Sections: Goal → Summary (with two TL;DR tables) → Commands → Files changed → Verification → Gotchas/decisions.

---

## 3. The App I'm Building — Buddies

A web-first trip planner built around the idea that **the best trips happen with friends**. Group trips, shared expenses, and shared memories are first-class citizens.

### Core Features (V1)

1. **Trip Management with Smart Categorization** ⭐
   - Trips automatically categorized as **Past / Active / Upcoming / Drafts**
   - Home screen tabs/segmented control to filter
   - Hero card with countdown to next upcoming trip ("Goa in 12 days 🏝️")
   - "Active now" badge with subtle animation for trips happening today
   - Drafts: save trip without dates required, promote to full trip later

2. **Invite Buddies via Email** ⭐
   - Trip owner invites buddies by email address
   - Recipient gets an email with a magic link to join the trip
   - If they're signed in → accept/decline screen
   - If not → sign-in flow first, then accept/decline
   - Pending invitations visible in trip's members section
   - Re-send invitation, revoke pending invitation

3. **Places to visit** with Google Maps deep-link

4. **Place Insights from Web** ⭐
   - Each place auto-fetches a summary from Wikipedia (history, significance, photos)
   - Tied to user's preferred language
   - "Learn About This Place" section on the place detail page

5. **Photos** per place (drag-and-drop or browser camera capture via `getUserMedia`)

6. **Activities** at each place — title, price, priority, status

7. **Expenditure tracking** per place and per trip

8. **Target budget** vs spent dashboard

9. **Packing checklist** with templates

10. **Staying plans** (hotels/Airbnb/etc.)

11. **Food plans** (restaurants, must-try dishes)

12. **Group trips + bill splitting** (the heart of "Buddies")

13. **Itinerary Day View — Timeline** ⭐
    - For each trip, vertical timeline grouped by day
    - Each day card shows: stay for that night, planned places (sorted by time), activities, meals, expense summary
    - Smooth scrollable view with sticky day headers (CSS `position: sticky`)
    - Click any item → jump to its detail page
    - "Today" highlight when viewing during the trip
    - This is the showcase screen — the one users will screenshot and share

14. **PWA + Offline-friendly reads** ⭐
    - Installable web app (manifest + service worker)
    - Per-trip toggle: "Make available offline"
    - When enabled: pre-cache trip data, photos, place insights, members
    - Network status indicator in app header (subtle)
    - Read operations work offline; mutations queue and sync on reconnect via background sync
    - "Last synced X mins ago" stamp on trip dashboard

15. **Reminders** with web push notifications (or in-app fallback)

16. **Language + theme** (i18n + light/dark via `prefers-color-scheme`)

17. **Travel music** (curated YouTube/Spotify embeds + user playlists)

### Future Features

See [`FUTURE_SCOPE.md`](./FUTURE_SCOPE.md) for the V2 playbook.

---

## 4. Tech Stack (Locked)

A single Next.js 14 (App Router) app. UI and API live together; one deploy.

- **Next.js 14+** (App Router) — pages, layouts, route handlers, server actions
- **TypeScript strict mode**
- **Tailwind CSS** for styling
- **Prisma + MongoDB** (Atlas free tier for dev)
- **Better Auth** for authentication
- **Cloudinary** for image uploads
- **Resend** + **React Email** for transactional email
- **Zod** for validation (used by both server actions and route handlers)
- **React Hook Form** for forms
- **Zustand** for client-side state where Server Components aren't enough
- **TanStack Query** — added if/when client-side cache + optimistic updates become necessary (deferred for now)
- **i18next** — added when we have a real second locale to test against (deferred for now)
- Deployment: **Vercel / Render / Fly.io** (decided per project; the app is host-agnostic)

### 🔐 Why Better Auth (Not Clerk / NextAuth)?

| Aspect              | Better Auth                                          | Clerk                          | NextAuth (Auth.js)                 |
| ------------------- | ---------------------------------------------------- | ------------------------------ | ---------------------------------- |
| Cost                | **Free, open source, self-hosted**                   | Free tier limited              | Free, self-hosted                  |
| Stack fit           | **Native Prisma + MongoDB, simple Next.js wiring**   | External service               | Native Next.js, Prisma adapter     |
| RBAC / admin        | **Built-in plugins for V2**                          | Tied to plan                   | Bring your own                     |
| Lock-in             | Zero — all data in your DB                           | All users on Clerk's servers   | Zero                               |
| Choice rationale    | Best mix for our stack                               | —                              | —                                  |

### 📧 Why Resend + React Email (for invitations)?

- **Resend:** Modern email API, simple SDK, generous free tier (3000/month), great deliverability
- **React Email:** Write email templates as JSX components — exactly what you already know
- **Alternatives considered:** SendGrid (more setup, older API), AWS SES (cheap but config-heavy)

### ⚡ Why server-first (RSC + Server Actions)?

- **Server Components** by default — render data on the server, send only HTML + the components that need interactivity. Smaller bundles, faster Time-to-First-Byte.
- **Server Actions** — write a server function and call it from a client component like an RPC. No `/api/something` boilerplate for simple mutations.
- **Route handlers** — when you DO need a real HTTP endpoint (webhooks, third-party integrations, image upload signing), `app/api/<x>/route.ts` is the home.
- **The mental model:** "what runs where?" Server Components run only on the server. Anything imported from a `"use client"` file runs in the browser. Everything else (server-only code, env secrets, db calls) stays server-side. Forget which is which and you'll see runtime errors fast.

---

## 5. The Learning Roadmap (15 Days → 6 Phases)

> Each "Day" is a self-contained lesson + build session. Pace is flexible.

---

### 🟢 PHASE 1 — Foundations (Days 1–3)

#### **Day 1 — Setup & Mental Model Shift**

Learning docs:
- `day1_setup.md` — Why a single Next.js App Router app for UI + API
- `day1_installation.md` — Node 20+, pnpm, MongoDB, Cloudinary, Resend accounts
- `day1_app_router_vs_pages_router.md` — File conventions, where common Pages-Router instincts go wrong
- `day1_first_page.md` — Hello Buddies page styled with Tailwind, `/api/health` route handler

**Task doc:** `01_project_scaffolding.md`

**Build:** Project at repo root with TypeScript strict, render styled "Hello Buddies" page, `/api/health` returns JSON. (Already done in `Infra_02`.)

---

#### **Day 2 — App Router & RSC Mental Model**

Learning docs:
- `day2_rsc_vs_client_components.md` — When to add `"use client"` and why
- `day2_layouts_and_templates.md` — Nested layouts, segment groups `(auth)`/`(app)`
- `day2_loading_and_error_files.md` — `loading.tsx`, `error.tsx`, streaming
- `day2_metadata_api.md` — Per-page `metadata`, OpenGraph, dynamic titles

**Task doc:** `02_app_shell.md`

**Build:** Real app shell — `app/(auth)/sign-in/page.tsx`, `app/(app)/layout.tsx` with header + nav, `loading.tsx` skeletons, `error.tsx` boundaries.

---

#### **Day 3 — Tailwind, Design Tokens, and Theme System**

Learning docs:
- `day3_tailwind_in_nextjs.md` — Tailwind config, content globs, JIT
- `day3_design_tokens.md` — Why semantic colors, never raw hex
- `day3_dark_mode.md` — `prefers-color-scheme` + a manual override stored in a cookie
- `day3_responsive_layout.md` — Container queries, mobile-first breakpoints

**Task doc:** `03_theme_system.md`

**Build:** Design tokens, reusable `<Card>`/`<Button>`, Trip Card UI, dark mode toggle (with FOUC prevention via `cookies()` read).

---

### 🟡 PHASE 2 — Core App Plumbing (Days 4–6)

#### **Day 4 — Forms, Server Actions, Trip Categorization** ⭐

Learning docs:
- `day4_forms_in_app_router.md` — `<form action={serverAction}>` vs RHF + client submission
- `day4_react_hook_form.md` — RHF + Zod, when controlled-input pain is worth it
- `day4_useFormState_useFormStatus.md` — Pending state, validation echoes, progressive enhancement
- `day4_lists_and_pagination.md` — Server-rendered list + client filters, when to paginate
- `day4_trip_status_logic.md` — Computed status (past/active/upcoming/draft) from dates, locale-safe

**Task docs:**
- `04_create_trip_flow.md` — Modal dialog form with "Save as Draft" option, server action mutation
- `05_trip_list_with_categories.md` — Home screen with tabs, countdown hero card

---

#### **Day 5 — i18n + Empty States + UX Polish**

Learning docs:
- `day5_i18n_options.md` — `next-intl` vs `i18next` vs simple JSON dictionaries — which fits a 2-locale app
- `day5_empty_loading_error_states.md` — The three states every list/dashboard needs
- `day5_skeleton_loaders.md` — Server-rendered skeletons via `loading.tsx`
- `day5_settings_page.md` — Theme + language picker UX, persistence in user record

**Task docs:** `06_i18n_foundation.md`, `07_settings_page.md`

---

#### **Day 6 — Prisma + MongoDB**

Learning docs:
- `day6_prisma_in_nextjs.md` — Where `PrismaClient` lives, the global-singleton pattern, server-only imports
- `day6_mongodb_with_prisma.md` — ObjectId quirks, `@map("_id")`, indexes, why no migrations
- `day6_prisma_seed_script.md` — Seeding dev data with `pnpm prisma db seed`
- `day6_data_fetching_patterns.md` — Server Component DB queries vs route handlers vs server actions — when to use which

**Task docs:** `08_db_setup.md`, `09_trips_crud.md`

**Build:** Prisma client wired up, real Trip CRUD via server actions + Server Components, no in-memory state.

---

### 🟠 PHASE 3 — Auth + Wired Up (Day 7)

#### **Day 7 — Better Auth**

Learning docs:
- `day7_better_auth_overview.md` — What it is, why over Clerk/NextAuth, architecture
- `day7_better_auth_install.md` — `auth.ts` config, Prisma adapter, Better Auth schema generation via CLI
- `day7_email_password_flow.md` — Sign-up, sign-in, sign-out, session cookies
- `day7_protecting_pages.md` — Middleware-based gate vs `getSession()` in layouts; trade-offs
- `day7_session_in_server_actions.md` — How a server action knows who the user is
- `day7_oauth_extension.md` (optional) — Adding Google as a second provider

**Task docs:**
- `10_better_auth_server_setup.md`
- `11_sign_in_sign_up_pages.md`
- `12_protected_app_routes.md`
- `13_trips_crud_user_scoped.md`

**🎉 Milestone: signed-in user creating real trips persisting to MongoDB.**

---

### 🔵 PHASE 4 — Web-Native Features (Days 8–10)

#### **Day 8 — Image Uploads with Cloudinary**

Learning docs:
- `day8_file_uploads_in_nextjs.md` — `<input type="file">`, FormData, server actions vs route handlers for uploads
- `day8_cloudinary_signed_uploads.md` — Why server-signed uploads beat shipping the API secret
- `day8_image_optimization.md` — `next/image`, Cloudinary transformations, responsive `srcSet`
- `day8_drag_and_drop.md` — File-drop zones with `dataTransfer.files`
- `day8_browser_camera.md` (optional) — `getUserMedia()` for capturing photos in-browser

**Task docs:** `14_places_crud.md`, `15_place_photos.md`

---

#### **Day 9 — Maps & Place Insights from Wikipedia** ⭐

Learning docs:
- `day9_web_maps_options.md` — react-leaflet (free, OSM tiles) vs Mapbox GL JS vs Google Maps JS — pick one
- `day9_places_autocomplete.md` — Google Places Autocomplete via the JS API (or alternative geocoders)
- `day9_markers_and_bounds.md` — Showing all trip places on one map, fitting bounds
- `day9_deep_link_to_google_maps.md` — `https://www.google.com/maps/?q=…` URL scheme
- `day9_wikipedia_rest_api.md` — Wikipedia REST API, geosearch + summary, language variants
- `day9_caching_strategy.md` — Why we cache insights server-side via the `PlaceInsight` model

**Task docs:**
- `16_place_creation_with_maps.md`
- `17_trip_map_view.md`
- `18_place_insights_backend.md`
- `19_place_insights_ui.md`

**Place Insights flow:**
1. **Geosearch:** `GET https://{lang}.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord={lat}|{lng}&gsradius=10000&gslimit=5`
2. **Summary fetch:** `GET https://{lang}.wikipedia.org/api/rest_v1/page/summary/{title}`
3. **Fallback:** title-based search if geosearch returns nothing
4. Cache in `PlaceInsight` model (per place + language combo)
5. Refresh on user-tapped button or after 30 days

---

#### **Day 10 — Reminders + Web Push Notifications**

Learning docs:
- `day10_web_push_overview.md` — Subscriptions, endpoints, VAPID keys
- `day10_service_worker_basics.md` — Registering one, handling `push` events
- `day10_permission_ux.md` — When to ask for notification permission (hint: not on first load)
- `day10_in_app_reminders_fallback.md` — When the user denies notifications, gracefully fall back to in-app banners

**Task doc:** `20_reminders_feature.md`

> **Heads-up:** iOS Safari requires the user to install the app to the Home Screen before web-push works. Document the platform matrix in the task doc.

---

### 🟣 PHASE 5 — Feature Buildout (Days 11–14)

#### **Day 11 — Money Features + Email Invitations** ⭐

Learning docs:
- `day11_currency_handling.md` — Multi-currency, conversion, caching rates
- `day11_charts_in_react.md` — Recharts vs visx vs nivo for budget visualizations
- `day11_bill_splitting_algorithm.md` — Minimum-transactions settlement
- `day11_resend_setup.md` — Resend account, API key, domain verification
- `day11_react_email_templates.md` — Building JSX email templates
- `day11_invitation_flow.md` — Token generation, magic-link landing page, accept/decline UX

**Task docs:**
- `21_expenses_crud.md`
- `22_budget_dashboard.md`
- `23_group_members.md`
- `24_bill_splitting.md`
- `25_settlement_view.md`
- `26_email_invitations_backend.md`
- `27_email_invitations_ui.md`

**Email Invitation flow:**
1. Trip owner taps "Invite buddy" in members section
2. Enters email + selects role (default: member)
3. Backend creates `TripInvitation` (token, email, tripId, role, expiresAt = +7 days)
4. Backend sends email via Resend with link: `https://buddies.app/invite/<token>`
5. Recipient clicks link
   - Signed in → accept/decline page
   - Not signed in → sign-in flow first, then accept/decline
6. On accept → user added as `TripMember`, invitation status updated
7. Owner sees pending/accepted/declined badges in members list
8. Owner can re-send (if pending) or revoke (if pending)

---

#### **Day 12 — Logistics Features + Music**

Learning docs:
- `day12_audio_embeds.md` — YouTube IFrame API and Spotify Embed for playlists
- `day12_drag_and_drop_lists.md` — `dnd-kit` for re-orderable items (packing list, itinerary)

**Task docs:** `28_activities.md`, `29_stays.md`, `30_meals.md`, `31_packing_checklist.md`, `32_music_player.md`

> These features all share similar CRUD patterns by now — move quickly. They feed the timeline view in Day 13.

---

#### **Day 13 — Itinerary Timeline View** ⭐ (the showcase page)

Learning docs:
- `day13_complex_layouts.md` — Vertical timelines on the web, sticky headers via `position: sticky`
- `day13_data_aggregation.md` — Combining places, stays, meals, activities, expenses by day
- `day13_view_transitions_api.md` — `view-transition-name` for smooth navigation between list and detail
- `day13_animations_basics.md` — Framer Motion fundamentals (or pure CSS) for tasteful motion

**Task docs:**
- `33_itinerary_timeline_data_layer.md` — Aggregation service that builds day-by-day structure
- `34_itinerary_timeline_ui.md` — The timeline page itself
- `35_itinerary_today_highlight.md` — "Today" auto-scroll + visual emphasis when viewing during the trip

**Timeline Page Spec:**
- New page at `app/(app)/trip/[id]/itinerary/page.tsx`
- Top tab on trip dashboard: Overview | **Itinerary** | Places | Expenses | …
- Vertical scrollable timeline with sticky day headers (Day 1, Day 2, …)
- Each day card shows in this order:
  - Stay (where you're sleeping that night)
  - Morning meals → Places visited that morning → Activities
  - Afternoon meals → Places → Activities
  - Evening meals → Places → Activities
  - Day expense summary (₹ spent today)
- Click any item → navigate to its detail page
- Empty day → "No plans yet — add something!"
- "Today" auto-scrolls into view when trip is active
- Subtle vertical line connecting items, with colored dots per category (place=blue, meal=orange, activity=purple, stay=green)

---

#### **Day 14 — PWA + Offline-Friendly Reads** ⭐

Learning docs:
- `day14_pwa_overview.md` — Manifest, install prompt, what "installable" actually means
- `day14_service_workers.md` — Lifecycle, cache strategies (cache-first, network-first, stale-while-revalidate)
- `day14_workbox_or_next_pwa.md` — `next-pwa` plugin vs hand-rolled Workbox
- `day14_background_sync.md` — Queueing mutations offline, replaying on reconnect
- `day14_offline_ux.md` — Visual patterns: stale-data badges, sync timestamps, offline banner
- `day14_image_caching.md` — Caching Cloudinary images via the service worker for offline trip browsing

**Task docs:**
- `36_pwa_baseline.md` — Manifest + service worker + install button
- `37_per_trip_offline_toggle.md` — "Make available offline" toggle UI + cache pre-warming
- `38_offline_storage_management.md` — Per-trip cache size display + clear-cache action

**PWA Offline Spec:**
- **Three layers of offline support:**
  1. **Always-on baseline** — service worker caches recently viewed pages and their images; recently visited trips work offline by default
  2. **Per-trip explicit pre-cache** — User toggles "Make available offline" on a trip
     - Pre-fetches: trip data, all places, all photos (forced through the SW cache), place insights, members, expenses, packing items, stays, meals, reminders
     - Shows download progress
     - Marks trip with offline icon in trip list
     - Re-syncs daily when online (background sync)
  3. **Mutation queue** — Writes (add expense, mark place visited, etc.) queue when offline, replay when reconnected
- **Network status indicator** — subtle banner at top when offline
- **Last synced timestamp** — small label on trip dashboard
- **Storage usage** — in Settings, show per-trip cache size with "Clear" button
- **V1 scope limit:** map tile offline caching is NOT included (deferred to V2 — needs Mapbox or different map library)

---

### ⚫ PHASE 6 — Future-Proofing (Day 15)

**Task doc:** `39_v2_scaffolding.md`

Scaffold (don't build) all V2 features per [`FUTURE_SCOPE.md`](./FUTURE_SCOPE.md):
- Feature flags via `lib/featureFlags.ts` config
- Stub pages for each future feature
- Schema sketches (commented out in Prisma) ready for migration
- Reference to FUTURE_SCOPE.md from `docs/README.md`

---

## 6. Prisma Schema (paste into Day 6, extend in Days 11 & 14)

> The User/Session/Account/Verification models follow Better Auth's required schema. Generate via `npx @better-auth/cli generate`.

```prisma
// === Better Auth Required Models ===

model User {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  email         String    @unique
  emailVerified Boolean   @default(false)
  name          String
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  preferredLanguage String  @default("en")
  preferredTheme    String  @default("system")

  trips             Trip[]
  sessions          Session[]
  accounts          Account[]
  invitationsSent   TripInvitation[] @relation("InvitedBy")
}

model Session {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  id                    String    @id @default(auto()) @map("_id") @db.ObjectId
  userId                String    @db.ObjectId
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accountId             String
  providerId            String
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

model Verification {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

// === Buddies App Models ===

model Trip {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  ownerId       String   @db.ObjectId
  owner         User     @relation(fields: [ownerId], references: [id])
  title         String
  description   String?
  coverImageUrl String?
  startDate     DateTime?
  endDate       DateTime?
  destination   String
  targetBudget  Float    @default(0)
  baseCurrency  String   @default("INR")
  isGroupTrip   Boolean  @default(false)
  isDraft       Boolean  @default(false)

  members       TripMember[]
  invitations   TripInvitation[]
  places        Place[]
  stays         Stay[]
  meals         Meal[]
  expenses      Expense[]
  packingItems  PackingItem[]
  reminders     Reminder[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model TripMember {
  id        String  @id @default(auto()) @map("_id") @db.ObjectId
  tripId    String  @db.ObjectId
  trip      Trip    @relation(fields: [tripId], references: [id], onDelete: Cascade)
  userId    String? @db.ObjectId
  guestName String?
  email     String?
  role      String  @default("member")
  joinedAt  DateTime @default(now())
}

model TripInvitation {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  tripId      String   @db.ObjectId
  trip        Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  email       String
  token       String   @unique
  role        String   @default("member")
  invitedById String   @db.ObjectId
  invitedBy   User     @relation("InvitedBy", fields: [invitedById], references: [id])
  status      String   @default("pending")    // pending | accepted | declined | expired | revoked
  expiresAt   DateTime
  acceptedAt  DateTime?
  declinedAt  DateTime?
  createdAt   DateTime @default(now())

  @@index([email])
  @@index([token])
}

model Place {
  id               String   @id @default(auto()) @map("_id") @db.ObjectId
  tripId           String   @db.ObjectId
  trip             Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  name             String
  description      String?
  address          String
  latitude         Float
  longitude        Float
  plannedVisitDate DateTime?
  plannedTimeSlot  String?              // morning | afternoon | evening | night — used by timeline
  priority         String   @default("medium")
  category         String
  notes            String?
  isVisited        Boolean  @default(false)
  photos           Photo[]
  activities       Activity[]
  expenses         Expense[]
  insights         PlaceInsight[]
  createdAt        DateTime @default(now())
}

model PlaceInsight {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  placeId    String   @db.ObjectId
  place      Place    @relation(fields: [placeId], references: [id], onDelete: Cascade)
  language   String
  source     String   @default("wikipedia")
  title      String?
  summary    String
  imageUrl   String?
  sourceUrl  String?
  fetchedAt  DateTime @default(now())

  @@unique([placeId, language, source])
}

model Photo {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  url       String
  caption   String?
  isCover   Boolean  @default(false)
  placeId   String?  @db.ObjectId
  place     Place?   @relation(fields: [placeId], references: [id], onDelete: Cascade)
  takenAt   DateTime?
  createdAt DateTime @default(now())
}

model Activity {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  placeId     String   @db.ObjectId
  place       Place    @relation(fields: [placeId], references: [id], onDelete: Cascade)
  title       String
  description String?
  price       Float    @default(0)
  currency    String   @default("INR")
  priority    String   @default("nice-to-have")
  durationMin Int?
  bookingUrl  String?
  status      String   @default("planned")
  scheduledAt DateTime?            // for timeline placement
}

model Expense {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  tripId       String   @db.ObjectId
  trip         Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  placeId      String?  @db.ObjectId
  place        Place?   @relation(fields: [placeId], references: [id])
  amount       Float
  currency     String
  amountInBase Float
  category     String
  paidById     String?  @db.ObjectId
  splits       ExpenseSplit[]
  note         String?
  receiptUrl   String?
  date         DateTime
  createdAt    DateTime @default(now())
}

model ExpenseSplit {
  id        String  @id @default(auto()) @map("_id") @db.ObjectId
  expenseId String  @db.ObjectId
  expense   Expense @relation(fields: [expenseId], references: [id], onDelete: Cascade)
  memberId  String  @db.ObjectId
  share     Float
}

model Stay {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  tripId     String   @db.ObjectId
  trip       Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  name       String
  type       String
  address    String
  latitude   Float?
  longitude  Float?
  checkIn    DateTime
  checkOut   DateTime
  cost       Float    @default(0)
  bookingRef String?
  bookingUrl String?
  contact    String?
  notes      String?
}

model Meal {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  tripId        String   @db.ObjectId
  trip          Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  placeId       String?  @db.ObjectId
  name          String
  cuisine       String?
  mealType      String   // breakfast | lunch | dinner | snack — used by timeline
  date          DateTime
  estimatedCost Float    @default(0)
  mustTryDishes String[]
  dietaryNotes  String?
  isVisited     Boolean  @default(false)
  rating        Int?
  review        String?
}

model PackingItem {
  id         String  @id @default(auto()) @map("_id") @db.ObjectId
  tripId     String  @db.ObjectId
  trip       Trip    @relation(fields: [tripId], references: [id], onDelete: Cascade)
  name       String
  category   String
  quantity   Int     @default(1)
  isPacked   Boolean @default(false)
  assignedTo String? @db.ObjectId
}

model Reminder {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  tripId         String   @db.ObjectId
  trip           Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  title          String
  description    String?
  dateTime       DateTime
  recurring      String   @default("none")
  priority       String   @default("medium")
  isDone         Boolean  @default(false)
  pushSubscriptionId String?       // for web-push delivery; null = in-app only
}
```

---

## 7. Pacing Rules — How Cursor + Claude Should Behave

These rules apply to **every single response**:

1. **One day at a time.** Never dump multiple days in a single response.
2. **Inside a day, follow this order:**
   - Create the relevant **learning doc(s)** first with WHAT/WHY/HOW filled in
   - Pause: "Read the learning doc. Any questions before we start coding?"
   - Wait for confirmation
   - Create the **task doc** with plan + acceptance criteria
   - Pause: "Plan look good? Approve to proceed."
   - Implement code, updating the task doc as you go
   - At the end, fill in the task doc's "How I Tested It" and "Code Highlights" sections
   - Update `docs/README.md` master index
   - **Write the matching `plans/<commit-name>.md` file** — every commit gets one
   - End-of-day: mini-quiz + preview of next day
3. **When I hit an error:**
   - Create a **bug doc immediately** with What Happened + Trying To Do filled
   - Walk me through debugging steps — don't just hand me the fix
   - Once resolved, fill in Root Cause + Solution + How to Avoid
   - Update master index
4. **WHAT/WHY/HOW for everything.** No skipping.
5. **Anchor new mental models** to React/Next.js when there's a parallel.
6. **Call out gotchas explicitly** — especially around RSC vs client component, hydration, env-var prefixes, server-only imports.
7. **Mini-quiz at end of every day** — 3–5 questions.

---

## 8. Definition of Done (every feature)

- [ ] Works at desktop and mobile breakpoints
- [ ] TypeScript-strict, no `any`
- [ ] Zod-validated forms with friendly errors
- [ ] Loading + error + empty states handled (`loading.tsx`/`error.tsx` where it makes sense)
- [ ] Theme-aware (light + dark)
- [ ] Localized (no hardcoded English)
- [ ] Keyboard-navigable, semantic HTML, ARIA where needed
- [ ] Tested manually in Chrome and Safari (and Firefox if you're feeling thorough)
- [ ] **Plan doc completed at `plans/<commit-name>.md` and committed atomically with the change**
- [ ] **Task doc completed and linked from master index**
- [ ] **Any bugs encountered have bug docs**
- [ ] **All concepts used have learning docs**

---

## 9. Day 1 Kickoff — Your First Job

When I say **"Day 1, go"**, do these in order:

### Step 1 — Initialize
- Confirm the tech stack
- Ask any clarifying questions you have
- Wait for my green light

### Step 2 — Scaffold the docs folder FIRST
- Confirm `/docs` folder structure exists (or create it)
- Confirm `docs/README.md` master index exists (or create it, with link to FUTURE_SCOPE.md)
- Note that `FUTURE_SCOPE.md` already exists at the project root
- Create the first learning doc: `docs/learning/day1_setup.md`
- Create the second learning doc: `docs/learning/day1_installation.md`
- Pause: let me read the docs and ask questions

### Step 3 — Then the project
- Create the task doc: `docs/task/01_project_scaffolding.md`
- Walk me through the project state (Next.js already scaffolded in `Infra_02`) — explain what each config file does
- Confirm `pnpm dev` works and `localhost:3000` + `localhost:3000/api/health` both respond
- Update master index

### Step 4 — End of Day 1
- Create `docs/learning/day1_first_page.md` summarizing what landed
- Mini-quiz
- Preview Day 2

### Commit conventions

Always follow [`docs/COMMIT_CONVENTION.md`](./docs/COMMIT_CONVENTION.md):

- **Format:** `<Category>_NN_Descriptive_name`
- **Categories:** `Infra`, `Day`, `Feat`, `Fix`, `Docs`
- **NN:** zero-padded two-digit, monotonic per category (`01`, `02`, …, `10`, `11`)
- **Plan file:** every commit ships with a matching `plans/<commit-name>.md` written **first** and committed atomically with the change

At the end of every task, propose a commit message using this convention BEFORE running `git commit`. Wait for my approval. If I approve, run the commit. If I want changes, revise and re-propose.

---

## 10. Ground Rules I Want You to Honor

- ✅ Never assume I know something specific to the App Router — explain it
- ✅ Always create docs (plan + learning + task) before/during work, never after as an afterthought
- ✅ When you make a tech choice, document the **alternatives you considered** and why you rejected them
- ✅ When I make a mistake or seem confused, slow down and re-explain
- ✅ Label browser-specific quirks clearly (📘 Chrome / 🔵 Firefox / 🟢 Safari) when relevant
- ✅ Call out the runtime explicitly when it matters (Server Component / Client Component / Server Action / Edge Route Handler / Node Route Handler)
- ❌ Never write code without a task doc backing it
- ❌ Never let me proceed past a concept I haven't confirmed I understand
- ❌ Never solve a bug silently — always create the bug doc
- ❌ Never commit without writing the matching plan file first

---

**Ready when I am. Wait for me to say "Day 1, go."**
