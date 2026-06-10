# Task 02 — App Shell (Route Groups, Layouts, Loading & Error Boundaries)

> **Started:** 2026-05-11
> **Completed:** 2026-06-10
> **Status:** ✅ Done
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

- **Day 3 — Tailwind & Theme System:** real design tokens, wire up the theme toggle stub to actually toggle, semantic colors, FOUC prevention via cookies. Also picks up the a11y polish bucket accumulated across Day_25/Day_26/Day_28 (focus-visible rings, contrast on `text-neutral-500`, `aria-describedby` on hints).
- **Day 4 — Forms & Server Actions:** the trips list gets a real "Create Trip" modal; we feel `<form action={serverAction}>` for the first time (deeper than the auth Server Actions from Day_25/Day_26).
- **Day 6 — Prisma + MongoDB:** trips list page swaps hardcoded array for `await db.trip.findMany()` in a Server Component. Foundation already wired by Auth Detour `Day_15`–`Day_18`.

---

## 📓 Retrospective (2026-06-10, after Auth Detour closed in `Day_36`)

Day 2 took a much longer path than originally planned. The original 12-commit Day-2 plan (Day_04 → Day_15) was on track at `Day_14_Add_per_page_metadata_exports` — 11 of 12 commits done, one docs-only close-out remaining — when the user paused and asked for full production auth before stamping Day 2 done. The close-out (`Day_15_Close_day_2_and_flip_progress_tracker`) was deferred into a 22-commit Auth Detour (Day_15 → Day_36) that pulled forward Day 6 (Prisma + MongoDB, partial) and Day 7 (Better Auth, fully). This task doc's tracker row stays "Day 2" but its actual close-out commit became `Day_36_Close_auth_detour_and_resume_day_2`.

### Surprises worth remembering

1. **The route-group / `app/page.tsx` move is atomic for a reason.** In `Day_06_Add_app_route_group_and_move_home_page`, creating `app/(app)/page.tsx` *before* moving the existing `app/page.tsx` would make Next refuse to build (`You cannot have two parallel pages that resolve to the same path`). The whole commit had to land as one `git mv` + new `(app)/layout.tsx` together. Documented in the Day_05 layouts learning doc beforehand; build never broke.

2. **`error.tsx` MUST be a Client Component.** The Next.js dev overlay tells you so the moment you forget. Caught in advance via `Day_09_Add_loading_and_error_files_learning_doc` — the doc spelled out the requirement, so `Day_11`'s commit shipped it right the first time.

3. **The theme-toggle hydration risk was avoided by keeping the stub fully static.** A real `localStorage`-reading toggle would have caused server-vs-client mismatches; Day_12 deferred that to Day 3. The stub demonstrates the Server / Client boundary without paying for hydration debugging.

4. **Better Auth 1.6.14's kysely-adapter break.** In `Day_23_Add_better_auth_api_route_handler`, `pnpm build` failed with `'DEFAULT_MIGRATION_TABLE' is not exported from 'kysely'` — a real bug in the package's transitive build. Fix: mark `better-auth` as `serverComponentsExternalPackages` in `next.config.mjs`. The fix is small but documented in `Day_23`'s plan so future-us doesn't relearn it.

5. **Lazy-init pattern saved both Resend (Day_32) and Google OAuth (Day_35).** Both libraries' configs were being evaluated at module load, which broke `pnpm build` whenever credentials weren't set. The `?? ""` lazy fallback (Google) and `let resend: Resend | null` lazy-getter (Resend) both move the failure from build-time to runtime. CI still passes; missing creds surface as clear errors only when a user actually tries the relevant sign-in path.

6. **Layout-guard, not middleware.** Day_29's doc made the case explicitly: Prisma + MongoDB is Node-only; Edge Middleware can't run our session check without a round-trip through our own API. The layout-guard ships in 2 lines (`if (!session) redirect("/sign-in")`) inside `app/(app)/layout.tsx`, composes with route groups, and has no second source of truth.

### Coverage shipped

- 4 Day-2 learning docs (`day2_rsc_vs_client_components`, `day2_layouts_and_templates`, `day2_loading_and_error_files`, `day2_metadata_api`).
- 2 Day-6 docs (Prisma + MongoDB foundation; Trip CRUD doc deferred to Day 6 proper).
- 7 Day-7 docs (Better Auth overview, install, email/password flow, session reads, protecting pages, Resend for magic-link, Google OAuth extension).
- Working `/sign-up`, `/sign-in` (3 options: password, magic-link, Google), `/trips` (gated), sign-out, header session state, `(app)` route protection.
- 4 Atlas collections: `user`, `session`, `account`, `verification`. 5 indexes including 2 unique (email, session token).
- 1 production-style fix (`Fix_01_Repair_prisma_client_typecheck_in_ci`) for the `@prisma/client`-needs-at-least-one-model CI failure.

### Acceptance criteria (final pass)

- ✅ `app/(app)/layout.tsx` — Server Component with header + nav `<Link>`s (Day_08), session-aware (Day_28), redirect-on-no-session (Day_30).
- ✅ `app/(auth)/layout.tsx` — centered shell, no header (Day_07).
- ✅ `app/(app)/trips/page.tsx` — placeholder trips list (Day_08).
- ✅ `app/(auth)/sign-in/page.tsx` — three auth options (Day_26 password, Day_32 magic-link, Day_35 Google).
- ✅ `app/loading.tsx` — root skeleton (Day_10).
- ✅ `app/error.tsx` — root error boundary, Client Component (Day_11).
- ✅ Client Component island via `components/theme-toggle.tsx` rendered in the Server layout (Day_12).
- ✅ `<Link>` navigation, no full reloads (Day_08).
- ✅ TypeScript strict + `pnpm lint` pass on every commit.
- ✅ `pnpm dev` runs cleanly; Day 1 endpoints (`/`, `/api/health`) still respond.
- ⏭️ **Resolved during Auth Detour:** "Real sign-in form" was originally deferred to Day 7; now done.
- ⏭️ **Still deferred to Day 3:** real styled header with design tokens; a11y polish (focus rings, contrast).
- ⏭️ **Still deferred to Day 5:** localized strings.
