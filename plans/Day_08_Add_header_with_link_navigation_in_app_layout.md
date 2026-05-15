# Day_08_Add_header_with_link_navigation_in_app_layout

## Goal

Make the `(app)` shell *feel* like an app shell: add a real header to `app/(app)/layout.tsx` with a brand link and two `<Link>` nav items pointing to `/trips` and `/sign-in`. Create the `/trips` page that the nav links to (Server Component, three hardcoded trips) so every link in the header resolves to a real route from the moment it lands. Bundle a brand-new **"📊 Day 2 — Live Coverage Checklist"** into `docs/README.md` that tracks concepts covered vs pending; this is the running checklist that every Day-2 commit from now on will update.

After this commit, clicking the brand goes home, clicking "Trips" loads `/trips` *without a full page reload* (Next.js's RSC payload, not a fresh document), and clicking "Sign in" navigates to the `(auth)` shell — the header *disappears* because `(auth)/layout.tsx` doesn't have one. Two visibly distinct layouts in the same URL tree, no `pathname` check anywhere.

## Summary

**Files at a glance**

| Group     | Files                                                                |
| --------- | -------------------------------------------------------------------- |
| Plan doc  | `plans/Day_08_Add_header_with_link_navigation_in_app_layout.md`      |
| App code  | `app/(app)/layout.tsx` (edited), `app/(app)/trips/page.tsx` (new)    |
| Index     | `docs/README.md` (new checklist section + tracker notes update)      |

**What you'll run / what you'll see**

| Command                                          | What it does                                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `nvm use && pnpm dev`                            | Starts dev server. |
| Browse `/`                                       | Same Day 1 page, now under a header strip with brand + "Trips" + "Sign in" nav. |
| Click "Trips" in the header                      | URL becomes `/trips`, three hardcoded trips render — DevTools Network shows an RSC payload, not a fresh document. **No reload.** |
| Click "Sign in" in the header                    | URL becomes `/sign-in`; the header **disappears** — the `(auth)` layout owns the chrome here. |
| Click "Buddies" brand                            | Back to `/`. Header reappears. |
| `pnpm build`                                     | All four routes compile: `/`, `/trips`, `/sign-in`, `/api/health`. |
| Read `docs/README.md`                            | New "📊 Day 2 — Live Coverage Checklist" section near the top — 13 concepts ticked across `Day_04`–`Day_08`, 9 pending across `Day_09`–`Day_14`. |

## Commands

```bash
# Create the trips folder + page.
mkdir -p "app/(app)/trips"

# (Then edit app/(app)/layout.tsx and create app/(app)/trips/page.tsx —
#  see Files changed below for the content.)

# Verify locally.
nvm use
pnpm build       # one full build to regenerate typed routes
pnpm dev         # then click through / → /trips → /sign-in
```

## Files changed

- `plans/Day_08_Add_header_with_link_navigation_in_app_layout.md` — **created**: this file.
- `app/(app)/layout.tsx` — **edited**: imports `Link` from `next/link`. Wraps `children` in a flex column with a `<header>` strip at the top (border-b, brand link, two nav links). Still a Server Component — `<Link>` works inside Server Components.
- `app/(app)/trips/page.tsx` — **created**: Server Component, 27 lines. Defines three hardcoded trips (Goa, Spiti, Tokyo), renders them as a styled list with name + when. Notes inline that Day 6 will swap the hardcoded array for `await db.trip.findMany()`.
- `docs/README.md` — **edited**:
  1. Adds a new **"📊 Day 2 — Live Coverage Checklist"** section right above the Learning Journal. Three subsections: Concepts covered (13 items, `Day_04` through `Day_08`), Concepts pending (9 items, `Day_09` through `Day_14`), Deferred to later days (3 items: design tokens / i18n / real auth). Each row is one line, tagged with the commit number that covers it.
  2. Updates the Day 2 progress-tracker row's Notes column from "Doc 1 of 4: RSC vs Client Component boundary" to "5 of 12 commits: route groups + `<Link>` nav done; loading/error/island/metadata pending".

## Verification

1. `ls "app/(app)/trips/"` — shows `page.tsx`.
2. `nvm use && pnpm dev`, browse `/`:
   - See a horizontal header strip with "Buddies" on the left, "Trips" + "Sign in" on the right.
   - Click "Trips" → URL becomes `/trips`, three trip cards render. Open DevTools → Network and filter by type; the request type is **`fetch`** (RSC payload), not `document`. That's the no-reload pattern.
   - Click "Sign in" → URL becomes `/sign-in`, the header vanishes (`(auth)` layout is centered, no chrome).
   - Click "Buddies" brand → back to `/`, header returns.
3. `pnpm build` — route summary lists `/`, `/sign-in`, `/trips`, `/api/health`. All under "Route (app)".
4. `pnpm typecheck && pnpm lint` — both pass. (Typed routes confirm the three `<Link href>` strings against the actual route tree.)
5. Open `docs/README.md` — the "📊 Day 2 — Live Coverage Checklist" section is the first major section after the intro paragraph; 13 covered, 9 pending, 3 deferred.

## Gotchas / decisions

- **Why bundle the `/trips` page with the header in one commit?** Because of `experimental.typedRoutes: true` in `next.config.mjs`. Adding `<Link href="/trips">` *before* `app/(app)/trips/page.tsx` exists would fail at `pnpm typecheck` — Next generates a literal-union type of all valid hrefs, and an unrecognized string is a compile error. They must land together. Same logic protects against typos: a mis-typed href fails at build time, not at runtime.
- **Why does `/sign-in` lose the header?** Because `app/(auth)/layout.tsx` (committed in `Day_07`) does **not** render a header — it just centers `{children}`. The two route groups own independent layout trees. Same URL tree, two shells, zero conditionals. That's the route-group payoff finally visible to the user.
- **`<Link>` inside a Server Component is fine.** `<Link>` is a Client Component internally, but Server Components can *render* Client Components — that's the islands pattern from the Day 4 doc. We're not turning the layout into a Client Component just because it uses `<Link>`.
- **Styling is deliberately minimal**: border-b on the header, neutral colors, hover affordance. Day 3 will replace this with the real design token system. Don't get attached to the current visual.
- **Checklist lives in `docs/README.md`, not the task doc.** Reason: the README is the doc the user opens first; sticking the running scorecard there means "what does my brain hold now?" is answered before any click. The Task 02 acceptance-criteria checklist stays unchanged — that tracks *files exist*, the new checklist tracks *concepts learned*. Two different lenses.
- **Why are the concepts in the checklist phrased as facts, not file paths?** Because we're tracking what's in your head, not what's on disk. "Folder = URL segment" stays true regardless of which file added it. The commit tag tells you which commit *first* covered it.
- **Header is *not* sticky.** Considered `sticky top-0`, decided against it for Day 2 — sticky needs `z-index` planning and a backdrop blur to look right, and that's design-system Day-3 work. The header just sits at the top of the document for now.
