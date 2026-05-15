# Day_14_Add_per_page_metadata_exports

## Goal

Apply the Metadata API across Day 2's existing pages. Three changes:

1. **Root `app/layout.tsx`** — replace plain-string `title` with `title.template: "%s · Buddies"` + `default`, and add minimal OpenGraph defaults (`siteName: "Buddies"`, `type: "website"`) that every page inherits.
2. **`app/(app)/trips/page.tsx`** — add `export const metadata` with `title: "Trips"`, description, and an explicit `openGraph.title: "Trips · Buddies"` (the template **doesn't** auto-apply to OG keys — taught in `Day_13`'s gotchas).
3. **`app/(auth)/sign-in/page.tsx`** — same pattern: `title: "Sign in"` + matching `openGraph.title: "Sign in · Buddies"`.

After this commit the browser tab on `/trips` reads "Trips · Buddies", `/sign-in` reads "Sign in · Buddies", `/` falls back to the root `default` ("Buddies — Plan trips together"). Three Day 2 checklist rows flip from pending → covered; **the checklist's "Concepts pending" section becomes empty** — only `Day_15`'s close-out commit remains.

## Summary

**Files at a glance**

| Group     | Files                                                                |
| --------- | -------------------------------------------------------------------- |
| Plan doc  | `plans/Day_14_Add_per_page_metadata_exports.md`                      |
| App code  | `app/layout.tsx` (edited), `app/(app)/trips/page.tsx` (edited), `app/(auth)/sign-in/page.tsx` (edited) |
| Index     | `docs/README.md` (3 checklist rows flipped + tracker bumped to 11 of 12) |

**What you'll run / what you'll see**

| Command                                                            | What it does                                                                                |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `nvm use && pnpm dev`                                              | Starts dev server. |
| Browse `/`                                                         | Browser tab reads **"Buddies — Plan trips together"** — root's `default`. |
| Browse `/trips`                                                    | Browser tab reads **"Trips · Buddies"** — template `%s · Buddies` with page-segment `Trips`. |
| Browse `/sign-in`                                                  | Browser tab reads **"Sign in · Buddies"** — same template, different segment. |
| `pnpm build && curl -s http://localhost:3000/trips \| grep -o "<title>[^<]*</title>"` | Returns `<title>Trips · Buddies</title>` — the template is fully resolved in the static HTML, not patched in client-side. |
| `grep -o "og:title.*content=\"[^\"]*\"" .next/server/app/sign-in.html` | Shows `og:title content="Sign in · Buddies"` — proves OpenGraph fields are populated and composed correctly. |

> Final feature commit of Day 2. After this, only `Day_15`'s close-out remains.

## Commands

```bash
# Edit three files (see Files changed below for content).

# Verify locally — build + inspect HTML.
nvm use
rm -rf .next
pnpm build

# Confirm the three title outcomes in the built HTML.
grep -o "<title>[^<]*</title>" .next/server/app/index.html       # → "Buddies — Plan trips together"
grep -o "<title>[^<]*</title>" .next/server/app/sign-in.html     # → "Sign in · Buddies"
# (/trips is ƒ Dynamic — no static HTML. Run pnpm start and curl http://localhost:3000/trips instead.)
```

## Files changed

- `plans/Day_14_Add_per_page_metadata_exports.md` — **created**: this file.
- `app/layout.tsx` — **edited**:
  - `title` changed from a plain string to `{ template: "%s · Buddies", default: "Buddies — Plan trips together" }`. Pages that set just `title: "X"` now render `<title>X · Buddies</title>`.
  - Adds `openGraph: { siteName: "Buddies", type: "website" }` — both are inherited by every page unless overridden.
  - Drive-by: adopts `Readonly<{ children: React.ReactNode }>` on props (SonarLint `typescript:S6759`, same fix applied in Day_11/Day_12).
- `app/(app)/trips/page.tsx` — **edited**: adds `import type { Metadata } from "next";` and an `export const metadata: Metadata = { title: "Trips", description: "Your saved trips, ready to plan.", openGraph: { title: "Trips · Buddies", description: "..." } }` block at the top of the file. Page function body unchanged.
- `app/(auth)/sign-in/page.tsx` — **edited**: same shape as trips — `title: "Sign in"`, matching description, explicit `openGraph.title: "Sign in · Buddies"`. Page function body unchanged.
- `docs/README.md` — **edited**:
  1. **Coverage Checklist:** three rows flip from **Concepts pending ⏳** to **Concepts covered ✅** — Metadata API (static vs dynamic), `title.template`, OpenGraph metadata per page. Covered count: 19 → 22. Pending count: 3 → **0**. Pending subsection now reads "(none — all 22 Day 2 concepts covered. Close-out commit Day_15 next.)"
  2. **Progress tracker:** Day 2 row notes bumped to "11 of 12 commits: all concepts shipped + verified; close-out commit Day_15 next".

## Verification

1. Open `app/layout.tsx` — `title` is the `{ template, default }` object form; `openGraph.siteName` and `openGraph.type` are set.
2. Open `app/(app)/trips/page.tsx` — `metadata` export comes before the component; `openGraph.title` is the **composed** "Trips · Buddies" string (NOT just "Trips" — that's the gotcha from Day_13's doc).
3. `nvm use && pnpm dev` — browse all three URLs and confirm browser tab titles change as expected:
   - `/` → "Buddies — Plan trips together"
   - `/trips` → "Trips · Buddies"
   - `/sign-in` → "Sign in · Buddies"
4. `pnpm build`:
   - `grep -o "<title>[^<]*</title>" .next/server/app/index.html` → `<title>Buddies — Plan trips together</title>`
   - `grep -o "<title>[^<]*</title>" .next/server/app/sign-in.html` → `<title>Sign in · Buddies</title>`
   - `/trips` is `ƒ Dynamic` (reads `searchParams`) so no static HTML — verify via `pnpm start` + `curl http://localhost:3000/trips | grep title`.
5. `pnpm typecheck && pnpm lint` — both pass.
6. `docs/README.md` Coverage Checklist: 22 covered, **0 pending**, 3 deferred. Day 2 row reads "11 of 12 commits".

## Gotchas / decisions

- **Why didn't I add metadata to `/`?** The root `default` is already what the home page should show — "Buddies — Plan trips together." Adding an explicit `metadata` export on `/` would just duplicate that string. The point of `default` is to handle exactly this case.
- **`openGraph.title` is *explicitly* set, not derived.** This is the trap from Day_13 — the template doesn't apply to OG keys. If we'd left `openGraph` empty on `/trips`, the `og:title` meta tag would read just "Trips" (or fall back to the page `title` value), and a Slack/iMessage preview of the URL would show "Trips" — not "Trips · Buddies." Setting `openGraph.title` to the composed name is the only way to guarantee the right share-preview output.
- **`twitter.title` isn't set explicitly.** Next.js automatically derives `twitter:*` tags from `openGraph.*` when not overridden. Verified in the built HTML: the `/sign-in` rendered output has `twitter:title content="Sign in · Buddies"` even though we didn't set it. Setting it explicitly would be belt-and-suspenders; trusting the Next default is fine for Day 2.
- **No `generateMetadata` here.** All Day 2 pages have build-time-knowable titles. `generateMetadata` (the async dynamic variant) is only useful when the title depends on URL params, search params, or runtime data — Day 6's `/trips/[id]` will be the first place we need it.
- **The `Readonly<{...}>` props update in `app/layout.tsx` is a drive-by.** Same SonarLint rule we adopted in `Day_11`/`Day_12`. The root layout was touched here for the metadata change, so applying the consistent Readonly pattern at the same time keeps the codebase converging.
- **`/sign-in` shows the `(auth)` layout in the built HTML** — confirmed by inspecting `.next/server/app/sign-in.html` — the centered `flex min-h-screen items-center justify-center` shell is there, no header. The metadata is in the shared `<head>`; the body layout is per-route-group. Same URL tree, two shells, one set of head tags via the merge mechanism.
- **Pending count flips to zero.** This is the first time the Day 2 checklist has zero pending rows. `Day_15`'s close-out commit flips the day-row from 🔄 to ✅; the checklist itself becomes a frozen record of what Day 2 covered.
