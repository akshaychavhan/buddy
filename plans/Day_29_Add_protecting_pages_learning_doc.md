# Day_29_Add_protecting_pages_learning_doc

## Goal

**Opens Phase D.** Doc-first explanation of how to **gate** `(app)` routes against logged-out users. Compares the two viable patterns (Edge Middleware vs Layout-Guard), commits to layout-guard for Buddies because Prisma+MongoDB is Node-only and can't run on the Edge, and previews the exact 2-line diff `Day_30` will ship on `app/(app)/layout.tsx`.

Pure docs commit. Code in `Day_30`.

## Summary

**Files at a glance**

| Group     | Files                                                          |
| --------- | -------------------------------------------------------------- |
| Plan doc  | `plans/Day_29_Add_protecting_pages_learning_doc.md`            |
| Learning  | `docs/learning/day7_protecting_pages.md`                       |
| Index     | `docs/README.md` (Learning Journal + Auth Detour checklist row) |

**What you'll run / what you'll see**

| Command                                                       | What it does                                                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Open `docs/learning/day7_protecting_pages.md`                 | ~450 lines: Edge Middleware sketch + its constraints, Layout-Guard sketch + its trade-offs, the 3-reason decision for layout-guard, the `Day_30` patch preview (2 lines added), unprotected-routes story (`/sign-in`, `/sign-up`, `/api/*`), 8 gotchas, 5-question quiz. |
| Open `docs/README.md` Learning Journal                        | Phase 3 → Day 7 now lists **five** docs (overview, install, email/password, session, protecting). |
| Open `docs/README.md` Auth Detour Checklist                   | "Protected pages: middleware vs layout guard" row flips from pending → covered. Covered: 14 → 15; pending: 7 → 6. |

> Pure docs commit. The 2-line layout edit lands in `Day_30`.

## Commands

```bash
# Nothing to run. Reading the doc IS the work.
# Optional sanity check:
pnpm typecheck && pnpm lint
```

## Files changed

- `plans/Day_29_Add_protecting_pages_learning_doc.md` — **created**: this file.
- `docs/learning/day7_protecting_pages.md` — **created**: ~450-line learning doc following PROMPT.md §2.1. Sections:
  - **What/Why**: cosmetic protection (header changes) vs real protection (route gating); two patterns; cost/benefit framing.
  - **How It Works**:
    - **Option A: Edge Middleware** — sketch with `NextResponse.redirect`, what's good (fast, centralized), what's hard (Edge runtime constraints, cookie-presence ≠ validity, matcher loop traps, doesn't compose with route groups).
    - **Option B: Layout-Guard** — sketch with `redirect()`, what's good (Node runtime → Prisma works, composes with route groups, `(auth)` naturally excluded, less to get wrong), what's hard (per-request DB query, slightly slower than Edge for logged-out traffic).
    - **The decision** for Buddies: layout-guard, with 3 reasons spelled out (Prisma forces our hand; composition is the right primitive; honest validation has no second source of truth).
    - **The `Day_30` patch in 2 lines**, with the simplification of the now-dead `<SignOut /> : <SignIn />` ternary.
    - **The unprotected-routes story**: how `(auth)` and `/api/*` are naturally excluded by the file-system rule book.
  - **Tiny Isolated Example**: minimal `(app)/layout.tsx` with 6 lines of guard logic + the 6-step request flow showing what happens to a logged-out request.
  - **Applied to Buddies**: shows the literal diff `Day_30` will ship.
  - **Gotchas**: 8 items — redirect loops, Edge runtime constraints, layout-doesn't-re-render trap, signed-in-on-sign-in (deferred), API routes don't get the guard, prefetch behavior, `redirect()`-throws-NEXT_REDIRECT trap, authentication-vs-authorization distinction.
  - **Quiz**: 5 questions with `<details>` answers — why middleware can't call getSession; which routes get redirected; prefetch behavior; defense-in-depth fallacy; authz-vs-authn concrete example.
- `docs/README.md` — **edited** twice:
  1. **Learning Journal:** adds `day7_protecting_pages.md` link under Phase 3 → Day 7 (after the session-reads doc).
  2. **Auth Detour Checklist:** flips "Protected pages: middleware vs layout guard" row from pending → covered, tagged `Day_29` (doc) + `Day_30` (code). Covered: 14 → 15; pending: 7 → 6.

## Verification

1. Open `docs/learning/day7_protecting_pages.md` — title is "Protecting Pages: Middleware vs Layout-Guard", contains the two-option sketch + decision rationale, the literal `Day_30` patch preview, 8 gotchas, 5 quiz items in `<details>` blocks.
2. Open `docs/README.md` — under **Phase 3 → Day 7** in Learning Journal there are now **five** entries.
3. Open `docs/README.md` — Auth Detour Checklist shows "Protected pages: middleware vs layout guard" under **Concepts covered ✅** with `Day_29 (doc) + Day_30 (code)` tag. Covered: **15**, pending: **6**.
4. Run `git log --oneline -2` — top two commits are `Day_29_Add_protecting_pages_learning_doc` and `Day_28_Add_sign_out_action_and_header_session_state`.
5. Run `ls docs/learning/day7_*.md` — exactly five files.
6. `pnpm typecheck && pnpm lint` — both pass.

## Gotchas / decisions

- **No code change in this commit.** Same convention as Day_19/Day_20/Day_24/Day_27: doc-first.
- **The doc commits to layout-guard explicitly.** Day_27's session-reads doc already mentioned the preference; this commit makes it the *full* decision with reasoning. The two-doc structure (Day_27 = how to read; Day_29 = where to gate) preserves the one-concept-per-commit pacing.
- **No mention of `cache()` for the per-request `getSession`.** The doc notes the per-request DB query as "a real cost if traffic is huge" but doesn't introduce React's `cache()` wrapper — that's a perf optimization deferred to its own commit if it ever matters. Premature for our learning project.
- **The "signed-in user on `/sign-in`" question is named but deferred.** Gotcha #4 calls it out: most apps redirect signed-in users away from sign-in. We don't, currently. The fix (inverse layout-guard on `(auth)/layout.tsx`) is a one-liner if we ever want it.
- **The "authentication vs authorization" distinction is the doc's biggest meta-lesson.** The layout-guard only answers "is *someone* logged in?". Per-row ownership (does this user own this trip?) is a separate Day-N concern. Worth surfacing early so future-you doesn't conflate the two.
- **Forward-reference to Phase E and F.** The "What's Next" section names Phase E (magic-link), Phase F (Google OAuth), and Phase G (close-out) so the reader sees the remaining path.
- **Tracker note unchanged.** Day 2 row stays at "11 of 12 commits"; detour progress lives in the Auth Detour checklist.
- **No new task/ doc.** PROMPT.md's Day 7 spec lists `12_protected_app_routes.md` as a task doc; that could be Day_30's task doc, but for now the per-commit plan files have been carrying that role. Decision: defer the task-doc-rewrite question to the Day_36 close-out.
