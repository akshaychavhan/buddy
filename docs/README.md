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

### Concepts pending ⏳

- [ ] **Metadata API**: static `export const metadata` vs dynamic `generateMetadata` — `Day_13` (doc) + `Day_14` (code)
- [ ] **`title.template`** for composed page titles like "Trips · Buddies" — `Day_14`
- [ ] **OpenGraph metadata** per page — `Day_14`

### Deferred to later days

- [ ] Real header styling with design tokens — Day 3
- [ ] Localized strings — Day 5
- [ ] Real sign-in form with Better Auth — Day 7

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

_(empty)_

### Phase 3 — Auth & Backend Wiring

_(empty)_

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
| 1     | Day 2 — App Router & RSC Mental Model        | 🔄 In progress | 10 of 12 commits: full doc set + route groups + nav + loading + error + Client island done; metadata code + close-out pending |
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
