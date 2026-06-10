# 📚 Buddies — Documentation Index

> **Living document.** Auto-updated as new docs are added throughout the project.

This is the master index of all project documentation. Three categories:

- **📘 Learning** — concept lessons (one per topic, multiple per day allowed)
- **🐛 Bug** — bug journal (every error encountered + how it was solved)
- **📋 Task** — feature/task documentation (every feature built)

For per-commit walkthroughs, see [`../plans/`](../plans/) — every commit ships with a beginner-friendly note.
For the V2 features playbook, see [`../FUTURE_SCOPE.md`](../FUTURE_SCOPE.md).
For the build & learning prompt for AI assistants, see [`../PROMPT.md`](../PROMPT.md).
For the commit + plan-file convention, see [`./COMMIT_CONVENTION.md`](./COMMIT_CONVENTION.md).

---

## 📊 Day 2 — Live Coverage Checklist

> Concepts covered vs pending. Updated as each commit lands. Reading this is the shortest way to know "what does my brain hold now?" without scanning git log. Each row is tagged with the commit number that covers it — `git checkout Day_NN` to revisit.

### Concepts covered ✅

- [x] **Server vs Client Components** — `"use client"` opts a file (and everything it imports) into the client bundle. Server is the default. — `Day_04`
- [x] **The boundary is the file**, not the component — `Day_04`
- [x] **What can cross the server→client boundary** — serializable props yes; functions no — `Day_04`
- [x] **Folder = URL segment**; `page.tsx` makes it real — `Day_05`
- [x] **`layout.tsx` wraps everything below it** and persists across navigation — `Day_05`
- [x] **Route groups `(name)`** organize layouts without adding a URL segment — `Day_05`
- [x] **`layout.tsx` vs `template.tsx`** — persistent vs re-mounting — `Day_05`
- [x] **`(app)` route group exists**, home page moved into it — `Day_06`
- [x] **`git mv` for atomic page rename** — preserves file history — `Day_06`
- [x] **`(auth)` route group exists** with a *different* shell — `Day_07`
- [x] **Two visibly different layouts from one URL tree** (`/` and `/sign-in`) — `Day_07`
- [x] **`<Link>` for client-side navigation** — typed routes, no full reload — `Day_08`
- [x] **Nested page has a real `<Link>` destination** (`/trips`) — `Day_08`
- [x] **`loading.tsx` as an automatic Suspense boundary** + streaming — `Day_09` (doc) + `Day_10` (code)
- [x] **`error.tsx` is a Client Component** (required by Next.js) — `Day_09` (doc) + `Day_11` (code)
- [x] **`reset()` on error boundaries** — `Day_11`
- [x] **`searchParams` as page-level input** (used for `?boom=1` trigger) — `Day_11`
- [x] **First Client Component island** inside a Server Component layout — `Day_12`
- [x] **`pnpm build` bundle inspection** — Client Components in their own chunk — `Day_12`
- [x] **Metadata API**: static `export const metadata` vs dynamic `generateMetadata` — `Day_13` (doc) + `Day_14` (code)
- [x] **`title.template`** for composed page titles like "Trips · Buddies" — `Day_14`
- [x] **OpenGraph metadata** per page — `Day_14`

### Concepts pending ⏳

_(none — all 22 Day 2 concepts covered. Close-out deferred to `Day_36` after the Auth Detour finishes.)_

### Deferred to later days

- [ ] Real header styling with design tokens — Day 3
- [ ] Localized strings — Day 5
- [ ] Real sign-in form with Better Auth — Day 7 (in progress via Auth Detour, see below)

---

## 📊 Auth Detour — Live Coverage Checklist

> Mid-Day-2 detour: building **full production auth** (Better Auth + Prisma + MongoDB Atlas + email/password + magic-link via Resend + Google OAuth) before closing Day 2. Pulls forward parts of Day 6 (Prisma), all of Day 7 (Better Auth), and a slice of Day 11 (Resend, just the magic-link wrapper). Runs `Day_15` → `Day_36`. Each row tagged with the commit number that covers it.

### Concepts covered ✅

- [x] **`PrismaClient` global-singleton pattern** — Fast Refresh leaks connections without it; one instance per process — `Day_15`
- [x] **MongoDB-with-Prisma quirks** — `ObjectId`, `@map("_id")`, no migrations — `Day_16`
- [x] **MongoDB Atlas provisioning** — manual cluster setup + `DATABASE_URL` in `.env.local` — `Day_17`
- [x] **`lib/prisma.ts` singleton file** ships + `"db:push"` script — `Day_18`
- [x] **Better Auth overview** — what it is, why over Clerk/NextAuth — `Day_19`
- [x] **Better Auth install + adapter** — Prisma adapter, schema-generation flow — `Day_20`
- [x] **`better-auth` package installed**, `BETTER_AUTH_SECRET` generated, OAuth env vars scaffolded — `Day_21`
- [x] **`lib/auth.ts` Better Auth server config** + User/Session/Account/Verification models in schema — `Day_22`
- [x] **`app/api/auth/[...all]/route.ts`** catch-all route handler — `Day_23`
- [x] **Email/password Server Action flow** — form data → Better Auth → cookie → redirect — `Day_24` (doc) + `Day_26` (code)
- [x] **Sign-up page + Server Action** — `app/(auth)/sign-up/page.tsx` — `Day_25`
- [x] **Real sign-in form** — replaces the Day_07 stub — `Day_26`
- [x] **Session reads in Server Actions / Server Components** — how `auth.api.getSession(...)` works — `Day_27`
- [x] **Sign-out action** + header shows session state — `Day_28`
- [x] **Protected pages: middleware vs layout guard** — trade-offs — `Day_29` (doc) + `Day_30` (code)
- [x] **`(app)` layout reads session, redirects if absent** — `Day_30`
- [x] **Magic-link via Resend** — `lib/email.ts` wrapper, Better Auth magic-link plugin — `Day_31` (doc) + `Day_32` (code)
- [x] **OAuth callback URLs** — why `BETTER_AUTH_URL` must match Google Console — `Day_33`
- [x] **Google Cloud Console OAuth app registered** + env vars set — `Day_34`

### Concepts pending ⏳

- [ ] **Google provider enabled + "Sign in with Google" button** — three auth methods coexist — `Day_35`
- [ ] **Auth Detour close-out** — Day 2 → ✅, Day 6 → partial, Day 7 → ✅; checklist frozen — `Day_36`

### Deferred to later days

- [ ] Full Trip CRUD with user-scoping — Day 6 proper / Day 7's `13_trips_crud_user_scoped.md`
- [ ] Broader Resend usage (trip invitations, reminders) — Day 11
- [ ] GitHub OAuth + other providers — future extension
- [ ] Edge-runtime `middleware.ts` for route protection — future revisit (we use layout-guard for now)

---

## 📘 Learning Journal

> Concept lessons documented as I learn each topic. Format: WHAT / WHY / HOW + tiny example + gotchas + mini-quiz.

### Phase 1 — Foundations

**Day 1 — Setup & Mental Model Shift**
- [Day 1 — Project Setup: Why Next.js (App Router)](./learning/day1_setup.md)
- [Day 1 — Installation: Tooling Checklist](./learning/day1_installation.md)
- [Day 1 — First Page Walkthrough: `app/page.tsx` + `app/api/health/route.ts`](./learning/day1_first_page.md)

**Day 2 — App Router & RSC Mental Model**
- [Day 2 — Server Components vs Client Components: The Boundary Rule](./learning/day2_rsc_vs_client_components.md)
- [Day 2 — Layouts, Templates, and Route Groups](./learning/day2_layouts_and_templates.md)
- [Day 2 — `loading.tsx` and `error.tsx`: Free Boundaries Per Segment](./learning/day2_loading_and_error_files.md)
- [Day 2 — The Metadata API: Per-Page Titles, OpenGraph, and Friends](./learning/day2_metadata_api.md)

### Phase 2 — Core App Plumbing

**Day 6 — Prisma + MongoDB** _(pulled forward by Auth Detour)_
- [Day 6 — Prisma in Next.js: The Global-Singleton Pattern](./learning/day6_prisma_in_nextjs.md)
- [Day 6 — MongoDB with Prisma: ObjectIds, `@map("_id")`, and No Migrations](./learning/day6_mongodb_with_prisma.md)

### Phase 3 — Auth & Backend Wiring

**Day 7 — Better Auth** _(pulled forward by Auth Detour)_
- [Day 7 — Better Auth Overview: What It Is and Why We Picked It](./learning/day7_better_auth_overview.md)
- [Day 7 — Better Auth Install: Package, Adapter, Schema-Generation Flow](./learning/day7_better_auth_install.md)
- [Day 7 — Email/Password Sign-Up & Sign-In: The Server Action Flow](./learning/day7_email_password_flow.md)
- [Day 7 — Reading the Session: `auth.api.getSession` in Server Components and Actions](./learning/day7_session_in_server_actions.md)
- [Day 7 — Protecting Pages: Middleware vs Layout-Guard](./learning/day7_protecting_pages.md)
- [Day 7 — Resend for Magic-Link Sign-In](./learning/day7_resend_for_magic_link.md)
- [Day 7 — OAuth Extension: Sign In with Google](./learning/day7_oauth_extension.md)

### Phase 4 — Web-Native Features

_(empty)_

### Phase 5 — Feature Buildout

_(empty)_

### Phase 6 — Future-Proofing

_(empty)_

---

## 🐛 Bug Journal

> Every bug encountered along the way. Format: What happened / Steps to reproduce / Root cause / Solution / How to avoid.

- [Bug 01 — `pnpm dev` fails: requires Node 18.12+, system Node is 16.20](./bug/01_pnpm_node_version_mismatch.md) — 🔴 Critical, ✅ Resolved. Root cause: `$PATH` ordering put system Node 16 ahead of nvm's Node 20. Fix: `nvm use` in the repo root.

---

## 📋 Task Journal

> Every feature/task built. Format: Goal / User story / Acceptance criteria / Tech decisions / Implementation plan / Files changed.

### Phase 1 — Foundations
- [Task 01 — Project Scaffolding](./task/01_project_scaffolding.md) — guided tour of the Next.js + Tailwind + Prisma scaffold built in `Infra_02`; verifies `pnpm dev` runs locally
- [Task 02 — App Shell](./task/02_app_shell.md) — 📝 Planning. Route groups `(app)`/`(auth)`, nested layouts, `loading.tsx`, `error.tsx`, first Client Component island. Day 2 scope.

---

## 🔮 Future Scope

For V2 features and beyond, see [`FUTURE_SCOPE.md`](../FUTURE_SCOPE.md):
- Quick-Add Expense via Camera (OCR)
- Smart Packing Suggestions
- Receipts + Documents Vault
- Buddy Network
- Trip Invitation with Roles (Full RBAC)

---

## 📊 Progress Tracker

| Phase | Day                                          | Status         | Notes                                            |
| ----- | -------------------------------------------- | -------------- | ------------------------------------------------ |
| 1     | Day 1 — Setup & Mental Model Shift           | ✅ Completed   | 3 learning docs + Task 01 + Bug 01 resolved; `pnpm dev` verified on local |
| 1     | Day 2 — App Router & RSC Mental Model        | 🔄 In progress | 11 of 12 commits: all concepts shipped + verified; close-out commit Day_15 next |
| 1     | Day 3 — Tailwind, Tokens, Theme System       | ⏸️ Not started |                                                  |
| 2     | Day 4 — Forms, Server Actions, Trip Categorization | ⏸️ Not started |                                          |
| 2     | Day 5 — i18n, Empty States, UX Polish        | ⏸️ Not started |                                                  |
| 2     | Day 6 — Prisma + MongoDB                     | ⏸️ Not started |                                                  |
| 3     | Day 7 — Better Auth                          | ⏸️ Not started |                                                  |
| 4     | Day 8 — Image Uploads with Cloudinary        | ⏸️ Not started |                                                  |
| 4     | Day 9 — Maps & Wikipedia Place Insights      | ⏸️ Not started |                                                  |
| 4     | Day 10 — Reminders + Web Push                | ⏸️ Not started |                                                  |
| 5     | Day 11 — Money + Email Invitations (Resend)  | ⏸️ Not started |                                                  |
| 5     | Day 12 — Logistics & Music                   | ⏸️ Not started |                                                  |
| 5     | Day 13 — Itinerary Timeline                  | ⏸️ Not started |                                                  |
| 5     | Day 14 — PWA + Offline-Friendly Reads        | ⏸️ Not started |                                                  |
| 6     | Day 15 — V2 Scaffolding                      | ⏸️ Not started |                                                  |

**Status legend:** ⏸️ Not started · 🔄 In progress · ✅ Completed · ⛔ Blocked
