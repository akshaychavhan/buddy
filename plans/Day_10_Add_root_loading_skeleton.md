# Day_10_Add_root_loading_skeleton

## Goal

Ship the first piece of the loading/error pair: a root-level `app/loading.tsx` that becomes an automatic `<Suspense>` fallback for every segment under `app/`. Until the page resolves its server data, the skeleton renders in its place. On a localhost-fast page with no `await`s, the skeleton is invisible (resolves instantly) — that's expected, and the way to *see* it is a temporary `setTimeout` in the page being tested (documented in the gotchas).

This is the first commit that flips a row in the **Day 2 Coverage Checklist** from pending → covered.

## Summary

**Files at a glance**

| Group     | Files                                              |
| --------- | -------------------------------------------------- |
| Plan doc  | `plans/Day_10_Add_root_loading_skeleton.md`        |
| App code  | `app/loading.tsx` (new)                            |
| Index     | `docs/README.md` (checklist row flip + tracker)    |

**What you'll run / what you'll see**

| Command                                              | What it does                                                                                |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `nvm use && pnpm dev`                                | Starts dev server. On every page load (`/`, `/trips`, `/sign-in`), the skeleton is *prepared* but you won't see it because nothing suspends. |
| Edit `app/(app)/trips/page.tsx` to add a temporary `await new Promise(r => setTimeout(r, 1500))` at the top of the component | Now navigating to `/trips` shows the skeleton for ~1.5s before the real content streams in. **Note: revert this temporary edit before committing further work.** |
| Open DevTools → Network during the slow `/trips` load | First an RSC payload arrives with the skeleton HTML; then a second payload arrives streaming the real content. The header (above the Suspense boundary) stays mounted throughout. |
| `pnpm build`                                         | Build summary still shows the same four routes; `loading.tsx` doesn't add a new URL. |

> First code commit that flips a coverage-checklist row. After this, `loading.tsx` and streaming are concepts your repo can demonstrate, not just describe.

## Commands

```bash
# Just create the file (see Files changed below for content).

# Verify locally — but to actually *see* the skeleton, you need to
# temporarily slow down a page:
nvm use
pnpm dev

# In a different terminal, edit app/(app)/trips/page.tsx and add this
# as the very first line of the component body:
#
#   await new Promise((r) => setTimeout(r, 1500));
#
# Then make the component `async function TripsPage(...)` so you can
# await. Navigate to /trips and watch the skeleton stream in.
# IMPORTANT: revert the edit before continuing. The setTimeout is a
# TESTING TOOL, NOT part of this commit.
```

## Files changed

- `plans/Day_10_Add_root_loading_skeleton.md` — **created**: this file.
- `app/loading.tsx` — **created**: Server Component, 14 lines. A simple skeleton: header-sized pulse bar, paragraph-sized pulse bar, three card-sized pulse rectangles. Uses Tailwind `animate-pulse` and dark-mode-aware neutral colors so it looks correct in both themes. Generic enough to be acceptable as a fallback for *any* route under `app/`; per-segment skeletons (e.g. a list-shaped fallback specifically for `/trips`) are deferred — not needed until route shapes diverge.
- `docs/README.md` — **edited**:
  1. **Coverage Checklist:** moves the `loading.tsx as an automatic Suspense boundary + streaming` row from **Concepts pending ⏳** to **Concepts covered ✅**. Covered count goes from 13 → 14; pending count goes from 9 → 8.
  2. **Progress tracker:** Day 2 row notes updated to "7 of 12 commits: route groups + nav + loading skeleton done; error boundary + island + metadata pending".

## Verification

1. `ls app/` — shows `loading.tsx` alongside `layout.tsx`, `(app)/`, `(auth)/`, `api/`, `globals.css`.
2. `nvm use && pnpm dev`, browse `/`, `/trips`, `/sign-in` — all three render identically to before; skeleton is invisible because nothing suspends. This is normal.
3. **Temporary slow-down test** (don't commit this edit):
   - Edit `app/(app)/trips/page.tsx` so the function signature is `export default async function TripsPage({...})` and the first line of the body is `await new Promise((r) => setTimeout(r, 1500));`.
   - Navigate from `/` to `/trips` — header stays, skeleton renders below it for ~1.5s, then the trip cards stream in.
   - **Revert the edit** with `git checkout app/(app)/trips/page.tsx` before doing anything else.
4. `pnpm build` succeeds; route summary unchanged (loading files don't add routes).
5. `pnpm typecheck && pnpm lint` — both pass.
6. `docs/README.md` Coverage Checklist now lists `loading.tsx as an automatic Suspense boundary` under **covered**; pending count is 8.

## Gotchas / decisions

- **The skeleton looks invisible during normal navigation. That's correct.** A page without `await`s resolves synchronously, so the `<Suspense>` fallback never gets a chance to render. To prove it's wired up, you need to slow down a page artificially. Don't waste time wondering why nothing seems to happen.
- **The temporary `setTimeout` does NOT belong in this commit.** It's a verification tool. Leaving it in would break the contract that "this commit is a stopping point." After verifying, `git checkout app/(app)/trips/page.tsx`.
- **Why root `loading.tsx`, not per-segment?** Per the Day_09 doc: closest ancestor wins, but a root file covers everything that doesn't have a closer one. On Day 2 we don't have any segment-specific loading shapes worth tailoring — Day 4 (forms) and Day 6 (DB queries) will likely add per-segment skeletons that match the page's real layout.
- **Why is the skeleton a Server Component?** No interactivity. `animate-pulse` is a CSS class, not a JS animation. No `useState`, no event handlers, no client hooks. Saving the bundle is free here, so we take it.
- **The header *stays mounted* during loading.** That's the layout-persists rule from Day 5. Only the page content suspends; the `(app)` layout's header doesn't blink. This is the most user-pleasing behavior — confirm by watching `/` → `/trips` with the temporary `setTimeout` in place.
- **`error.tsx` doesn't ship in this commit.** Splitting `loading.tsx` and `error.tsx` into separate commits is part of the one-concept-per-commit pacing. Same learning-doc source (`day2_loading_and_error_files.md`), two code commits (`Day_10`, `Day_11`).
- **No `app/(auth)/loading.tsx`.** The `/sign-in` page is fully static; nothing to suspend. The root skeleton wouldn't render for `/sign-in` anyway (no `await` to wait on), but if it did, the centered `(auth)` shell would briefly show a left-aligned skeleton — visually awkward. If/when we add an async auth page, we'll add a centered version. Not needed yet.
