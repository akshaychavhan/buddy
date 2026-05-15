# Day_09_Add_loading_and_error_files_learning_doc

## Goal

Third doc-first commit of Day 2. Teaches the two file conventions the App Router gives you for free: `loading.tsx` (an automatic `<Suspense>` boundary per segment) and `error.tsx` (an automatic error boundary per segment, which **must** be a Client Component). After reading this, the reader has the rule in mind that *forces* `Day_11`'s `error.tsx` to start with `"use client"` — so when that file lands, the directive isn't magic.

Pure docs commit. The code that uses these concepts ships in `Day_10` (root loading skeleton) and `Day_11` (root error boundary + `?boom=1` trigger on `/trips`).

## Summary

**Files at a glance**

| Group     | Files                                                             |
| --------- | ----------------------------------------------------------------- |
| Plan doc  | `plans/Day_09_Add_loading_and_error_files_learning_doc.md`        |
| Learning  | `docs/learning/day2_loading_and_error_files.md`                   |
| Index     | `docs/README.md` (Learning Journal entry + checklist update)      |

**What you'll run / what you'll see**

| Command                                                           | What it does                                                                                |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Open `docs/learning/day2_loading_and_error_files.md`              | ~340 lines: per-segment file rule, what each file does mechanically, the **why** behind `error.tsx` needing `"use client"`, the `searchParams.boom === "1"` trigger we'll reuse in `Day_11`, the special-files reminder table, 8 gotchas, 5-question quiz. |
| Open `docs/README.md`                                             | Day 2 Learning Journal subsection now lists **three** docs. The "📊 Live Coverage Checklist" section's *pending* rows for loading and error now tag this doc as the **source-of-truth**, while the **covered** flip waits for `Day_10`/`Day_11`. |
| `ls docs/learning/day2_*.md`                                      | Three files: rsc-vs-client, layouts-and-templates, loading-and-error. |

> Pure docs commit — no `app/` changes. The actual `loading.tsx` and `error.tsx` files arrive next.

## Commands

```bash
# Nothing to run. Reading the doc IS the work.
# Optional sanity check:
pnpm typecheck && pnpm lint
```

## Files changed

- `plans/Day_09_Add_loading_and_error_files_learning_doc.md` — **created**: this file.
- `docs/learning/day2_loading_and_error_files.md` — **created**: ~340-line learning doc following PROMPT.md §2.1. Sections:
  - **How It Works**: where the files live (per-segment, closest-ancestor-wins), what `loading.tsx` does (Suspense fallback, Server Component default, layouts above persist), what `error.tsx` does (`error`/`reset` props, must be Client), why `error.tsx` must be Client (React error-boundary machinery is browser-side), streaming briefly, special-files reminder table.
  - **Tiny Isolated Example**: skeleton `loading.tsx`, Client-Component `error.tsx`, `searchParams.boom === "1"` throw — the exact triple we'll ship across `Day_10`/`Day_11`.
  - **Applied to Buddies**: target file list for Day 2 (`app/loading.tsx`, `app/error.tsx`, edit to `/trips`).
  - **Gotchas**: 8 items including `"use client"` requirement, root-error doesn't catch root-layout throws, `reset()` only retries the segment, `loading.tsx` needs something to suspend (the localhost-too-fast problem and the `setTimeout` testing trick), closest-boundary-wins, `searchParams` is page-level not Client hook, error boundaries don't catch event-handler errors.
  - **Quiz**: 5 questions with `<details>` answers covering the gotcha-equivalent material.
- `docs/README.md` — **edited**:
  1. Adds `day2_loading_and_error_files.md` link under Phase 1 → Day 2 in Learning Journal (after layouts-and-templates).
  2. The "📊 Day 2 — Live Coverage Checklist" section is **not** changed by this commit. The concepts taught here remain in "pending" until the corresponding code commits (`Day_10`, `Day_11`) actually ship the files. Reading the doc prepares the brain; checking the box requires the code to exist in the repo.

## Verification

1. Open `docs/learning/day2_loading_and_error_files.md` — title is "`loading.tsx` and `error.tsx`: Free Boundaries Per Segment", contains the special-files reminder table, the streaming explainer, the `?boom=1` example exactly as it will land in `Day_11`, and 5 quiz items in `<details>` blocks.
2. Open `docs/README.md` — under **Phase 1 → Day 2** in Learning Journal there are now **three** entries.
3. Run `git log --oneline -2` — top two commits are `Day_09_Add_loading_and_error_files_learning_doc` and `Day_08_Add_header_with_link_navigation_in_app_layout`.
4. Run `ls docs/learning/day2_*.md` — exactly three files.
5. `docs/README.md` checklist: covered count is still 13, pending count is still 9 (no rows flipped — that happens in `Day_10` + `Day_11`).
6. Progress-tracker Day 2 row stays at "🔄 In progress, 5 of 12 commits" — the docs-only commit doesn't change the visible state, only adds source material. (Could update to "6 of 12" — leaning toward yes for honesty; will edit if the count looks more accurate.)

## Gotchas / decisions

- **No checklist row flips in this commit.** The checklist tracks "concepts in your repo" — a learning doc *teaches* the concept but the boxes flip when the code that demonstrates it lands. `Day_10` flips the `loading.tsx` row; `Day_11` flips three rows (`error.tsx` Client, `reset()`, `searchParams`). Doing the flips here would be premature.
- **Why the `searchParams.boom === "1"` example *here*, in the doc?** Future-you walking `git checkout Day_09` should be able to read the doc and *predict* what `Day_11`'s code will look like. Showing the trigger pattern in the doc means `Day_11`'s diff is "we did what the doc said."
- **`global-error.tsx` is mentioned but not built.** It's the boundary that catches root-`layout.tsx` throws. We've never needed it in Buddies and likely won't — Day 2 doesn't include it. Mentioned in the gotcha list so it's not a surprise if you stumble across the docs.
- **`not-found.tsx` is in the reminder table but not Day 2 scope.** It belongs to Day 4 (real list pages) or Day 6 (real DB queries that might 404). Listed for completeness only.
- **`searchParams` as the page-level prop is the right way.** The `useSearchParams` hook is for Client Components and works differently. Day 2 keeps the page Server-side; `searchParams` prop is the match.
- **Day 2 progress-tracker notes update?** Decision: update to "6 of 12 commits: route groups + `<Link>` nav + loading/error doc done; loading/error code pending". Keeps the tracker honest, doesn't over-commit to having the *code* done.
