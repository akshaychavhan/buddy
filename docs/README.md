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

## 📘 Learning Journal

> Concept lessons documented as I learn each topic. Format: WHAT / WHY / HOW + tiny example + gotchas + mini-quiz.

### Phase 1 — Foundations

**Day 1 — Setup & Mental Model Shift**
- [Day 1 — Project Setup: Why Next.js (App Router)](./learning/day1_setup.md)
- [Day 1 — Installation: Tooling Checklist](./learning/day1_installation.md)
- [Day 1 — First Page Walkthrough: `app/page.tsx` + `app/api/health/route.ts`](./learning/day1_first_page.md)

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
| 1     | Day 2 — App Router & RSC Mental Model        | ⏸️ Not started |                                                  |
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
