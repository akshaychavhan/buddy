# Day_19_Add_better_auth_overview_learning_doc

## Goal

Opens **Phase B** of the Auth Detour with the foundational question: *why are we using Better Auth at all?* This doc-first commit covers what Better Auth is, sketches its three-layer architecture (Browser → Next.js route handler → Prisma+MongoDB), explains database-backed sessions vs JWTs, and compares Better Auth honestly against the other 2026 options (Clerk, NextAuth/Auth.js, Lucia, Supabase Auth, custom-rolled). The reader finishes with a clear "we picked Better Auth because X, and if X stops being true we'd revisit" rationale.

Pure docs commit. The actual `pnpm add better-auth` lands in `Day_21`; the config file in `Day_22`.

## Summary

**Files at a glance**

| Group     | Files                                                          |
| --------- | -------------------------------------------------------------- |
| Plan doc  | `plans/Day_19_Add_better_auth_overview_learning_doc.md`        |
| Learning  | `docs/learning/day7_better_auth_overview.md`                   |
| Index     | `docs/README.md` (Learning Journal + Auth Detour checklist)    |

**What you'll run / what you'll see**

| Command                                                  | What it does                                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Open `docs/learning/day7_better_auth_overview.md`        | ~430 lines: what Better Auth is, three-layer architecture diagram, how sessions work (DB-backed cookie + token), plugin model, full comparison vs Clerk/NextAuth/Lucia/Supabase/custom-rolled, file-by-file impact on Buddies, 8 gotchas, 5-question quiz. |
| Open `docs/README.md` Learning Journal                   | New "Phase 3 — Auth & Backend Wiring" Day 7 subsection now exists with this doc listed. |
| Open `docs/README.md` Auth Detour Checklist              | "Better Auth overview" row flips from pending → covered. Covered: 4 → 5; pending: 18 → 17. |

> Pure docs commit. Phase B kicks off with the *why* before the *how*.

## Commands

```bash
# Nothing to run. Reading the doc IS the work.
# Optional sanity check:
pnpm typecheck && pnpm lint
```

## Files changed

- `plans/Day_19_Add_better_auth_overview_learning_doc.md` — **created**: this file.
- `docs/learning/day7_better_auth_overview.md` — **created**: ~430-line learning doc following PROMPT.md §2.1. Sections:
  - **What/Why**: auth-library choice is "which one?" not "should we?"; cost of building auth wrong.
  - **How It Works**: Better Auth runs in your Node process, stores users via Prisma adapter; three-file API surface (config, route handler, server actions); ASCII three-layer architecture diagram (browser → Next.js → Prisma+Mongo); database-backed sessions explained (httpOnly cookie + DB lookup, not JWT); plugin model (email/password core, OAuth/magic-link/2FA/passkey/orgs as plugins); type safety story (types generated from config).
  - **Comparison to Alternatives**: explicit honest tables for Clerk (lock-in, cost), NextAuth/Auth.js (TS verbosity, config-heavy), Lucia (deprecated by author in 2025), Supabase Auth (forces Postgres, can't use), custom-rolled (security risk + scope cost). Decision summary at the end.
  - **Applied to Buddies**: 10-file table of where Better Auth shows up across the detour (`lib/auth.ts`, `prisma/schema.prisma` additions, route handler, sign-up/sign-in pages and actions, sign-out action, layout guard, magic-link wrapper).
  - **Gotchas**: 8 items — never import into Client Component; catch-all route required; `BETTER_AUTH_SECRET` critical in prod; `BETTER_AUTH_URL` must match deployment (OAuth callback gotcha); DB-backed session implications; scrypt hashing not bcrypt; types are generated; `getSession` is async.
  - **Quiz**: 5 questions with `<details>` answers — one-line definition, why-not-Clerk, where sessions live, what the catch-all route does, can-import-in-Client-Component.
- `docs/README.md` — **edited** twice:
  1. **Learning Journal:** adds a new **"Phase 3 — Auth & Backend Wiring"** Day 7 subsection (currently empty in the file) with this doc as the first entry.
  2. **Auth Detour Checklist:** flips "Better Auth overview" row from pending → covered, tagged `Day_19`. Covered: 4 → 5; pending: 18 → 17.

## Verification

1. Open `docs/learning/day7_better_auth_overview.md` — title is "Better Auth Overview: What It Is and Why We Picked It", contains the three-layer ASCII architecture diagram, the full comparison tables (Clerk, NextAuth, Lucia, Supabase, custom-rolled), the 10-file impact table for Buddies, 8 gotchas, 5 quiz items in `<details>` blocks.
2. Open `docs/README.md` — under **Phase 3 — Auth & Backend Wiring → Day 7** in Learning Journal there is now **one** entry.
3. Open `docs/README.md` — Auth Detour Checklist shows "Better Auth overview" under **Concepts covered ✅** with `Day_19` tag. Covered: **5**, pending: **17**.
4. Run `git log --oneline -2` — top two commits are `Day_19_Add_better_auth_overview_learning_doc` and `Day_18_Add_prisma_client_singleton`.
5. Run `ls docs/learning/day7_*.md` — exactly one file.
6. `pnpm typecheck && pnpm lint` — both pass.

## Gotchas / decisions

- **Phase 3 — Auth & Backend Wiring** is the right Learning Journal phase, not Phase 2. PROMPT.md groups auth under Phase 3 alongside Better Auth and protected routes. We're pulling Phase 3 forward but the Journal stays organized by long-term phase, not by ship order.
- **Comparison tables are honest, not promotional.** The doc names where Better Auth *loses* to alternatives — smaller community than NextAuth, younger than Clerk, fewer years of war stories. The user is learning to make trade-off decisions, not to memorize "Better Auth is best."
- **No claims about pricing without sources.** Clerk's free-tier ceiling and pricing are publicly documented; the doc cites the "~10k MAU then $25+/month" figure but doesn't pretend to be an up-to-the-minute pricing oracle. If Clerk's tier changes, the comparison still holds qualitatively.
- **The "Why not Lucia?" is "it's deprecated"** — verified against Lucia's author's 2025 announcement. The doc links to the deprecation notice as a reference.
- **Decision rationale is preserved.** "We picked Better Auth because: your DB / your code / TS-first / active maintenance / plugin model matches roadmap" — future-you re-reading this doc in 2027 will know *why* and can revisit if any of those reasons stop being true.
- **No code change in this commit.** Same convention as `Day_05`/`Day_15`/`Day_16`: docs come before code. The actual install lands in `Day_21`, the config in `Day_22`.
- **Tracker notes column unchanged.** Day 2 row still "11 of 12 commits"; flipping that is `Day_36`'s job. Detour progress lives in the Auth Detour checklist.
- **No `task/` doc yet.** PROMPT.md spec lists four task docs for Day 7 (`10_better_auth_server_setup.md`, `11_sign_in_sign_up_pages.md`, `12_protected_app_routes.md`, `13_trips_crud_user_scoped.md`). We'll write task docs as relevant phases land, not upfront. Phase B's task doc (`10_better_auth_server_setup.md`) can land alongside `Day_22` (the first commit that actually sets up Better Auth).
