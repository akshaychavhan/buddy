# Day_12_Add_theme_toggle_client_component_island

## Goal

Ship the first *real* Client Component island in the Buddies app: `components/theme-toggle.tsx`, a small button with an `onClick` handler, imported into the (Server) `(app)/layout.tsx` header. After this commit the repo demonstrates the islands pattern in production code — a Server Component layout renders a Client Component child, and `pnpm build` proves the bundle split: the layout's HTML is server-rendered while the toggle's JS ships as a client chunk.

The button itself is a **stub**: clicking it shows an alert that says "Day 3 will wire this up." Day 3 (Tailwind + theme system) replaces this with a real light/dark switch. The point of *this* commit is the boundary crossing, not the feature.

## Summary

**Files at a glance**

| Group     | Files                                                              |
| --------- | ------------------------------------------------------------------ |
| Plan doc  | `plans/Day_12_Add_theme_toggle_client_component_island.md`         |
| App code  | `components/theme-toggle.tsx` (new), `app/(app)/layout.tsx` (edited) |
| Index     | `docs/README.md` (2 checklist rows flipped + tracker bumped to 9 of 12) |

**What you'll run / what you'll see**

| Command                                                                          | What it does                                                                                |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `nvm use && pnpm dev`                                                            | Starts dev server. |
| Browse `/`                                                                       | Header now shows: Buddies · Trips · Sign in · 🌓 (the toggle, far right). |
| Click 🌓                                                                         | `alert()` fires: "Theme toggle stub — Day 3 will wire this up...". Proves the `onClick` runs in the browser — i.e. the Client Component hydrated correctly. |
| Open DevTools → Console while loading `/`                                        | No hydration warnings, no "useState is not a function" errors. The toggle hydrates cleanly because its rendered output is identical server-side and client-side (no `Date`, no `localStorage` read). |
| `pnpm build`                                                                     | Build succeeds. Route table unchanged: `/`, `/sign-in`, `/trips` still listed; `/trips` still `ƒ Dynamic`. |
| `grep -l "Day 3 will wire" .next/static/chunks/app/(app)/*.js`                   | Returns `.next/static/chunks/app/(app)/layout-*.js` — proves the toggle's JS is bundled into the layout's *client* chunk, not server-rendered HTML. |

> First Client Component island shipped. The boundary from the Day_04 doc is now a build artifact you can inspect.

## Commands

```bash
# Create the components/ folder + theme-toggle.tsx.
mkdir -p components

# (Then write components/theme-toggle.tsx and edit app/(app)/layout.tsx
#  to import + render <ThemeToggle />. See "Files changed" below.)

# Verify locally + inspect the bundle.
nvm use
pnpm build
# Then prove the bundle split:
grep -l "Day 3 will wire" .next/static/chunks/app/\(app\)/*.js
```

## Files changed

- `plans/Day_12_Add_theme_toggle_client_component_island.md` — **created**: this file.
- `components/theme-toggle.tsx` — **created**: Client Component, 18 lines. `"use client"` on line 1; exports `function ThemeToggle()` (named export so the import is `{ ThemeToggle }` not default — easier to grep, easier to refactor). Renders a single `<button>` with the 🌓 emoji, an `aria-label="Toggle theme"`, and an `onClick` that fires `alert(...)`. Tailwind classes for a small rounded-pill look with dark-mode-aware hover.
- `app/(app)/layout.tsx` — **edited**: adds `import { ThemeToggle } from "@/components/theme-toggle";` (uses the `@/*` alias from `tsconfig.json`, already wired in Day 1). Renders `<ThemeToggle />` as the **last** item in the nav (after the Sign-in link). Also adopts `Readonly<{...}>` for the props type, matching the convention started in `Day_11`.
- `docs/README.md` — **edited**:
  1. **Coverage Checklist:** two rows flip from **Concepts pending ⏳** to **Concepts covered ✅**:
     - First Client Component island inside a Server Component layout
     - `pnpm build` bundle inspection — Client Components in their own chunk
     Covered count: 17 → 19. Pending count: 5 → 3.
  2. **Progress tracker:** Day 2 row notes updated to "9 of 12 commits: route groups + nav + loading + error + first Client island done; metadata API pending".

## Verification

1. `ls components/` — shows `theme-toggle.tsx`.
2. Open `components/theme-toggle.tsx` — first non-comment line is `"use client";`. The component must be a Client Component because `onClick` is browser-only.
3. `nvm use && pnpm dev` → open `/` → the header shows the 🌓 button on the far right. Click it → browser alert pops up with the "Day 3 will wire this up" message.
4. **Hydration check:** open DevTools → Console *before* clicking anything. No warnings about "Text content does not match server-rendered HTML" or "useState is not a function." Clean hydration.
5. **Bundle split proof:**
   ```bash
   pnpm build
   grep -l "Day 3 will wire" .next/static/chunks/app/\(app\)/*.js
   ```
   Returns the layout's client chunk path (`layout-<hash>.js`). That's where the toggle's `onClick` handler lives. The layout's *server* render output (in `.next/server/`) does NOT contain that string — search the server chunks to confirm if curious.
6. `pnpm typecheck && pnpm lint` — both pass.
7. The `(app)` shell now has a 4-item nav: Buddies (brand) · Trips · Sign in · 🌓. The `(auth)` shell still has no header (toggle doesn't appear on `/sign-in`) — confirming the toggle is scoped to `(app)`'s layout, not bolted onto the root.

## Gotchas / decisions

- **Why a named export, not default?** `import { ThemeToggle } from "..."` is searchable across the codebase (`grep -r ThemeToggle .`) in a way that `import Toggle from "..."` is not — defaults can be named anything at the import site. Named exports also play better with most refactor tools.
- **Why import via `@/components/...` and not `../../components/...`?** The `@/*` path alias in `tsconfig.json` (set up in `Infra_02`) resolves from the repo root, so any file in any folder uses the same import path. Survives moving the layout to a different depth without an import rewrite.
- **Why a *stub* with an alert?** Two reasons. (1) The point of `Day_12` is the *boundary*, not the feature — the goal is to render a Client Component inside a Server layout, watch it hydrate, and inspect the bundle. (2) A real light/dark toggle needs design tokens, cookie-based persistence, and FOUC prevention — all Day 3 work. Anything we'd build now would be throwaway by Day 3.
- **Why no hydration warning?** The toggle's *rendered HTML* is identical on the server (just a `<button>` with the 🌓 character) and on the client. Hydration warnings happen when server-rendered HTML differs from what the client would render — e.g. if the toggle read `localStorage` on mount, the server would render one thing and the client another. The stub deliberately avoids that. Day 3 will need a `useEffect`-guarded `localStorage` read to keep hydration clean.
- **Why is the toggle in the *layout's* client chunk, not its own?** Next.js's bundler decides chunking. For a single small Client island used by exactly one layout, the toggle's JS gets inlined into that layout's client chunk — fewer HTTP requests. If the toggle were imported by multiple layouts, the bundler might split it out. Don't fight the bundler unless you have a measurement to back it up.
- **Why does the toggle only appear on `(app)` routes?** Because it's imported into `app/(app)/layout.tsx`, not the root layout. On `/sign-in` (under `(auth)`), there's no toggle — which is correct: auth pages typically have minimal chrome. Day 3 might revisit this (probably move the toggle to the root layout so it's available everywhere), but Day 2's job is to demonstrate the pattern, and a single-island scope is the cleanest demo.
- **`aria-label="Toggle theme"` is intentional.** Buttons with only an emoji as content are screen-reader-hostile. Even for a stub, the right habits start now. The label can become a real translation key in Day 5.
- **The `Readonly<{...}>` on the layout's props is a small drive-by.** SonarLint flagged it in `Day_11` for new code; the layout was older code. Decided to bring it in line because the file was already being touched (for the import). Other Day 2 files that still need this treatment (`(auth)/layout.tsx`, `(auth)/sign-in/page.tsx`, `(app)/page.tsx`) will get a focused cleanup commit later — not bundled here.
