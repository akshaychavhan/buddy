# Day_27_Add_session_in_server_actions_learning_doc

## Goal

**Opens the close of Phase C.** Doc-first explanation of `auth.api.getSession({ headers: await headers() })` — the one-line server-side session read. Covers what it returns (`{ user, session } | null`), where it can be called (Server Components, Server Actions, route handlers — never Client Components), and the JSX-branching pattern that `Day_28` will ship to make the `(app)` header show "Sign out" when authenticated and "Sign in" otherwise. Also previews the sign-out action (one line, deletes the Session row + clears the cookie).

Pure docs commit. The header edit + sign-out action land in `Day_28`.

## Summary

**Files at a glance**

| Group     | Files                                                             |
| --------- | ----------------------------------------------------------------- |
| Plan doc  | `plans/Day_27_Add_session_in_server_actions_learning_doc.md`      |
| Learning  | `docs/learning/day7_session_in_server_actions.md`                 |
| Index     | `docs/README.md` (Learning Journal + Auth Detour checklist row)   |

**What you'll run / what you'll see**

| Command                                                            | What it does                                                                                |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Open `docs/learning/day7_session_in_server_actions.md`             | ~400 lines: how the cookie+DB lookup works under the hood, exact `{ user, session }` shape, four contexts where `getSession` can be called, the 3-line header pattern Day_28 will ship, why we skip the client-side `useSession()` hook, the one-line sign-out action, 8 gotchas, 5-question quiz. |
| Open `docs/README.md` Learning Journal                             | Phase 3 → Day 7 now lists **four** docs (overview, install, email/password, session). |
| Open `docs/README.md` Auth Detour Checklist                        | "Session reads in Server Actions / Server Components" row flips from pending → covered. Covered: 12 → 13; pending: 9 → 8. |

> Pure docs commit. Code applying it lands in `Day_28`.

## Commands

```bash
# Nothing to run. Reading the doc IS the work.
# Optional sanity check:
pnpm typecheck && pnpm lint
```

## Files changed

- `plans/Day_27_Add_session_in_server_actions_learning_doc.md` — **created**: this file.
- `docs/learning/day7_session_in_server_actions.md` — **created**: ~400-line learning doc following PROMPT.md §2.1. Sections:
  - **What/Why**: replaces the Pages-Router `useSession()` client-fetch pattern with a server-side read; no flicker, zero JS for branching.
  - **How It Works**: cookie → DB lookup chain (5 steps Better Auth runs under the hood); the exact return shape with every field on `user` and `session` documented; table of four caller contexts (Server Component / Server Action / route handler / middleware — with middleware noted as Edge-runtime-only, deferred to Day_29's discussion); the 3-line header pattern Day_28 will ship; one-line sign-out action; why we skip the client SDK (extra round-trip + flicker).
  - **Tiny Isolated Example**: a 15-line `/me` page that redirects to `/sign-in` if no session, otherwise shows name + email + expiry. Shows the whole pattern in one screen.
  - **Applied to Buddies**: per-commit table for `Day_28` (sign-out action + header edit).
  - **Gotchas**: 8 items — always `await headers()`; never call from Client Component; `null` not `undefined`; perf (one call per render is fine, ten is wasteful, `cache()` if needed); `image` is null for credential users; don't store session in a global (security bug); middleware needs edge-compatible session validator; `session.session.expiresAt` vs `session.user.createdAt` confusion.
  - **Quiz**: 5 questions with `<details>` answers covering the return shape, Client-Component restriction, request-scoped caching, redirect-in-layout decision, what sign-out does in DB+cookie.
- `docs/README.md` — **edited** twice:
  1. **Learning Journal:** adds `day7_session_in_server_actions.md` link under Phase 3 → Day 7 (after the email/password doc).
  2. **Auth Detour Checklist:** flips "Session reads in Server Actions / Server Components" row from pending → covered, tagged `Day_27`. Covered: 12 → 13; pending: 9 → 8.

## Verification

1. Open `docs/learning/day7_session_in_server_actions.md` — title is "Reading the Session: `auth.api.getSession` in Server Components and Actions", contains the 5-step cookie→DB chain, the full return shape comment block, the 4-context caller table, the 3-line header pattern, the 15-line `/me` example, 8 gotchas, 5 quiz items in `<details>` blocks.
2. Open `docs/README.md` — under **Phase 3 → Day 7** in Learning Journal there are now **four** entries: overview, install, email/password, session reads.
3. Open `docs/README.md` — Auth Detour Checklist shows "Session reads in Server Actions / Server Components" under **Concepts covered ✅** with `Day_27` tag. Covered: **13**, pending: **8**.
4. Run `git log --oneline -2` — top two commits are `Day_27_Add_session_in_server_actions_learning_doc` and `Day_26_Replace_sign_in_stub_with_real_form`.
5. Run `ls docs/learning/day7_*.md` — exactly four files.
6. `pnpm typecheck && pnpm lint` — both pass.

## Gotchas / decisions

- **No code change in this commit.** Same convention as Day_19/Day_20/Day_24: doc-first. The code that applies this lands in `Day_28`.
- **The doc commits to the layout-guard approach** for the upcoming Day_30 route-protection work. The doc surfaces this preference inline (middleware = Edge runtime = no Prisma = wrong tool for our setup), even though the actual route-protection doc is `Day_29`. Mentioning the conclusion early means `Day_29`'s doc can focus on *why* rather than introducing the decision fresh.
- **No `cache()` example as a working pattern.** Mentioned in the perf gotcha but not built into the example. `cache()` is a React 18.3+ feature; we *could* wrap `getSession` in it now, but doing so prematurely would obscure the simpler "one DB call per request is fine" baseline. If Day_28's header layout starts pulling session in multiple places, that's when `cache()` gets a follow-up doc.
- **No mention of the client SDK (`createAuthClient`).** Touched briefly in the "Why no `useSession()` hook" section. We're deferring the client SDK until we have a concrete reason to need reactive client-side session state (multi-tab signed-out indicator, etc.). For now: server-side reads cover everything.
- **The sign-out action preview** in this doc is the *exact* code Day_28 will ship — verbatim. Reading the doc means seeing the code before the diff lands.
- **No new task/ doc.** PROMPT.md's Day 7 spec lists `12_protected_app_routes.md` as a task doc, but that's Day_29/Day_30 territory. This commit doesn't open a task doc.
- **Forward-reference to `Day_30`'s redirect.** The doc explicitly says "this is about *reading*, not *gating*; gating is `Day_30`." That separation matters — Day_27's pattern is reusable in *any* layout regardless of whether you redirect.
- **Tracker note unchanged.** Day 2 row stays at "11 of 12 commits"; detour progress lives in the Auth Detour checklist.
