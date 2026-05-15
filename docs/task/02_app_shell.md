# Task 02 — App Shell (Route Groups, Layouts, Loading & Error Boundaries)

> **Started:** 2026-05-11
> **Completed:** _TBD_
> **Status:** 🔄 In Progress
> **Phase:** 1 — Foundations

---

## 🎯 Goal

Turn the single-page Day 1 scaffold into a **real app shell**: route groups for `(auth)` and `(app)`, a shared header/nav layout, top-level `loading.tsx` skeleton, root `error.tsx` boundary, and the first **Client Component island** (the theme/menu toggle stub). This is where the App Router's file conventions stop being slides and start being code we use every day for the rest of the build.

By the end of Day 2 we should be able to navigate `/` → `/sign-in` → `/trips` with `<Link>`, see a streamed skeleton on slow loads, and have a working error boundary catch a deliberately-thrown error.

---

## 📖 User Story

> As a senior React dev moving from Pages Router to App Router, I want to feel — in real code I wrote — the difference between a Server Component layout, a Client Component island, a `loading.tsx` segment, and an `error.tsx` boundary, so that future-day features (forms, auth, data fetching) slot into a mental model I trust.

---

## ✅ Acceptance Criteria

- [ ] `app/(app)/layout.tsx` — Server Component, renders a header with brand + nav `<Link>`s
- [ ] `app/(auth)/layout.tsx` — Server Component, minimal centered shell (no header)
- [ ] `app/(app)/trips/page.tsx` — placeholder trips list page, Server Component
- [ ] `app/(auth)/sign-in/page.tsx` — placeholder sign-in page, Server Component
- [ ] `app/loading.tsx` — root-level skeleton, visible during route transitions
- [ ] `app/error.tsx` — root-level error boundary, **Client Component** (`"use client"`)
- [ ] At least one **Client Component island** (e.g. `components/theme-toggle.tsx`) imported from a Server Component layout
- [ ] `<Link>` navigation between `/`, `/sign-in`, `/trips` works without full reload (no flash, URL updates)
- [ ] TypeScript strict passes (`pnpm typecheck`)
- [ ] `pnpm lint` passes
- [ ] `pnpm dev` runs cleanly — Day 1 endpoints (`/`, `/api/health`) still respond
- [ ] **DEFERRED to Day 3:** real styled header (currently raw Tailwind, no design tokens yet)
- [ ] **DEFERRED to Day 5:** localized strings
- [ ] **DEFERRED to Day 7:** real sign-in form (Day 2's `/sign-in` is a stub)

---

## 🛠️ Tech Decisions

### Decision 1: Route groups `(auth)` and `(app)` from Day 2

- **Why:** Two **distinct shells** — auth pages are centered, no nav; app pages have the header + nav. Route groups (folders wrapped in parentheses) let us share a layout across a set of routes **without** adding a URL segment. `(auth)/sign-in` still resolves to `/sign-in`.
- **Alternatives considered:** Single root layout with conditional rendering based on `pathname` — rejected; that forces a Client Component at the root (needs `usePathname`) and defeats the whole RSC pitch.
- **Trade-offs:** Adds two more folders to the tree on Day 2. Worth it — the cost compounds the other way if we wait.

### Decision 2: `error.tsx` is a Client Component

- **Why:** Per Next.js docs, `error.tsx` MUST start with `"use client"`. The error boundary needs to attach to the React tree in the browser to catch render errors. Forgetting this is a top-3 App Router footgun.
- **Alternatives:** None — this is a framework requirement.
- **Trade-offs:** A small bundle ships for the error UI. Unavoidable and tiny.

### Decision 3: `loading.tsx` at the **root**, not per-segment, for Day 2

- **Why:** One root `loading.tsx` covers every route transition with a generic skeleton. Per-segment `loading.tsx` files come later (Day 4 list, Day 6 trip detail) when we have real loading shapes worth tailoring.
- **Alternatives:** Suspense boundaries in each page — rejected; `loading.tsx` is the Next.js-idiomatic way and integrates with the router's streaming.
- **Trade-offs:** Generic skeleton may flash on fast transitions. Acceptable for Day 2.

### Decision 4: First Client Component is a **theme-toggle stub**, not a real toggle

- **Why:** We need to *cross the Server/Client boundary* once to internalize the rule. A stub `<button onClick={() => alert("Day 3 will wire this up")}>🌓</button>` is enough — proves `"use client"` works, proves the import chain works, proves we can render it inside a Server Component layout.
- **Alternatives:** Wait for Day 3 to add a real toggle — rejected; we'd never *feel* the boundary on Day 2.
- **Trade-offs:** Throwaway code. Fine — Day 3 deletes ~5 lines.

### Decision 5: No `(auth)` route group page beyond `sign-in` for now

- **Why:** YAGNI. Day 7 adds `/sign-up`, `/forgot-password`. Day 2 only needs to prove the route-group pattern works with **one** auth page.
- **Alternatives:** Pre-create empty `sign-up`, `forgot-password` shells — rejected; dead files rot.
- **Trade-offs:** Day 7 will create three new files at once instead of just filling stubs. Cheaper than maintaining stubs.

---

## 📋 Implementation Plan

**Revised 2026-05-14 (during `Day_04`).** The original plan had 4 coarse commits; this expanded plan ships **12 fine commits** so each one teaches exactly one App Router concept. Pattern: **doc-first** (the learning doc for a concept lands as its own commit *before* the code commit that applies it). Lets the reader walk `git log` step-by-step as a Day 2 tutorial.

| # | Commit | Type | Teaches |
|---|---|---|---|
| 1 | `Day_04_Add_rsc_vs_client_components_learning_doc` | docs | The Server/Client boundary rule |
| 2 | `Day_05_Add_layouts_and_templates_learning_doc` | docs | Nested layouts + route groups syntax |
| 3 | `Day_06_Add_app_route_group_and_move_home_page` | code | Route groups don't add URL segments |
| 4 | `Day_07_Add_auth_route_group_and_sign_in_stub` | code | A *second* shell via a second group |
| 5 | `Day_08_Add_header_with_link_navigation_in_app_layout` | code | `<Link>` typed routes + client-side nav |
| 6 | `Day_09_Add_loading_and_error_files_learning_doc` | docs | `loading.tsx` / `error.tsx` / streaming |
| 7 | `Day_10_Add_root_loading_skeleton` | code | `loading.tsx` as auto-Suspense boundary |
| 8 | `Day_11_Add_root_error_boundary_and_boom_trigger` | code | `error.tsx` must be Client; `reset()` |
| 9 | `Day_12_Add_theme_toggle_client_component_island` | code | Client Component inside Server layout |
| 10 | `Day_13_Add_metadata_api_learning_doc` | docs | `metadata` + `generateMetadata` |
| 11 | `Day_14_Add_per_page_metadata_exports` | code | Apply metadata API across all pages |
| 12 | `Day_15_Close_day_2_and_flip_progress_tracker` | docs | Day 2 retro + tracker flip to ✅ |

**Ordering rationale:** the single hard constraint is that `app/page.tsx` and `app/(app)/page.tsx` cannot coexist (both resolve to `/` → build error). The move happens atomically inside `Day_06`. `error.tsx` requires `"use client"` — that's why the boundary-rule doc (`Day_04`) precedes any code. `<Link href="/trips">` requires the trips page to exist — both land in the same commit (`Day_08`). No middle commit leaves the repo broken.

**Build-error trap matrix** — what would break if commits land out of order:

| Wrong order | Symptom |
|---|---|
| Create `app/(app)/page.tsx` without moving `app/page.tsx` in the same commit | `Error: You cannot have two parallel pages that resolve to the same path` |
| `error.tsx` without `"use client"` | Next dev overlay: "error.tsx must be a Client Component" |
| Theme-toggle without `"use client"` | Hydration mismatch / `onClick is not a function` at SSR |
| `<Link href="/trips">` before `app/(app)/trips/page.tsx` exists | TS error from `experimental.typedRoutes` + 404 at runtime |
| Per-page `metadata` before reader sees the doc | Code works, learning gap |

The 12-commit ordering above prevents all five.

---

## 🧠 Concepts Used (Links to Learning Docs)

To be written across Commits A–D:
- `docs/learning/day2_rsc_vs_client_components.md` — when to add `"use client"`, the boundary rule, what crosses (props yes, functions no)
- `docs/learning/day2_layouts_and_templates.md` — nested layouts, route groups `(auth)`/`(app)`, layout vs template
- `docs/learning/day2_loading_and_error_files.md` — `loading.tsx`, `error.tsx`, streaming, `reset()`

---

## 📁 Files Created / Modified

**This task creates:**
- `docs/task/02_app_shell.md` — this file
- `app/(app)/layout.tsx`, `app/(app)/trips/page.tsx`
- `app/(auth)/layout.tsx`, `app/(auth)/sign-in/page.tsx`
- `app/loading.tsx`, `app/error.tsx`
- `components/theme-toggle.tsx`
- `docs/learning/day2_*.md` (3 files)

**This task modifies:**
- `app/page.tsx` — possibly moved into `(app)` group (see Gotchas)
- `docs/README.md` — Task Journal entry + Day 2 tracker flip

---

## 💻 Code Highlights (preview — actual code lands in commits)

```tsx
// app/(app)/layout.tsx — Server Component
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <Link href="/" className="font-semibold">Buddies</Link>
        <nav className="flex gap-4">
          <Link href="/trips">Trips</Link>
          <Link href="/sign-in">Sign in</Link>
          <ThemeToggle />
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

```tsx
// app/error.tsx — Client Component (REQUIRED)
"use client";

export default function RootError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

## 🧪 How I'll Test It

Per commit:
- `pnpm typecheck` — no TS errors
- `pnpm lint` — no warnings
- `pnpm dev` → click through all routes, watch Network tab (no full reloads), watch console (no hydration warnings)
- `pnpm build` → inspect `.next/` output to confirm Client Components are isolated to their bundle

---

## 🐛 Bugs Encountered During This Task

_(To be filled in as we go. If `(app)/page.tsx` conflicts with `app/page.tsx`, that becomes Bug 02.)_

---

## ⚠️ Gotchas / Open Questions

1. **`app/page.tsx` vs `app/(app)/page.tsx`** — can both exist? **No** — route groups don't add a segment, so `app/page.tsx` and `app/(app)/page.tsx` both resolve to `/` and Next.js will throw a build error. **Decision needed in Commit A:** either move `app/page.tsx` into `(app)`, or keep `/` outside the `(app)` shell (landing page with no header). Leaning toward **move it in** — Day 1's page becomes the trips dashboard landing, gets the nav header for free.
2. **`error.tsx` doesn't catch errors in the layout it's a sibling of** — error boundaries only catch errors in *children* of the segment. Root `error.tsx` catches everything below `app/layout.tsx` but **not** errors in `app/layout.tsx` itself. For that we'd need `app/global-error.tsx` — deferred unless we hit it.
3. **Hydration warnings** are the #1 first-time-Client-Component issue. If the theme-toggle renders different content on server vs client (e.g. reading `localStorage`), React screams. Day 2's stub avoids this by being fully static.

---

## ➡️ What's Next? (Follow-ups)

- **Day 3 — Tailwind & Theme System:** real design tokens, wire up the theme toggle stub to actually toggle, semantic colors, FOUC prevention via cookies.
- **Day 4 — Forms & Server Actions:** the trips list gets a real "Create Trip" modal; we feel `<form action={serverAction}>` for the first time.
- **Day 6 — Prisma + MongoDB:** trips list page swaps hardcoded array for `await db.trip.findMany()` in a Server Component.
