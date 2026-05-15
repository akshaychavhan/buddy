# Day_15_Add_prisma_in_nextjs_learning_doc

## Goal

Open the **Auth Detour** with the most fundamental piece of plumbing: how `PrismaClient` gets wired into a Next.js project without leaking database connections during Fast Refresh. This commit also **adds a new "📊 Auth Detour — Live Coverage Checklist"** section to `docs/README.md` — the running scorecard for the detour, mirroring the (now-frozen) Day 2 checklist. Every detour commit going forward updates this checklist.

Pure docs commit — no app code, no `lib/`, no `prisma generate` run. `Day_18` builds the actual singleton.

## Summary

**Files at a glance**

| Group     | Files                                                          |
| --------- | -------------------------------------------------------------- |
| Plan doc  | `plans/Day_15_Add_prisma_in_nextjs_learning_doc.md`            |
| Learning  | `docs/learning/day6_prisma_in_nextjs.md`                       |
| Index     | `docs/README.md` (Learning Journal + new Auth Detour checklist) |

**What you'll run / what you'll see**

| Command                                                  | What it does                                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Open `docs/learning/day6_prisma_in_nextjs.md`            | ~320 lines: the global-singleton pattern explained line-by-line, why Fast Refresh leaks connections without it, the server-only boundary, 8 gotchas, 5-question quiz. |
| Open `docs/README.md`                                    | New section **"📊 Auth Detour — Live Coverage Checklist"** appears below the Day 2 checklist. 1 concept covered (this commit), ~24 concepts pending across the detour. |
| Open `docs/README.md` Learning Journal                   | Phase 2 → Day 6 subsection now exists with this doc listed. (Pulled forward from Day 6 proper.) |

> Pure docs commit. The first code change of the auth detour lands in `Day_17` (manual Atlas provisioning) or `Day_18` (the singleton file).

## Commands

```bash
# Nothing to run. Reading the doc IS the work.
# Optional sanity check:
pnpm typecheck && pnpm lint
```

## Files changed

- `plans/Day_15_Add_prisma_in_nextjs_learning_doc.md` — **created**: this file.
- `docs/learning/day6_prisma_in_nextjs.md` — **created**: ~320-line learning doc following PROMPT.md §2.1. Sections:
  - **What/Why**: `PrismaClient` is generated from schema; Fast Refresh leaks connections without the singleton.
  - **How It Works**: line-by-line tour of the singleton pattern (`globalForPrisma` typed view of `globalThis`, the `??` reuse rule, the `NODE_ENV !== "production"` guard).
  - **Server-only constraint**: never import into `"use client"` files; mention `server-only` package as an optional guard.
  - **Where Prisma lives** in the app router (table of files that will import the singleton during the detour).
  - **Tiny Isolated Example**: the singleton itself + a one-page Server Component using it.
  - **Applied to Buddies**: per-detour-commit Prisma usage table.
  - **Gotchas**: 8 items including `new PrismaClient` should appear exactly once in repo, regenerate after schema edits, MongoDB pushes not migrates, CLI vs runtime distinction.
  - **Quiz**: 5 questions with `<details>` answers.
- `docs/README.md` — **edited** twice:
  1. **Learning Journal:** adds a new **"Phase 2 — Core App Plumbing"** Day 6 subsection (currently empty per current state of file) and lists `day6_prisma_in_nextjs.md`. Note the doc is filed under Day 6 even though it ships during the detour — keeps the long-term index honest.
  2. **New Section added**: **"📊 Auth Detour — Live Coverage Checklist"** inserted between the Day 2 checklist (frozen) and the Learning Journal. Initial state: 1 covered (PrismaClient singleton pattern — `Day_15`), 24 pending across the rest of the detour. Same format as the Day 2 checklist: concept rows tagged with commit number. Eventually frozen at `Day_36`.

## Verification

1. Open `docs/learning/day6_prisma_in_nextjs.md` — title is "Prisma in Next.js: The Global-Singleton Pattern", contains the line-by-line singleton walkthrough, the Tiny Isolated Example (lib/prisma.ts + a Server Component usage), 8 gotchas, 5 quiz items in `<details>` blocks.
2. Open `docs/README.md` — under **Phase 2 → Day 6** in Learning Journal there is now **one** entry: `day6_prisma_in_nextjs.md`.
3. Open `docs/README.md` — **new "📊 Auth Detour — Live Coverage Checklist"** section exists between the Day 2 checklist and the Learning Journal. Has subsections `Concepts covered ✅` (1 row), `Concepts pending ⏳` (24 rows tagged with commit numbers Day_16 through Day_35), and `Notes` (1 line explaining the detour pulls forward Day 6 partial + Day 7 + Day 11 magic-link slice).
4. Progress tracker Day 2 row is **unchanged** — still 🔄 In progress at 11 of 12. (The close-out is now `Day_36`, not `Day_15`.)
5. `git log --oneline -2` — top two commits are `Day_15_Add_prisma_in_nextjs_learning_doc` and `Day_14_Add_per_page_metadata_exports`.
6. `ls docs/learning/day6_*.md` — exactly one file.
7. `pnpm typecheck && pnpm lint` — both pass (no code change, but cheap to confirm).

## Gotchas / decisions

- **`Day_15` is no longer Day 2's close-out.** That was the original plan. The auth detour displaces it; `Day_36` becomes the close-out, flipping Day 2 + partial Day 6 + Day 7 tracker rows together.
- **The learning doc is filed under Day 6, not Day 7.** Reason: `PrismaClient` and the singleton are Day 6 territory per PROMPT.md — pulling them forward into the auth detour doesn't change which day they conceptually belong to. The Learning Journal stays honest.
- **`docs/README.md` gets a *new section*, not an edited one.** The Day 2 checklist is frozen at "22 covered, 0 pending, 3 deferred" and stays that way. The Auth Detour checklist is its own section because mixing them would muddy the "what does my brain hold right now?" snapshot.
- **Initial pending count of 24 in the new checklist:** rough estimate — final count will settle as commits land. The exact concept list:
  - 22 commits × roughly 1–2 concepts each = ~30 concept rows total
  - 1 ticked in this commit (singleton pattern)
  - rest pending
  - "Deferred to later days" sub-section: full Trip CRUD (Day 6 proper), broader Resend usage (Day 11 proper), GitHub OAuth + other providers, edge-runtime middleware
- **No code change in this commit.** Same convention as Day_04/Day_05/Day_09/Day_13: doc-first means a *learning* commit that doesn't touch app code. The reader meets the concept before the code lands.
- **No tracker row flip for Day 6 or Day 7.** Day 6 / Day 7 stay ⏸️ Not started until `Day_36`'s close-out (Day 6 → "partial", Day 7 → ✅). Touching them earlier would mean rewriting in `Day_36` anyway.
- **Why this commit also seeds the Auth Detour checklist** instead of a separate commit: bootstrapping the checklist takes 5 lines of Markdown — splitting it into its own commit would be ceremony without payoff. Day_04 did the same with the Day 2 checklist (well — actually Day_08 seeded the Day 2 one). The rule is "first commit of a new tracking effort seeds the checklist."

## After this commit

- **`Day_16`** — next learning doc: MongoDB-with-Prisma quirks (`ObjectId`, `@map("_id")`, why no migrations).
- **`Day_17`** — first infra commit; manual Atlas provisioning walked through in the plan file.
- **`Day_18`** — first code commit; `lib/prisma.ts` ships, `package.json` gets `"db:push"` script.
