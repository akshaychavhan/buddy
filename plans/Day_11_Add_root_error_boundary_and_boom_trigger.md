# Day_11_Add_root_error_boundary_and_boom_trigger

## Goal

Ship the second half of the loading/error pair: a root-level `app/error.tsx` (Client Component, required) that catches any render-time throw under `app/`, plus a deliberate `?boom=1` trigger on `/trips` so the boundary is testable on demand. Navigating to `/trips?boom=1` now renders the error UI with a "Try again" button; clicking it calls `reset()`, which re-renders the segment and (with `?boom=1` still in the URL) throws again — the user removes the query param and `reset()` succeeds.

This is the **most concept-dense** code commit of Day 2 — three coverage-checklist rows flip from pending → covered in one commit.

## Summary

**Files at a glance**

| Group     | Files                                                                  |
| --------- | ---------------------------------------------------------------------- |
| Plan doc  | `plans/Day_11_Add_root_error_boundary_and_boom_trigger.md`             |
| App code  | `app/error.tsx` (new), `app/(app)/trips/page.tsx` (edited)             |
| Index     | `docs/README.md` (3 checklist rows flipped + tracker bumped to 8 of 12) |

**What you'll run / what you'll see**

| Command                                                  | What it does                                                                                |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `nvm use && pnpm dev`                                    | Starts dev server. |
| Browse `/trips`                                          | Normal — three trip cards render. No error UI visible. |
| Browse `/trips?boom=1`                                   | Server-side throw → React boundary catches it → `<RootError>` renders. Shows "Something went wrong", the error message, an error-digest id (production-style), and a "Try again" button. The header stays mounted (boundary is *below* the layout). |
| Click "Try again" while still at `/trips?boom=1`         | `reset()` fires → React re-renders the segment → still `?boom=1` → throws again → error UI re-renders. Demonstrates that `reset()` retries, doesn't magically recover. |
| Manually remove `?boom=1` from the URL bar, then click "Try again" | Now the page renders the three trip cards normally. Boundary recovered. |
| `pnpm build`                                             | `/trips` is now marked **`ƒ (Dynamic) — server-rendered on demand`** because it reads `searchParams`. Other routes still `○ (Static)`. |

> First commit to flip three checklist rows at once: `error.tsx` is Client, `reset()`, and `searchParams`.

## Commands

```bash
# Create app/error.tsx (Client Component) and edit
# app/(app)/trips/page.tsx to read searchParams and throw on ?boom=1.
# See "Files changed" below for content.

# Verify locally.
nvm use
pnpm dev
# Then browse /trips, /trips?boom=1, click Try again, remove ?boom=1, repeat.
```

## Files changed

- `plans/Day_11_Add_root_error_boundary_and_boom_trigger.md` — **created**: this file.
- `app/error.tsx` — **created**: Client Component (`"use client"` on line 1, mandatory). Receives `{ error, reset }` as props; renders "Something went wrong" heading, the error's `message`, the `digest` (Next.js-assigned production error id, if present), and a `<button onClick={reset}>` styled with Tailwind to match the app's neutral palette. Props are typed as `Readonly<{ error: ...; reset: ... }>` (SonarLint `typescript:S6759`).
- `app/(app)/trips/page.tsx` — **edited**: signature now reads `searchParams` as a `Readonly<{ searchParams: { boom?: string } }>` prop. At the top of the body, if `searchParams.boom === "1"`, the component throws `new Error("Boom — error boundary demo")`. Below that, the existing trip-list render is untouched.
- `docs/README.md` — **edited**:
  1. **Coverage Checklist:** three rows move from **Concepts pending ⏳** to **Concepts covered ✅**:
     - `error.tsx` is a Client Component (required by Next.js) — covered by Day_11 code
     - `reset()` on error boundaries — covered by Day_11
     - `searchParams` as page-level input — covered by Day_11's `?boom=1` trigger
     Covered count: 14 → 17. Pending count: 8 → 5.
  2. **Progress tracker:** Day 2 row notes updated to "8 of 12 commits: route groups + nav + loading + error boundary done; island + metadata pending".

## Verification

1. `ls app/` — shows `error.tsx` alongside `loading.tsx`, `layout.tsx`, `(app)/`, `(auth)/`, `api/`, `globals.css`.
2. Open `app/error.tsx` — **first non-comment line is `"use client";`**. This is the critical detail that took an entire learning doc to motivate.
3. `nvm use && pnpm dev`, then:
   - Browse `/trips` — normal render, three trip cards.
   - Browse `/trips?boom=1` — error UI renders. Header strip (Buddies / Trips / Sign in) is **still visible at the top** — confirms the boundary is below the layout. The error message reads "Boom — error boundary demo".
   - Click "Try again" with `?boom=1` still in URL — same error UI re-renders. Proves `reset()` is a re-attempt, not a magic recovery.
   - Edit the URL bar to remove `?boom=1`, click "Try again" — three trip cards render.
4. `pnpm build` — succeeds. Route table shows `/trips` as **`ƒ (Dynamic)`** (it reads `searchParams`, can't be prerendered). Other routes still `○ (Static)`.
5. `pnpm typecheck && pnpm lint` — both pass.
6. `docs/README.md` Coverage Checklist: 17 covered, 5 pending, 3 deferred. Last remaining pending blocks: client island, build inspection, metadata API (3 items), title.template, OpenGraph.

## Gotchas / decisions

- **`"use client"` is genuinely required, not stylistic.** Removing it would make `pnpm build` fail with: *"error.tsx must be a Client Component. Add the `"use client"` directive..."* — the framework rejects the file outright. The Day_09 doc spent ~340 lines motivating *why*; this commit is where the rule pays rent.
- **The boundary catches *server-side* render throws.** The `throw new Error(...)` in `trips/page.tsx` runs on the server (page is a Server Component). The error bubbles up; Next's runtime forwards it to the *client*-side boundary attached by `error.tsx`. The user sees a graceful fallback instead of a 500 page.
- **`error.message` is sanitized in production.** In dev, the `RootError` component shows the literal `"Boom — error boundary demo"` string. In `pnpm build && pnpm start` (production), the `error.message` is replaced with `"An error occurred in the Server Components render."` and the `error.digest` is the only way to correlate to server logs. This is by design (don't leak stack traces to users). The current UI handles both modes — if `error.digest` exists, it renders the id.
- **Why edit `/trips`, not add a separate `/boom` route?** Two reasons: (1) Reusing `searchParams.boom` keeps the demo contained — no extra URL pollutes the route table. (2) `searchParams` is the *concept* we want to teach alongside the boundary. Adding a `/boom` route would teach the boundary but skip the URL-input lesson.
- **`reset()` semantics.** It's *not* "fix the error and render successfully." It's "re-attempt this segment's render." If the cause is persistent (bad data, bad URL param), the retry fails again. The pattern is "Try again, maybe it was a network blip." For genuine recovery the user has to act (change the URL, retry the action, etc.). This is React's standard `<ErrorBoundary>` semantics, not a Next.js quirk.
- **`Readonly<>` wrapper on props.** SonarLint's `typescript:S6759` rule flagged the new `searchParams` destructure. Adopted `Readonly<{...}>` for both the new files in this commit (`error.tsx`, `trips/page.tsx`). The other Day 2 files (`(app)/layout.tsx`, `(auth)/layout.tsx`, `(auth)/sign-in/page.tsx`) have the same pattern and will get the same fix in a follow-up cleanup commit — keeping this commit focused on the error-boundary concept.
- **No per-segment `error.tsx`.** Same rationale as `Day_10`'s loading: root file catches everything, per-segment files are useful when route shapes diverge. Day 6 (DB queries that might 404) is the likely place for a `trips/error.tsx` specifically tuned to "trip not found" vs "database unreachable" distinctions.
- **Build switched `/trips` to `ƒ Dynamic` after this commit.** Worth noting in the build output — reading `searchParams` *disables* static prerendering for that route. Day 6 will see more of this once real DB queries land.
